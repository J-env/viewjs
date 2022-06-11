import { resolve } from 'path'

import { defineConfig } from 'vite'
import windiCSS from 'vite-plugin-windicss'

export default defineConfig(async (_env) => {
  return {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: ''
        }
      }
    },
    plugins: [
      windiCSS(),
    ],
    build: {

    }
  }
})
