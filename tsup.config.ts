import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/{index,cli}.ts'],
  format: ['esm'],
  target: 'node18',
  dts: false,
  clean: true,
})
