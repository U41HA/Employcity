import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// SINGLE_FILE=1 собирает демо в один HTML-файл (для публикации превью)
export default defineConfig({
  plugins: [vue(), ...(process.env.SINGLE_FILE ? [viteSingleFile()] : [])],
})
