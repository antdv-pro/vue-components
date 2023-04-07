import { fileURLToPath } from 'url'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
import VitePluginVitepressDemo from 'vite-plugin-vitepress-demo'
const dir = fileURLToPath(new URL('.', import.meta.url))
export default defineConfig({
  plugins: [
    vueJsx(),
    VitePluginVitepressDemo(),
  ],
  resolve: {
    alias: {
      '@v-c/checkbox': resolve(dir, '../../packages/checkbox/src'),
      '@v-c/utils': resolve(dir, '../../packages/utils/src'),
    },
  },
  server: {
    port: 9988,
  },
})
