import { defineConfig } from 'vite'
import ts from '@rollup/plugin-typescript'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [
    vueJsx(),
  ],
  build: {
    rollupOptions: {
      external: [
        'vue',
        '@v-c/utils',
      ],
      plugins: [ts({
        compilerOptions: {
          declaration: true,
          outDir: 'dist',
          baseUrl: '.',
        },
        target: 'es2020',
        include: ['src/**/*.ts', 'src/**/*.tsx'],
      })],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          '@v-c/utils': 'VcUtils',
        },
      },
    },
    lib: {
      formats: ['es'],
      entry: 'src/index.tsx',
      name: 'VcMotion',
      fileName: format => `index.${format}.js`,
    },
  },
})
