/**
 * 开发环境使用 esbuild 构建
 * 生产环境使用 Rollup 构建，生成更小的文件和更好的摇树
 *
 * @dev
 */

const { resolve, relative } = require('path')
const { build } = require('esbuild')
const nodeModulesPolyfills = require('@esbuild-plugins/node-modules-polyfill')

const args = require('minimist')(process.argv.slice(2))
const { resolveExternal } = require('./utils')
// /packages/${包文件夹名称}
const target = args._[0] || 'viewjs'

const resolve_p = (p) => resolve(__dirname, '../packages/' + target + p)

const format = args.f || 'global'
const inlineDeps = args.i || args.inline
const pkg = require(resolve_p('/package.json'))
const outputFormat = format.startsWith('global')
  ? 'iife'
  : format === 'cjs'
    ? 'cjs'
    : 'esm'

const postfix = format.endsWith('-runtime')
  ? `runtime.${format.replace(/-runtime$/, '')}`
  : format

const outfile = resolve_p(`/dist/${target}.${postfix}.js`)
// packages/viewjs/dist/viewjs.global.js
const relativeOutfile = relative(process.cwd(), outfile)

// dev run
run()

async function run() {
  await build({
    entryPoints: [
      resolve_p('/src/index.ts'),
    ],
    outfile,
    bundle: true,
    external: !inlineDeps
      ? resolveExternal({
        format,
        target,
        dependencies: pkg.dependencies,
        peerDependencies: pkg.peerDependencies,
        external: [],
        paths: [resolve_p('/')]
      })
      : [],
    sourcemap: true,
    format: outputFormat,
    globalName: pkg.buildOptions?.name,
    platform: format === 'cjs' ? 'node' : 'browser',
    plugins:
      format === 'cjs' || pkg.buildOptions?.enableNonBrowserBranches
        ? [nodeModulesPolyfills.default()]
        : undefined,
    define: {
      __COMMIT__: `"dev"`,
      __VERSION__: `"${pkg.version}"`,
      __DEV__: `true`,
      __TEST__: `false`,
      __BROWSER__: String(
        format !== 'cjs' && !pkg.buildOptions?.enableNonBrowserBranches
      ),
      __GLOBAL__: String(format === 'global'),
      __ESM_BUNDLER__: String(format.includes('esm-bundler')),
      __ESM_BROWSER__: String(format.includes('esm-browser')),
      __NODE_JS__: String(format === 'cjs'),
      __SSR__: String(format === 'cjs' || format.includes('esm-bundler')),
    },
    watch: {
      onRebuild(error) {
        if (!error) console.log(`rebuilt: ${relativeOutfile}`)
      }
    }
  })

  console.log(`watching: ${relativeOutfile}`)
}
