import { createMemoryHistory, createRouter, createWebHistory } from '@ionic/vue-router'
import TabsLayout from './TabsLayout.vue'

export const router = createRouter({
  // в превью-сборке адресной строки нет — маршрут храним в памяти
  history: import.meta.env.VITE_MEMORY_HISTORY ? createMemoryHistory() : createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/catalog' },
    {
      path: '/',
      component: TabsLayout,
      children: [
        { path: 'catalog', component: () => import('./CatalogPage.vue') },
        { path: 'cart', component: () => import('./CartRoute.vue') },
      ],
    },
  ],
})
