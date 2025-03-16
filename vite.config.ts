import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'canister-manager',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['@dfinity/agent', '@dfinity/candid'],
      output: {
        globals: {
          '@dfinity/agent': 'dfinity.agent',
          '@dfinity/candid': 'dfinity.candid',
        },
      },
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
      include: ['src'],
    }),
  ],
});
