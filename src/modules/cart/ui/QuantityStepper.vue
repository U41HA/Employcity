<script setup lang="ts">
const props = withDefaults(defineProps<{ value: number; max: number; min?: number; label: string }>(), { min: 0 })
const emit = defineEmits<{ change: [value: number] }>()

const step = (delta: 1 | -1) => {
  const next = props.value + delta
  if (next >= props.min && next <= props.max) emit('change', next)
}
</script>

<template>
  <div class="stepper" role="group" :aria-label="label">
    <button type="button" class="stepper__btn" :disabled="value <= min" aria-label="Уменьшить" @click.stop="step(-1)">
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8h9" /></svg>
    </button>
    <output class="stepper__value" aria-live="polite">{{ value }}</output>
    <button type="button" class="stepper__btn" :disabled="value >= max" aria-label="Увеличить" @click.stop="step(1)">
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8h9M8 3.5v9" /></svg>
    </button>
  </div>
</template>

<style scoped>
.stepper {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px;
  background: #fff;
  border-radius: 14px;
  box-shadow: inset 0 0 0 2px var(--cafe-line, #e4e0d6);
}
.stepper__btn {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: var(--cafe-yellow, #ffc629);
  border: 0;
  border-radius: 11px;
  box-shadow: 0 2px 0 var(--cafe-yellow-deep, #f7b500);
  cursor: pointer;
}
.stepper__btn svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: var(--cafe-ink, #2d2b29);
  stroke-width: 2.6;
  stroke-linecap: round;
}
.stepper__btn:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow: none;
}
.stepper__btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.stepper__btn:focus-visible {
  outline: 3px solid var(--cafe-red, #f2453b);
  outline-offset: 2px;
}
.stepper__value {
  min-width: 26px;
  font-size: 16px;
  font-weight: 900;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
</style>
