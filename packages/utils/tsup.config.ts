import { defineConfig } from 'tsup'
import fg from 'fast-glob'
const files = fg.sync(['./src/**/*.ts', './src/**/*.tsx', '!src/**/*.d.ts'])
export default defineConfig({
  entry: [...files],
  format: ['esm', 'cjs'],
  dts: {
    resolve: true,
  },
  external: ['vue', 'lodash.clonedeep', 'lodash.isequal', 'lodash.merge'],
})
