import { Preferences } from '@capacitor/preferences'
import { defineStore } from 'pinia'
import { computed, ref, shallowRef, watch } from 'vue'
import {
  addToCart,
  calculateTotals,
  emptyCart,
  removeFromCart,
  setQuantity,
  syncWithCatalog,
  type Cart,
  type CartError,
  type Product,
  type Promo,
} from '../domain/cart'

const STORAGE_KEY = 'cart:v1'

/** Данные из хранилища не доверяем вслепую: проверяем форму, прежде чем класть в стор. */
const parseCart = (raw: string): Cart => {
  const data: unknown = JSON.parse(raw)
  const lines = (data as { lines?: unknown })?.lines
  if (!Array.isArray(lines)) throw new TypeError('Invalid cart payload')
  const valid = lines.filter(
    (l): l is Cart['lines'][number] =>
      typeof l?.productId === 'string' &&
      typeof l?.name === 'string' &&
      Number.isInteger(l?.unitPrice) &&
      Number.isInteger(l?.quantity) &&
      l.quantity > 0,
  )
  return { lines: valid }
}

/**
 * Application: корзина с офлайн-сохранением.
 * Capacitor Preferences работает и на iOS/Android (нативное хранилище), и в браузере (localStorage).
 */
export const useCartStore = defineStore('cart', () => {
  const cart = shallowRef<Cart>(emptyCart())
  const promo = ref<Promo | null>(null)
  const hydrated = ref(false)
  const lastError = ref<CartError | null>(null)

  const totals = computed(() => calculateTotals(cart.value, promo.value))
  const quantityOf = (productId: string) => cart.value.lines.find((l) => l.productId === productId)?.quantity ?? 0

  /** Сверка с актуальным каталогом: цены и остатки могли измениться, пока приложение было закрыто. */
  const syncCatalog = (catalog: ReadonlyMap<string, Product>) => {
    const result = syncWithCatalog(cart.value, catalog)
    if (result.changed.length) cart.value = result.cart
    return result.changed
  }

  /**
   * Восстанавливает корзину из хранилища. Вызывается один раз при старте приложения.
   * Недоступное или повреждённое хранилище не должно мешать запуску: работаем с пустой корзиной.
   */
  const hydrate = async (catalog: ReadonlyMap<string, Product>) => {
    if (hydrated.value) return []
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEY })
      if (value) cart.value = parseCart(value)
    } catch {
      await Preferences.remove({ key: STORAGE_KEY }).catch(() => undefined)
    }
    hydrated.value = true
    return syncCatalog(catalog) // id позиций, изменившихся в цене или наличии
  }

  // сохраняем только после гидрации, чтобы не перезаписать сохранённую корзину пустой
  watch(cart, (value) => {
    if (!hydrated.value) return
    Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(value) }).catch(() => {
      // хранилище недоступно (приватный режим) — корзина продолжает жить в памяти
    })
  })

  const apply = (result: ReturnType<typeof addToCart>) => {
    lastError.value = result.ok ? null : result.error
    if (result.ok) cart.value = result.cart
    return result.ok
  }

  const add = (product: Product, quantity = 1) => apply(addToCart(cart.value, product, quantity))
  const update = (product: Product, quantity: number) => apply(setQuantity(cart.value, product, quantity))
  const remove = (productId: string) => {
    cart.value = removeFromCart(cart.value, productId)
  }
  const applyPromo = (value: Promo | null) => {
    promo.value = value
  }

  return {
    cart,
    promo,
    totals,
    lastError,
    quantityOf,
    hydrate,
    syncCatalog,
    add,
    update,
    remove,
    applyPromo,
  }
})
