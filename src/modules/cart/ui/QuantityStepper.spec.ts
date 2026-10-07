import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import QuantityStepper from './QuantityStepper.vue'

const mountStepper = (value: number, max = 5) =>
  mount(QuantityStepper, { props: { value, max, label: 'Количество: Латте' } })

describe('QuantityStepper', () => {
  it('подписан для скринридеров как группа', () => {
    const wrapper = mountStepper(2)
    expect(wrapper.get('[role="group"]').attributes('aria-label')).toBe('Количество: Латте')
  })

  it('эмитит новое значение по кнопкам', async () => {
    const wrapper = mountStepper(2)
    await wrapper.get('[aria-label="Увеличить"]').trigger('click')
    await wrapper.get('[aria-label="Уменьшить"]').trigger('click')
    expect(wrapper.emitted('change')).toEqual([[3], [1]])
  })

  it('блокирует кнопки на границах диапазона', () => {
    const atMax = mountStepper(5, 5)
    expect(atMax.get('[aria-label="Увеличить"]').attributes('disabled')).toBeDefined()
    const atMin = mountStepper(0)
    expect(atMin.get('[aria-label="Уменьшить"]').attributes('disabled')).toBeDefined()
  })
})
