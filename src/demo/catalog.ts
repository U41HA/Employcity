import { rub, type Product, type Promo } from '../modules/cart/domain/cart'

/** Демо-данные каталога кофейни. В реальном приложении приходят из API. */
export const products: readonly Product[] = [
  { id: 'espresso', name: 'Эспрессо', price: rub(150), stock: 20 },
  { id: 'cappuccino', name: 'Капучино', price: rub(220), stock: 15 },
  { id: 'latte', name: 'Латте', price: rub(250), stock: 5 },
  { id: 'raf', name: 'Раф ванильный', price: rub(290), stock: 8 },
  { id: 'croissant', name: 'Круассан', price: rub(180.5), stock: 2 },
  { id: 'cheesecake', name: 'Чизкейк', price: rub(320), stock: 0 },
]

export const catalog: ReadonlyMap<string, Product> = new Map(products.map((p) => [p.id, p]))

export const promos: readonly Promo[] = [
  { code: 'COFFEE10', percent: 10, maxDiscount: rub(300), minSubtotal: rub(500) },
]

/** Витринные данные, которые не нужны домену корзины: иконка и короткое описание. */
export const productMeta: Readonly<Record<string, { icon: 'cup' | 'dessert'; note: string }>> = {
  espresso: { icon: 'cup', note: '30 мл, плотный и бодрый' },
  cappuccino: { icon: 'cup', note: '250 мл, густая пенка' },
  latte: { icon: 'cup', note: '350 мл, 90% молока' },
  raf: { icon: 'cup', note: '300 мл, сливки и ваниль' },
  croissant: { icon: 'dessert', note: 'Сливочное масло, хруст' },
  cheesecake: { icon: 'dessert', note: 'Нью-Йорк, нежный' },
}
