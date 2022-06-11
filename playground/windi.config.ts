import { defineConfig } from 'windicss/helpers'
import colors from 'windicss/colors'

/**
 * @see https://windicss.org/
 */
export default defineConfig({
  mode: 'jit',
  // preflight: false,
  darkMode: 'class',
  shortcuts: {},
  alias: {},
  theme: {
    extend: {
      colors: {
        ...colors,
        transparent: 'transparent',
        current: 'currentColor',
      },
      borderRadius: {
        inherit: 'inherit'
      },
      borderWidth: {
        none: '0',
        sm: '2px',
      },
      boxShadow: {
        'common': '0 1px 6px 0 rgba(0,0,0,.15)'
      },
      translate: {

      },
      animation: {
      },
      keyframes: {

      },
    },
  },
  extract: {
    include: [
      'pages/**/*.html',
    ],
    exclude: [
    ],
  },
})
