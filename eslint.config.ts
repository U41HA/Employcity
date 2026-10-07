import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import prettier from 'eslint-config-prettier'
import pluginVue from 'eslint-plugin-vue'

export default defineConfigWithVueTs(
  { ignores: ['dist/**', 'dist-preview/**', 'coverage/**', 'android/**', 'ios/**'] },
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommendedTypeChecked,
  {
    rules: {
      // единый стиль: только стрелочные функции
      'func-style': ['error', 'expression'],
      'prefer-arrow-callback': 'error',
      'no-return-assign': 'error',
      eqeqeq: ['error', 'always'],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/block-lang': ['error', { script: { lang: 'ts' } }],
      'vue/define-macros-order': ['error', { order: ['defineProps', 'defineEmits', 'defineModel', 'defineSlots'] }],
      'vue/no-unused-refs': 'error',
      'vue/require-typed-ref': 'error',
      // slot у веб-компонентов Ionic — это нативный атрибут Shadow DOM, а не устаревший синтаксис Vue 2
      'vue/no-deprecated-slot-attribute': ['error', { ignore: ['/^Ion/'] }],
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: { '@typescript-eslint/unbound-method': 'off' },
  },
  prettier,
)
