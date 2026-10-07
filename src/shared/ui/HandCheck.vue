<script setup lang="ts">
/** Кружок с «рисованной» красной галочкой — как отметка ручкой на бумажном меню. */
defineProps<{ checked: boolean }>()
</script>

<template>
  <svg class="hand-check" width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
    <circle cx="11.5" cy="14" r="9" stroke="var(--cafe-ink, #2d2b29)" stroke-width="2.4" />
    <path
      v-if="checked"
      class="hand-check__tick"
      d="M6.5 13.5c1.6 1.2 2.9 2.6 4 4.6 2.8-5.5 6.6-10 12.3-14.3"
      stroke="var(--cafe-red, #f2453b)"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<style scoped>
.hand-check {
  flex: none;
  filter: drop-shadow(0 1px 0 rgb(0 0 0 / 15%));
}
.hand-check__tick {
  stroke-dasharray: 30;
  animation: draw 0.35s ease-out both;
}
@keyframes draw {
  from {
    stroke-dashoffset: 30;
  }
}
@media (prefers-reduced-motion: reduce) {
  .hand-check__tick {
    animation: none;
  }
}
</style>
