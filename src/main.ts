import { IonicVue } from '@ionic/vue'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import '@ionic/vue/css/padding.css'
import './app/theme.css'

import App from './app/App.vue'
import { router } from './app/router'
import { catalog } from './demo/catalog'
import { useCartStore } from './modules/cart/application/cart.store'

// единый вид на iOS и Android: у приложения собственная дизайн-система, платформенные стили Material не нужны
const app = createApp(App).use(IonicVue, { mode: 'ios' }).use(createPinia()).use(router)

// корзину восстанавливаем до первого рендера, чтобы не перетереть её изменениями из каталога
await useCartStore().hydrate(catalog)
await router.isReady()
app.mount('#app')
