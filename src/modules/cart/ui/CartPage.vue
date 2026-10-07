<script setup lang="ts">
import {
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonPage,
  IonTitle,
  IonToolbar,
  onIonViewWillEnter,
  toastController,
} from '@ionic/vue'
import { computed, ref, watch } from 'vue'
import CafeIcon from '../../../shared/ui/CafeIcon.vue'
import HandCheck from '../../../shared/ui/HandCheck.vue'
import { useCartStore } from '../application/cart.store'
import { formatMoney, isDiscountCapped, type CartError, type Product, type Promo } from '../domain/cart'
import QuantityStepper from './QuantityStepper.vue'

const props = defineProps<{
  catalog: ReadonlyMap<string, Product>
  resolvePromo: (code: string) => Promo | null
}>()
const emit = defineEmits<{ checkout: []; browse: [] }>()

const cart = useCartStore()

const productOf = (id: string) => props.catalog.get(id)

const toast = async (message: string) => {
  const t = await toastController.create({ message, duration: 2500, position: 'top' })
  await t.present()
}

const errorText = (error: CartError) =>
  error.kind === 'out_of_stock' ? `В наличии только ${error.available} шт.` : 'Некорректное количество'

watch(
  () => cart.lastError,
  (error) => {
    if (error) void toast(errorText(error))
  },
)

// при каждом открытии экрана сверяемся с каталогом: цены и остатки могли измениться
onIonViewWillEnter(() => {
  if (cart.syncCatalog(props.catalog).length) void toast('Цены или наличие некоторых товаров изменились')
})

const changeQuantity = (productId: string, quantity: number) => {
  const product = productOf(productId)
  if (product) cart.update(product, quantity)
}

// ---- промокод ----
const promoInput = ref('')
const promoError = ref('')

const promoBelowThreshold = computed(
  () => cart.promo !== null && cart.totals.discount === 0 && cart.totals.subtotal < cart.promo.minSubtotal,
)

const promoCapped = computed(() => isDiscountCapped(cart.totals, cart.promo))

const applyPromo = () => {
  const code = promoInput.value.trim().toUpperCase()
  if (!code) return
  const promo = props.resolvePromo(code)
  promoError.value = promo ? '' : 'Такого промокода нет'
  if (promo) {
    cart.applyPromo(promo)
    promoInput.value = ''
  }
}
</script>

<template>
  <IonPage>
    <IonHeader class="ion-no-border">
      <IonToolbar>
        <IonTitle>Корзина</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent>
      <div class="cart">
        <section v-if="cart.cart.lines.length === 0" class="cafe-card empty">
          <CafeIcon name="bag" :size="44" />
          <p class="empty__title">Пока пусто</p>
          <p class="empty__text">Загляните в меню — латте сам себя не выпьет.</p>
          <IonButton class="cafe-button" @click="emit('browse')">Открыть меню</IonButton>
        </section>

        <template v-else>
          <ul class="lines" aria-label="Товары в корзине">
            <li v-for="line in cart.cart.lines" :key="line.productId">
              <IonItemSliding class="cafe-card line">
                <IonItem lines="none" class="line__item">
                  <div class="line__body">
                    <div class="line__info">
                      <span class="line__name">{{ line.name }}</span>
                      <span class="cafe-price">{{ formatMoney(line.unitPrice) }}</span>
                    </div>
                    <QuantityStepper
                      :label="`Количество: ${line.name}`"
                      :value="line.quantity"
                      :max="productOf(line.productId)?.stock ?? line.quantity"
                      @change="(q) => changeQuantity(line.productId, q)"
                    />
                  </div>
                </IonItem>
                <IonItemOptions side="end">
                  <IonItemOption color="danger" expandable @click="cart.remove(line.productId)">Удалить</IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            </li>
          </ul>
          <p class="hint">Смахните позицию влево, чтобы удалить</p>

          <h2 class="cafe-section-title">Промокод</h2>
          <section class="cafe-card promo">
            <div v-if="cart.promo" class="promo__applied">
              <HandCheck :checked="true" />
              <div class="promo__text">
                <strong>{{ cart.promo.code }}</strong>
                <span v-if="promoBelowThreshold"
                  >Скидка начнёт действовать от {{ formatMoney(cart.promo.minSubtotal) }}</span
                >
                <span v-else-if="promoCapped"
                  >Скидка {{ cart.promo.percent }}%, но не больше {{ formatMoney(cart.promo.maxDiscount) }} — максимум
                  достигнут</span
                >
                <span v-else>Скидка {{ cart.promo.percent }}% применена</span>
              </div>
              <button type="button" class="promo__remove" @click="cart.applyPromo(null)">Убрать</button>
            </div>
            <form v-else class="promo__form" @submit.prevent="applyPromo">
              <label class="visually-hidden" for="promo-code">Промокод</label>
              <input
                id="promo-code"
                v-model="promoInput"
                class="promo__input"
                placeholder="Код со скидкой"
                autocapitalize="characters"
                autocomplete="off"
                :aria-invalid="promoError ? 'true' : undefined"
                aria-describedby="promo-error"
              />
              <button type="submit" class="promo__apply" :disabled="!promoInput.trim()">Применить</button>
            </form>
            <p v-if="promoError && !cart.promo" id="promo-error" class="promo__error" role="alert">{{ promoError }}</p>
          </section>
        </template>
      </div>
    </IonContent>

    <IonFooter v-if="cart.totals.itemsCount > 0" class="ion-no-border">
      <div class="cafe-card summary">
        <div class="summary__row">
          <span>Товары, {{ cart.totals.itemsCount }} шт.</span>
          <span>{{ formatMoney(cart.totals.subtotal) }}</span>
        </div>
        <div v-if="cart.totals.discount > 0" class="summary__row summary__row--discount">
          <span>Скидка по {{ cart.promo?.code }}</span>
          <span>−{{ formatMoney(cart.totals.discount) }}</span>
        </div>
        <IonButton class="cafe-button" expand="block" @click="emit('checkout')">
          Оформить за {{ formatMoney(cart.totals.total) }}
        </IonButton>
      </div>
    </IonFooter>
  </IonPage>
</template>

<style scoped>
.cart {
  padding: 4px 16px 24px;
}
.lines {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.line {
  overflow: hidden;
}
.line__item {
  --background: var(--cafe-cream);
  --padding-start: 16px;
  --inner-padding-end: 12px;
  --min-height: 72px;
}
.line__body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 12px 0;
}
.line__info {
  display: grid;
  gap: 2px;
  min-width: 0;
}
.line__name {
  overflow: hidden;
  font-size: 17px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}
ion-item-option {
  font-weight: 800;
}
.hint {
  margin: 10px 4px 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--cafe-ink-soft);
}
.promo {
  padding: 14px 16px;
}
.promo__form {
  display: flex;
  gap: 10px;
}
.promo__input {
  flex: 1;
  min-width: 0;
  height: 44px;
  padding: 0 14px;
  font: inherit;
  font-weight: 700;
  color: var(--cafe-ink);
  background: var(--cafe-on-dark);
  border: 2px solid var(--cafe-line);
  border-radius: 12px;
  outline: none;
}
.promo__input:focus-visible {
  border-color: var(--cafe-ink);
}
.promo__input[aria-invalid='true'] {
  border-color: var(--cafe-red);
}
.promo__apply,
.promo__remove {
  padding: 0 16px;
  font: inherit;
  font-weight: 900;
  border: 0;
  border-radius: 12px;
  cursor: pointer;
}
.promo__apply {
  height: 44px;
  color: var(--cafe-on-dark);
  background: var(--cafe-ink);
  box-shadow: 0 3px 0 var(--cafe-press-shadow);
}
.promo__apply:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.promo__applied {
  display: flex;
  align-items: center;
  gap: 12px;
}
.promo__text {
  display: grid;
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: var(--cafe-text-secondary);
}
.promo__text strong {
  font-size: 16px;
  font-weight: 900;
  color: var(--cafe-ink);
}
.promo__remove {
  height: 34px;
  color: var(--cafe-red);
  background: transparent;
}
.promo__error {
  margin: 8px 2px 0;
  font-size: 13px;
  font-weight: 800;
  color: var(--cafe-red);
}
.empty {
  display: grid;
  justify-items: center;
  gap: 4px;
  margin-top: 24px;
  padding: 32px 20px 22px;
  text-align: center;
}
.empty__title {
  margin: 8px 0 0;
  font-size: 22px;
  font-weight: 900;
}
.empty__text {
  margin: 0 0 16px;
  font-weight: 600;
  color: var(--cafe-text-secondary);
}
ion-footer {
  background: transparent;
}
.summary {
  margin: 0 16px 12px;
  padding: 16px;
}
.summary__row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 800;
}
.summary__row--discount {
  color: var(--cafe-red);
}
.summary .cafe-button {
  margin-top: 6px;
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
