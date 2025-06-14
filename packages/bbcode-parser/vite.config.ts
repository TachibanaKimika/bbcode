import { defineConfig } from 'vitest/config'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      outDir: 'dist',
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      insertTypesEntry: true,
      copyDtsFiles: false,
      beforeWriteFile: (filePath, content) => {
        return { filePath, content }
      }
    })
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'BBCodeParser',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format}.js`
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*'],
      exclude: ['src/**/*.{test}.ts']
    }
  }
})
