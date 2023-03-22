import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm', 'cjs'],
  dts: {
    resolve: true,
  },
  external: ['vue', 'lodash.clonedeep', 'lodash.isequal', 'lodash.merge'],
})
