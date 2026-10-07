<script setup lang="ts">
/** Линейные иконки в «рисованном» стиле: красная обводка, скруглённые концы. */
defineProps<{ name: 'cup' | 'dessert' | 'bag'; size?: number }>()
</script>

<template>
  <svg
    :width="size ?? 32"
    :height="size ?? 32"
    viewBox="0 0 32 32"
    fill="none"
    stroke="var(--cafe-red, #f2453b)"
    stroke-width="2.2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="name === 'cup'">
      <path d="M7 11.5h15.5l-1.6 14.2a2.5 2.5 0 0 1-2.5 2.2h-7.3a2.5 2.5 0 0 1-2.5-2.2L7 11.5Z" />
      <path d="M6 11.5h17.5" />
      <path d="M9.5 11.3 11 6.8c.3-.9 1-1.3 1.9-1.3h3.9c.9 0 1.6.5 1.9 1.3l1.4 4.5" />
      <path d="M22.4 15.2h1.8a2.8 2.8 0 0 1 0 5.6h-2.4" />
      <path d="M11.3 18.6c1.2-1.1 2.4-1.1 3.6 0s2.4 1.1 3.5 0" />
    </template>
    <template v-else-if="name === 'dessert'">
      <path d="M5.5 22.5 25 13.3c1 2.6 1.6 5.6 1.5 9.2H5.5Z" />
      <path d="M5.5 22.5v3.4c0 .8.7 1.5 1.5 1.5h18c.8 0 1.5-.7 1.5-1.5v-3.4" />
      <path d="M11 20c.9.9 2.1.9 3 0s2.1-.9 3 0 2.1.9 3 0" />
      <path d="M22.6 9.2c.4-1.6 1.8-2.4 3.2-2" />
      <circle cx="22" cy="11" r="1.4" />
    </template>
    <template v-else-if="name === 'bag'">
      <path d="M7 10.5h18l-1.3 15.3a2 2 0 0 1-2 1.8H10.3a2 2 0 0 1-2-1.8L7 10.5Z" />
      <path d="M11.5 13V9.4a4.5 4.5 0 0 1 9 0V13" />
    </template>
  </svg>
</template>
