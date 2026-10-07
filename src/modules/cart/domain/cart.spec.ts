import { describe, expect, it } from 'vitest'
import {
  addToCart,
  calculateTotals,
  emptyCart,
  formatMoney,
  isDiscountCapped,
  rub,
  setQuantity,
  syncWithCatalog,
  type Product,
} from './cart'

const latte: Product = { id: 'latte', name: 'Латте', price: rub(250), stock: 5 }
const croissant: Product = { id: 'croissant', name: 'Круассан', price: rub(180.5), stock: 2 }

describe('cart domain', () => {
  it('добавляет товар и увеличивает количество существующей позиции', () => {
    let result = addToCart(emptyCart(), latte)
    if (!result.ok) throw new Error('unexpected')
    result = addToCart(result.cart, latte, 2)
    expect(result).toEqual({
      ok: true,
      cart: { lines: [expect.objectContaining({ productId: 'latte', quantity: 3 })] },
    })
  })

  it('не даёт положить больше, чем есть в наличии', () => {
    expect(addToCart(emptyCart(), croissant, 3)).toEqual({
      ok: false,
      error: { kind: 'out_of_stock', productId: 'croissant', available: 2 },
    })
  })

  it('не принимает отрицательное или дробное количество при добавлении', () => {
    expect(addToCart(emptyCart(), latte, -1)).toEqual({ ok: false, error: { kind: 'invalid_quantity', quantity: -1 } })
    expect(addToCart(emptyCart(), latte, 1.5)).toEqual({
      ok: false,
      error: { kind: 'invalid_quantity', quantity: 1.5 },
    })
  })

  it('setQuantity добавляет позицию, если её ещё нет в корзине', () => {
    expect(setQuantity(emptyCart(), latte, 2)).toEqual({
      ok: true,
      cart: { lines: [expect.objectContaining({ productId: 'latte', quantity: 2 })] },
    })
  })

  it('удаляет позицию при количестве 0', () => {
    const added = addToCart(emptyCart(), latte)
    if (!added.ok) throw new Error('unexpected')
    expect(setQuantity(added.cart, latte, 0)).toEqual({ ok: true, cart: { lines: [] } })
  })

  it('считает итоги в копейках без ошибок округления', () => {
    const cart = { lines: [{ productId: 'croissant', name: 'Круассан', unitPrice: rub(180.5), quantity: 2 }] }
    expect(calculateTotals(cart).subtotal).toBe(36100)
  })

  it('применяет промокод с порогом и потолком скидки', () => {
    const cart = { lines: [{ productId: 'latte', name: 'Латте', unitPrice: rub(250), quantity: 4 }] }
    const promo = { code: 'COFFEE10', percent: 10, maxDiscount: rub(80), minSubtotal: rub(500) }
    expect(calculateTotals(cart, promo)).toEqual({ itemsCount: 4, subtotal: 100000, discount: 8000, total: 92000 })
    expect(calculateTotals({ lines: [{ ...cart.lines[0], quantity: 1 }] }, promo).discount).toBe(0)
  })

  it('синхронизирует сохранённую корзину с актуальным каталогом', () => {
    const saved = {
      lines: [
        { productId: 'latte', name: 'Латте', unitPrice: rub(200), quantity: 1 },
        { productId: 'croissant', name: 'Круассан', unitPrice: rub(180.5), quantity: 5 },
        { productId: 'removed', name: 'Снят с продажи', unitPrice: rub(100), quantity: 1 },
      ],
    }
    const catalog = new Map([latte, croissant].map((p) => [p.id, p]))
    const { cart, changed } = syncWithCatalog(saved, catalog)
    expect(cart.lines).toEqual([
      expect.objectContaining({ productId: 'latte', unitPrice: rub(250), quantity: 1 }),
      expect.objectContaining({ productId: 'croissant', quantity: 2 }),
    ])
    expect(changed).toEqual(['latte', 'croissant', 'removed'])
  })

  it('честно сообщает, что скидка упёрлась в потолок', () => {
    const promo = { code: 'COFFEE10', percent: 10, maxDiscount: rub(300), minSubtotal: rub(500) }
    const small = calculateTotals(
      { lines: [{ productId: 'latte', name: 'Латте', unitPrice: rub(250), quantity: 4 }] },
      promo,
    )
    expect(small.discount).toBe(rub(100))
    expect(isDiscountCapped(small, promo)).toBe(false)
    const big = calculateTotals(
      { lines: [{ productId: 'latte', name: 'Латте', unitPrice: rub(250), quantity: 20 }] },
      promo,
    )
    expect(big.discount).toBe(rub(300))
    expect(isDiscountCapped(big, promo)).toBe(true)
  })

  it('форматирует цены без лишних копеек', () => {
    expect(formatMoney(rub(250)).replace(/\s/g, ' ')).toBe('250 ₽')
    expect(formatMoney(rub(180.5)).replace(/\s/g, ' ')).toBe('180,50 ₽')
  })
})
