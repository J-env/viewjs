import { relative } from 'path'
import type { Plugin, ResolvedConfig } from 'vite'

import type { PluginOptions } from './index'
import { getPagesConfig } from './utils'

export function pagesPlugin(_opts: PluginOptions): Plugin {
  const options: PagesOptions = {
    ..._opts,
    root: '',
    mode: 'development',
    assetsInclude: (_) => false
  }

  let config: ResolvedConfig

  return {
    name: 'viewjs-pages',
    enforce: 'pre',

    config(conf) {
      getPagesConfig(conf, options)
    },

    configResolved(conf) {
      options.root = conf.root
      options.assetsInclude = conf.assetsInclude
      options.mode = conf.command === 'build' ? 'production' : 'development'
      // config
      config = conf
    },

    // dev
    // configureServer(server) {
    // },

    transformIndexHtml: {
      enforce: 'pre',
      async transform(html, { filename, path, originalUrl }) {
        const mock = await options.requestMockData({
          filename: relative(config.root, filename),
          path: path,
          originalUrl: originalUrl || ''
        })

        console.log('mock', mock)

        return html
      }
    },

    async handleHotUpdate({ file, server }) {
      if (file.includes('.html')) {
        server.ws.send({
          type: 'full-reload',
          path: '*',
        })
      }
    }
  }
}

export interface PagesOptions extends PluginOptions {
  /**
  * @default process.cwd()
  */
  root: string

  /**
  * @default 'development'
  */
  mode: 'development' | 'production'

  assetsInclude: (file: string) => boolean
}
