import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      'stream': 'stream-browserify',
      'buffer': 'buffer',
      'util': 'util',
      'events': 'events',
    }
  },
  define: {
    global: 'globalThis',
    'process.env': {},
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },  optimizeDeps: {
    include: ['buffer', 'stream-browserify', 'util', 'events'],
    exclude: ['firebase'],
    esbuildOptions: {
      target: 'es2020',
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
        NodeModulesPolyfillPlugin()
      ]
    },
  },
  build: {
    rollupOptions: {
      external: (id) => {
        if (id.includes('crypto')) return false;
        return false;
      }
    }
  }
})
