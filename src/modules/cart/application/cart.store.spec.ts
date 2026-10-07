import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { rub, type Product } from '../domain/cart'
import { useCartStore } from './cart.store'

const storage = new Map<string, string>()
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(({ key }: { key: string }) => Promise.resolve({ value: storage.get(key) ?? null })),
    set: vi.fn(({ key, value }: { key: string; value: string }) => Promise.resolve(void storage.set(key, value))),
    remove: vi.fn(({ key }: { key: string }) => Promise.resolve(void storage.delete(key))),
  },
}))

const latte: Product = { id: 'latte', name: 'Латте', price: rub(250), stock: 5 }
const catalog = new Map([[latte.id, latte]])

describe('cart store', () => {
  beforeEach(() => {
    storage.clear()
    setActivePinia(createPinia())
  })

  it('восстанавливает корзину из хранилища и пересчитывает цены', async () => {
    storage.set(
      'cart:v1',
      JSON.stringify({ lines: [{ productId: 'latte', name: 'Латте', unitPrice: rub(200), quantity: 2 }] }),
    )
    const store = useCartStore()
    const changed = await store.hydrate(catalog)
    expect(changed).toEqual(['latte'])
    expect(store.totals.total).toBe(rub(500))
  })

  it('сохраняет изменения после гидрации', async () => {
    const store = useCartStore()
    await store.hydrate(catalog)
    store.add(latte, 2)
    await nextTick()
    expect(JSON.parse(storage.get('cart:v1')!)).toEqual({ lines: [expect.objectContaining({ quantity: 2 })] })
  })

  it('сбрасывает повреждённые данные вместо падения', async () => {
    storage.set('cart:v1', '{broken')
    const store = useCartStore()
    await expect(store.hydrate(catalog)).resolves.toEqual([])
    expect(storage.has('cart:v1')).toBe(false)
  })

  it('отбрасывает строки неверной формы из хранилища', async () => {
    storage.set(
      'cart:v1',
      JSON.stringify({
        lines: [
          { productId: 'latte', name: 'Латте', unitPrice: rub(250), quantity: 1 },
          { productId: 'latte', name: 'Латте', unitPrice: '250', quantity: 1 },
          { productId: 'ghost', quantity: -3 },
        ],
      }),
    )
    const store = useCartStore()
    await store.hydrate(catalog)
    expect(store.cart.lines).toEqual([expect.objectContaining({ productId: 'latte', quantity: 1 })])
  })

  it('продолжает работать, если хранилище недоступно', async () => {
    const { Preferences } = await import('@capacitor/preferences')
    vi.mocked(Preferences.get).mockRejectedValueOnce(new Error('SecurityError'))
    const store = useCartStore()
    await expect(store.hydrate(catalog)).resolves.toEqual([])
    expect(store.add(latte)).toBe(true)
  })

  it('выставляет ошибку при превышении остатка', () => {
    const store = useCartStore()
    expect(store.add(latte, 6)).toBe(false)
    expect(store.lastError).toEqual({ kind: 'out_of_stock', productId: 'latte', available: 5 })
  })
})
