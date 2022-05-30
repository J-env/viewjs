/**
 * 构建生产版本
 *
 * @build
 */

const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const execa = require('execa')
const { gzipSync } = require('zlib')
const { compress } = require('brotli')

const { targets: allTargets, fuzzyMatchTarget } = require('./utils')

const args = require('minimist')(process.argv.slice(2))
const targets = args._
const formats = args.formats || args.f
const sourceMap = args.sourcemap || args.s
const buildAllMatching = args.all || args.a
const devOnly = args.devOnly || args.d
const prodOnly = !devOnly && (args.prodOnly || args.p)
// 发布
const isRelease = args.release
const buildTypes = args.t || args.types || isRelease
const commit = execa.sync('git', ['rev-parse', 'HEAD']).stdout.slice(0, 7)

// build run
run()

async function run() {
  if (isRelease) {
    // 删除发布版本的构建缓存，以避免过时的枚举值
    await fs.remove(path.resolve(__dirname, '../node_modules/.rts2_cache'))
  }

  if (!targets.length) {
    // 打包所有的 package
    await buildAll(allTargets)
    checkAllSizes(allTargets)

  } else {
    // 打包指定的 package
    await buildAll(fuzzyMatchTarget(targets, buildAllMatching))
    checkAllSizes(fuzzyMatchTarget(targets, buildAllMatching))
  }
}

async function buildAll(targets) {
  await runParallel(require('os').cpus().length, targets, build)
}

// 并发
async function runParallel(maxConcurrency, source, buildFn) {
  const ret = []
  const executing = []

  for (const item of source) {
    const p = Promise.resolve().then(() => buildFn(item, source))
    ret.push(p)

    if (maxConcurrency <= source.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1))
      executing.push(e)

      if (executing.length >= maxConcurrency) {
        await Promise.race(executing)
      }
    }
  }

  return Promise.all(ret)
}

// build
async function build(target) {
  const pkgDir = path.resolve(`packages/${target}`)
  const pkg = require(`${pkgDir}/package.json`)

  // 如果这是一个完整的构建(没有特定的目标)，忽略私有包
  if ((isRelease || !targets.length) && pkg.private) {
    return
  }

  // 如果构建一个特定的格式，不要移除dist
  if (!formats) {
    await fs.remove(`${pkgDir}/dist`)
  }

  const env =
    (pkg.buildOptions && pkg.buildOptions.env) ||
    (devOnly ? 'development' : 'production')

  // run rollup
  await execa('rollup', [
    '-c',
    '--environment',
    [
      `COMMIT:${commit}`,
      `NODE_ENV:${env}`,
      `TARGET:${target}`,
      formats ? `FORMATS:${formats}` : ``,
      buildTypes ? `TYPES:true` : ``,
      prodOnly ? `PROD_ONLY:true` : ``,
      sourceMap ? `SOURCE_MAP:true` : ``
    ]
      .filter(Boolean)
      .join(',')
  ], {
    stdio: 'inherit'
  })

  // build types
  if (buildTypes && pkg.types) {
    console.log()
    console.log(
      chalk.bold(chalk.yellow(`Rolling up type definitions for ${target}...`))
    )

    const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor')

    const extractorConfigPath = path.resolve(pkgDir, `api-extractor.json`)

    const extractorConfig = ExtractorConfig.loadFileAndPrepare(extractorConfigPath)

    const extractorResult = Extractor.invoke(extractorConfig, {
      localBuild: true,
      showVerboseMessages: true
    })

    if (extractorResult.succeeded) {
      // concat additional d.ts to rolled-up dts
      const typesDir = path.resolve(pkgDir, 'types')

      if (fs.existsSync(typesDir)) {
        const typesPath = path.resolve(pkgDir, pkg.types)

        const existing = await fs.readFile(typesPath, 'utf-8')
        const typeFiles = await fs.readdir(typesDir)

        const toAdd = await Promise.all(typeFiles.map(file => {
          return fs.readFile(path.resolve(typesDir, file), 'utf-8')
        }))

        await fs.writeFile(typesPath, existing + '\n' + toAdd.join('\n'))
      }

      console.log(
        chalk.bold(chalk.green(`API Extractor completed successfully.`))
      )

    } else {
      console.error(
        `API Extractor completed with ${extractorResult.errorCount} errors` +
        ` and ${extractorResult.warningCount} warnings`
      )
      process.exitCode = 1
    }

    await fs.remove(`${pkgDir}/dist/packages`)
  }
}

function checkAllSizes(targets) {
  if (devOnly || (formats && !formats.includes('global'))) {
    return
  }

  console.log()
  for (const target of targets) {
    checkSize(target)
  }
  console.log()
}

function checkSize(target) {
  const pkgDir = path.resolve(`packages/${target}`)

  checkFileSize(`${pkgDir}/dist/${target}.global.prod.js`)

  if (!formats || formats.includes('global-runtime')) {
    checkFileSize(`${pkgDir}/dist/${target}.runtime.global.prod.js`)
  }
}

function checkFileSize(filePath) {
  if (!fs.existsSync(filePath)) {
    return
  }

  const file = fs.readFileSync(filePath)
  const minSize = (file.length / 1024).toFixed(2) + 'kb'
  const gzipped = gzipSync(file)
  const gzippedSize = (gzipped.length / 1024).toFixed(2) + 'kb'
  const compressed = compress(file)
  const compressedSize = (compressed.length / 1024).toFixed(2) + 'kb'

  console.log(
    `${chalk.gray(
      chalk.bold(path.basename(filePath))
    )} min:${minSize} / gzip:${gzippedSize} / brotli:${compressedSize}`
  )
}
