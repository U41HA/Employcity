/**
 * Domain: корзина. Чистые функции без Vue/Ionic — легко тестировать и переиспользовать на web и в мобильном клиенте.
 * Деньги храним в копейках (целые числа), чтобы не ловить ошибки округления float.
 */

export type Kopecks = number & { readonly __unit: 'kopecks' }
export const kopecks = (value: number) => Math.round(value) as Kopecks
export const rub = (value: number) => kopecks(value * 100)

export interface Product {
  readonly id: string
  readonly name: string
  readonly price: Kopecks
  readonly stock: number
}

export interface CartLine {
  readonly productId: string
  readonly name: string
  readonly unitPrice: Kopecks
  readonly quantity: number
}

export interface Cart {
  readonly lines: readonly CartLine[]
}

export const emptyCart = (): Cart => ({ lines: [] })

export type CartError =
  { kind: 'out_of_stock'; productId: string; available: number } | { kind: 'invalid_quantity'; quantity: number }

export type CartResult = { ok: true; cart: Cart } | { ok: false; error: CartError }

const MAX_PER_LINE = 99

const checkQuantity = (product: Product, quantity: number): CartError | null => {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_PER_LINE) {
    return { kind: 'invalid_quantity', quantity }
  }
  if (quantity > product.stock) return { kind: 'out_of_stock', productId: product.id, available: product.stock }
  return null
}

const isPositiveInteger = (value: number) => Number.isInteger(value) && value > 0

export const addToCart = (cart: Cart, product: Product, quantity = 1): CartResult => {
  // отрицательное «добавление» превратилось бы в скрытое уменьшение — для этого есть setQuantity
  if (!isPositiveInteger(quantity)) return { ok: false, error: { kind: 'invalid_quantity', quantity } }
  const existing = cart.lines.find((line) => line.productId === product.id)
  const nextQuantity = (existing?.quantity ?? 0) + quantity
  const error = checkQuantity(product, nextQuantity)
  if (error) return { ok: false, error }

  const lines = existing
    ? cart.lines.map((line) => (line.productId === product.id ? { ...line, quantity: nextQuantity } : line))
    : [...cart.lines, { productId: product.id, name: product.name, unitPrice: product.price, quantity }]
  return { ok: true, cart: { lines } }
}

export const setQuantity = (cart: Cart, product: Product, quantity: number): CartResult => {
  if (quantity === 0) return { ok: true, cart: removeFromCart(cart, product.id) }
  // позиции ещё нет — ведём себя как добавление, а не молча игнорируем вызов
  if (!cart.lines.some((line) => line.productId === product.id)) return addToCart(cart, product, quantity)
  const error = checkQuantity(product, quantity)
  if (error) return { ok: false, error }
  return {
    ok: true,
    cart: { lines: cart.lines.map((line) => (line.productId === product.id ? { ...line, quantity } : line)) },
  }
}

export const removeFromCart = (cart: Cart, productId: string): Cart => ({
  lines: cart.lines.filter((line) => line.productId !== productId),
})

/** Пересчёт цен по актуальному каталогу: цена в корзине могла устареть, пока приложение было офлайн. */
export const syncWithCatalog = (cart: Cart, catalog: ReadonlyMap<string, Product>) => {
  const changed: string[] = []
  const lines = cart.lines.flatMap((line) => {
    const product = catalog.get(line.productId)
    if (!product || product.stock === 0) {
      changed.push(line.productId)
      return []
    }
    const quantity = Math.min(line.quantity, product.stock)
    if (quantity !== line.quantity || product.price !== line.unitPrice) changed.push(line.productId)
    return [{ ...line, unitPrice: product.price, quantity }]
  })
  return { cart: { lines }, changed }
}

export interface Promo {
  readonly code: string
  readonly percent: number
  readonly maxDiscount: Kopecks
  readonly minSubtotal: Kopecks
}

export interface CartTotals {
  readonly itemsCount: number
  readonly subtotal: Kopecks
  readonly discount: Kopecks
  readonly total: Kopecks
}

export const calculateTotals = (cart: Cart, promo: Promo | null = null): CartTotals => {
  const itemsCount = cart.lines.reduce((sum, line) => sum + line.quantity, 0)
  const subtotal = kopecks(cart.lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0))
  const discount =
    promo && subtotal >= promo.minSubtotal
      ? kopecks(Math.min((subtotal * promo.percent) / 100, promo.maxDiscount))
      : kopecks(0)
  return { itemsCount, subtotal, discount, total: kopecks(subtotal - discount) }
}

const rubles = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 })
const rublesWithKopecks = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  minimumFractionDigits: 2,
})

/** 250 ₽ для целых рублей, 180,50 ₽ — когда есть копейки. */
export const formatMoney = (value: Kopecks) => (value % 100 === 0 ? rubles : rublesWithKopecks).format(value / 100)

/** Упёрлась ли скидка в потолок промокода — чтобы честно объяснить пользователю, почему не ровно N%. */
export const isDiscountCapped = (totals: CartTotals, promo: Promo | null) =>
  promo !== null && totals.discount > 0 && totals.discount === promo.maxDiscount
