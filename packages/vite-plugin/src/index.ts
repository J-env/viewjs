import type { Plugin } from 'vite'
import { merge } from 'lodash'

import { pagesPlugin } from './pages'
import { RtlOptions, getRtlOptions } from './utils/rtl'

// _document.html
// _app.html
export function viewJs(_opts?: Partial<PluginOptions>): Plugin[] {
  const options: PluginOptions = merge<PluginOptions, any>({
    assetsAttrs: ['data-src', 'data-img'],
    cacheDirectory: '.viewjs-cache',
    pagesDirectory: 'pages',
    viewjsReg: /^(?:x-|v-|:|@)/,
    includes: [],
    ignore: [],
    rtl: false,
    async requestMockData() {
      return {}
    }
  }, _opts || {})

  options.rtl = getRtlOptions(options.rtl)

  return [
    pagesPlugin(options),
  ]
}

export interface PluginOptions {
  /**
   * 默认 以下划线(_) 开头的目录和文件_test/*, _test.html 是不会生成页面的
   * 需要保留以下划线(_) 开头的 目录和文件 ['_test.html']
   * @default []
   */
  includes: string[]

  /**
   * 忽略目录和文件
   * @default []
   */
  ignore: string[]

  /**
   * Development environment pages directory
   * @default 'pages'
   */
  pagesDirectory: 'pages' | (string & {})

  /**
    * @default '.viewjs-cache'
    */
  cacheDirectory: '.viewjs-cache' | (string & {})

  /**
   * @example ['data-src', 'data-img']
   * @default ['data-src', 'data-img']
   */
  assetsAttrs: string[]

  /**
   * @default /^(?:x-|v-|:|@)/
   */
  viewjsReg: RegExp,

  /**
   * rtl plugin
   * @default false
   */
  rtl: boolean | Partial<RtlOptions>

  /**
   * request mock data
   */
  requestMockData: (ctx: MockContext) => Promise<Record<string, any>>
}

interface MockContext {
  filename: string
  path: string
  originalUrl: string
}
