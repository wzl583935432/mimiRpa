import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'

// Shared alias configuration
const aliases = {
  '@/app': resolve(__dirname, 'app'),
  '@/electron': resolve(__dirname, 'electron'),
  '@/lib': resolve(__dirname, 'lib'),
  '@/resources': resolve(__dirname, 'resources'),
}

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'electron/main/main.ts'),
        },
      },
    },
    resolve: {
      alias: aliases,
    },
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          preload: resolve(__dirname, 'electron/preload/preload.ts'),
        },
      },
    },
    resolve: {
      alias: aliases,
    },
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    root: './app',
    build: {
      sourcemap: true,
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'app/index.html'),
        },
      },
    },
    resolve: {
      alias: aliases,
    },
    plugins: [tailwindcss(), react()],
  },
 
})
