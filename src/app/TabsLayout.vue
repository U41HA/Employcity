<script setup lang="ts">
import { IonBadge, IonIcon, IonLabel, IonPage, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/vue'
import { cafeOutline, cartOutline } from 'ionicons/icons'
import { useCartStore } from '../modules/cart/application/cart.store'

const cart = useCartStore()
</script>

<template>
  <IonPage>
    <IonTabs>
      <IonRouterOutlet />
      <IonTabBar slot="bottom">
        <IonTabButton tab="catalog" href="/catalog">
          <IonIcon :icon="cafeOutline" aria-hidden="true" />
          <IonLabel>Меню</IonLabel>
        </IonTabButton>
        <IonTabButton tab="cart" href="/cart">
          <IonIcon :icon="cartOutline" aria-hidden="true" />
          <IonLabel>Корзина</IonLabel>
          <IonBadge v-if="cart.totals.itemsCount > 0" color="primary">{{ cart.totals.itemsCount }}</IonBadge>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  </IonPage>
</template>
