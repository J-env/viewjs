import { defineConfig } from 'vite'
import windiCSS from 'vite-plugin-windicss'

export default defineConfig(async (_env) => {
  return {
    plugins: [
      windiCSS(),
    ]
  }
})
