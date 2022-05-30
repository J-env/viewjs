'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/viewjs.cjs.prod.js')

} else {
  module.exports = require('./dist/viewjs.cjs.js')
}
