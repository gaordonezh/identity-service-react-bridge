import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  server: {
    port: 4000,
  },
  plugins: [
    react(),
    dts({
      entryRoot: 'src',
      exclude: ['src/main.tsx', 'src/demo'],
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'IdentityServiceClient',
      fileName: (format) => `identity-service-client-lib.${format}.js`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'axios'],
      output: {
        globals: {
          axios: 'axios',
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    sourcemap: true,
    emptyOutDir: true,
    cssCodeSplit: false,
  },
});
