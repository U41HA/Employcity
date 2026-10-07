<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue'
import CafeIcon from '../shared/ui/CafeIcon.vue'
import { useCartStore } from '../modules/cart/application/cart.store'
import { formatMoney, type Product } from '../modules/cart/domain/cart'
import { productMeta, products, promos } from '../demo/catalog'

const cart = useCartStore()
const promo = promos[0]

const isMaxed = (p: Product) => cart.quantityOf(p.id) >= p.stock

const tileLabel = (p: Product) => {
  const inCart = cart.quantityOf(p.id)
  if (p.stock === 0) return `${p.name}, нет в наличии`
  const base = `${p.name}, ${formatMoney(p.price)}`
  if (isMaxed(p)) return `${base}. В корзине ${inCart} — больше нет в наличии`
  return inCart ? `${base}. В корзине ${inCart}, добавить ещё` : `${base}. Добавить в корзину`
}
</script>

<template>
  <IonPage>
    <IonHeader class="ion-no-border">
      <IonToolbar>
        <IonTitle>Меню</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent>
      <div class="catalog">
        <section class="cafe-card intro">
          <p>Варим на зерне средней обжарки, молоко — фермерское. Заберите заказ у стойки через 10 минут.</p>
          <dl v-if="promo" class="intro__facts">
            <div>
              <dt>Промокод</dt>
              <dd>{{ promo.code }}</dd>
            </div>
            <div>
              <dt>Скидка</dt>
              <dd>{{ promo.percent }}%, до {{ formatMoney(promo.maxDiscount) }}</dd>
            </div>
            <div>
              <dt>Заказ от</dt>
              <dd>{{ formatMoney(promo.minSubtotal) }}</dd>
            </div>
          </dl>
        </section>

        <h2 class="cafe-section-title">Сегодня в меню</h2>

        <ul class="tiles">
          <li v-for="product in products" :key="product.id">
            <button
              type="button"
              class="tile"
              :class="{ 'tile--soldout': product.stock === 0 }"
              :disabled="isMaxed(product)"
              :aria-label="tileLabel(product)"
              @click="cart.add(product)"
            >
              <span class="tile__top">
                <CafeIcon :name="productMeta[product.id]?.icon ?? 'cup'" :size="30" />
                <span class="tile__name">{{ product.name }}</span>
              </span>
              <span class="tile__note">{{ product.stock === 0 ? 'Закончился' : productMeta[product.id]?.note }}</span>
              <span class="tile__bottom">
                <span class="tile__add" aria-hidden="true">{{
                  isMaxed(product) && product.stock > 0 ? 'макс' : '+'
                }}</span>
                <span class="tile__price">{{ formatMoney(product.price) }}</span>
              </span>
              <span v-if="cart.quantityOf(product.id)" class="tile__count" aria-hidden="true">{{
                cart.quantityOf(product.id)
              }}</span>
            </button>
          </li>
        </ul>
      </div>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.catalog {
  padding: 4px 16px 24px;
}
.intro {
  padding: 18px 20px;
}
.intro p {
  margin: 0 0 14px;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.45;
}
.intro__facts {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 24px;
  margin: 0;
}
.intro__facts dt {
  font-size: 11px;
  font-weight: 800;
  color: var(--cafe-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.intro__facts dd {
  margin: 4px 0 0;
  font-weight: 800;
}
.tiles {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.tiles > li {
  display: flex;
}
.tile {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 0;
  overflow: hidden;
  font: inherit;
  color: inherit;
  text-align: left;
  background: var(--cafe-ink);
  border: 0;
  border-radius: 16px;
  box-shadow: var(--cafe-shadow-tile);
  cursor: pointer;
  transition:
    transform 0.08s ease,
    box-shadow 0.08s ease;
}
.tile:active:not(:disabled) {
  transform: translateY(3px);
  box-shadow:
    0 2px 0 rgb(0 0 0 / 18%),
    0 6px 12px rgb(91 60 0 / 18%);
}
.tile:focus-visible {
  outline: 3px solid var(--cafe-red);
  outline-offset: 3px;
}
.tile__top {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 12px 4px;
  background: var(--cafe-cream);
}
.tile__name {
  font-size: 16px;
  font-weight: 900;
  line-height: 1.15;
}
.tile__note {
  flex: 1;
  min-height: 34px;
  padding: 2px 12px 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--cafe-ink-soft);
  background: var(--cafe-cream);
  border-radius: 0 0 14px 14px;
}
.tile__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px 9px;
  color: #fff;
}
.tile__add {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  font-size: 18px;
  font-weight: 900;
  line-height: 1;
  color: var(--cafe-ink);
  background: var(--cafe-yellow);
  border-radius: 8px;
}
.tile:disabled .tile__add {
  width: auto;
  padding: 0 6px;
  font-size: 11px;
}
.tile__price {
  font-size: 15px;
  font-weight: 900;
}
.tile__count {
  position: absolute;
  top: 8px;
  right: 8px;
  display: grid;
  place-items: center;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  font-size: 13px;
  font-weight: 900;
  color: #fff;
  background: var(--cafe-red);
  border-radius: 12px;
  box-shadow: 0 2px 0 #b8322a;
}
.tile--soldout {
  opacity: 0.55;
}
.tile--soldout .tile__add {
  display: none;
}
.tile:disabled {
  cursor: not-allowed;
}
</style>
