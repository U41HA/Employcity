<script setup lang="ts">
import { toastController, useIonRouter } from '@ionic/vue'
import CartPage from '../modules/cart/ui/CartPage.vue'
import { catalog, promos } from '../demo/catalog'

const router = useIonRouter()

const resolvePromo = (code: string) => promos.find((p) => p.code === code) ?? null

const checkout = async () => {
  const t = await toastController.create({ message: 'Демо: здесь откроется оплата', duration: 2000, position: 'top' })
  await t.present()
}
</script>

<template>
  <CartPage
    :catalog="catalog"
    :resolve-promo="resolvePromo"
    @checkout="checkout"
    @browse="router.navigate('/catalog', 'back')"
  />
</template>
