const fs = require('fs-extra')
const chalk = require('chalk')

const targets = getTargets()

module.exports = {
  resolveExternal,
  targets,
  fuzzyMatchTarget
}

function getTargets() {
  return fs.readdirSync('packages').filter(f => {
    // 过滤掉非文件夹
    if (!fs.statSync(`packages/${f}`).isDirectory()) {
      return false
    }

    try {
      const pkg = require(`../packages/${f}/package.json`)

      if (pkg.private && !pkg.buildOptions) {
        return false
      }

    } catch (e) {
      // 没有 package.json
      return false
    }

    return true
  })
}

function fuzzyMatchTarget(partialTargets, includeAllMatching) {
  const matched = []

  partialTargets.forEach(partialTarget => {
    for (const target of targets) {
      if (target.match(partialTarget)) {
        matched.push(target)

        if (!includeAllMatching) {
          break
        }
      }
    }
  })

  if (matched.length) {
    return matched

  } else {
    console.log()
    console.error(
      `  ${chalk.bgRed.white(' ERROR ')} ${chalk.red(
        `Target ${chalk.underline(partialTargets)} not found!`
      )}`
    )
    console.log()

    process.exit(1)
  }
}

function resolveExternal({
  format,
  target,
  dependencies,
  peerDependencies,
  external,
  paths
} = {}) {
  // cjs & esm-bundler: external all deps
  if (format === 'cjs' || format.includes('esm-bundler')) {
    return [
      ...external,
      ...Object.keys(dependencies || {}),
      ...Object.keys(peerDependencies || {}),
      'path',
      'url',
      'stream'
    ]
  }

  if (target === 'compiler-sfc') {
    const consolidateDeps = require.resolve('@vue/consolidate/package.json', {
      paths: paths || []
    })

    return [
      ...external,
      ...Object.keys(require(consolidateDeps).devDependencies),
      'fs',
      'vm',
      'crypto',
      'react-dom/server',
      'teacup/lib/express',
      'arc-templates/dist/es5',
      'then-pug',
      'then-jade'
    ]
  }

  return []
}
