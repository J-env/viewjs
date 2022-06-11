import path from 'path'
import fg from 'fast-glob'
import type { UserConfig } from 'vite'

import type { PluginOptions } from '../index'

const cssReg = /\.(css|scss|less|sass|styl|stylus|pcss|postcss)$/

export function isCssRequest(id: string) {
  const bool = cssReg.test(id)
  cssReg.lastIndex = 0
  return bool
}

export function getPagesConfig(config: UserConfig, options: PluginOptions) {
  config.build = config.build || {}
  config.build.rollupOptions = config.build.rollupOptions || {}
  config.build.ssr = false

  const root = config.root || process.cwd()
  const pages = getPagesOptions(options)
  const input: Record<string, string> = {}

  pages.forEach((item) => {
    input[item.pageName] = path.resolve(root, item.path)
  })

  config.build.rollupOptions.input = input

  return config
}

function getPagesOptions({ pagesDirectory, includes, ignore }: PluginOptions) {
  includes = includes.filter(Boolean).map(item => {
    return item[0] === '/' ? item : `/${item}`
  })

  // {
  //   name: `index.html`,
  //   path: `${pagesDirectory}/index/index.html`
  // }
  return fg.sync(normalDiagonal(`${pagesDirectory}/**/*.html`), {
    objectMode: true,
    ignore: ignore.map(item => normalDiagonal(item.includes('.') ? item : `**/${item}/**`))
  })
    .filter(item => {
      if (includes.some(f => item.path.includes(f))) {
        return true
      }

      return !item.path.includes('/_')
    })
    .map(({ name, path }) => {
      // {
      //   filename: 'index.html',
      //   path: `${pagesDirectory}/index/index.html`,
      //   route: 'index/index.html',
      //   pageName: 'index'
      // },
      // {
      //   filename: 'test.html',
      //   path: `${pagesDirectory}/index/test.html`,
      //   route: 'index/test.html',
      //   pageName: 'index-test'
      // }
      const obj: EntriesItem = {
        filename: name,
        path,
        route: '',
        pageName: '',
      }

      obj.route = path.replace(`${pagesDirectory}/`, '')

      obj.pageName = obj.route
        .replace(/(\/index)?\.html/, '')
        .replace(/\//g, '-')

      return obj
    })
}

function normalDiagonal(source: string) {
  return source.replace(/\/+/g, '/')
}

interface EntriesItem {
  filename: string
  path: string
  pageName: string
  route: string
}
