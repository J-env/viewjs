'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/babel-preset.cjs.prod.js.js')

} else {
  module.exports = require('./dist/babel-preset.cjs.js.js')
}
