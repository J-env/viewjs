import { resolve } from 'path'

import { defineConfig } from 'vite'
import windiCSS from 'vite-plugin-windicss'
import { viewJs } from '../vite-plugin/src/index'

export default defineConfig(async (_env) => {
  return {
    server: {
      open: '/pages/index/index.html'
    },
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
      viewJs({
        async requestMockData({ filename, path, originalUrl }) {
          return {
            filename,
            path,
            originalUrl,
            random: Math.random()
          }
        }
      })
    ],
    build: {
    }
  }
})
