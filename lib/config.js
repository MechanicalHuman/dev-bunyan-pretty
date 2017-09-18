const supportsColor = require('supports-color')
const lodash = require('lodash')
const chalk = require('./utils/chalk')

const debug = require('debug')('mech:logger:config')

const defaults = {
  color: !!supportsColor,
  header: true,
  strict: false,
  depth: 3,
  timeStamp: 'diff',
  level: ['trace'],
  condition: [],
  tag: [],
  name: []
}

exports.defaults = defaults
exports.create = parseOptions

function parseOptions (opts = {}) {
  const combined = lodash.merge({}, defaults, opts)

  debug(chalk)

  return combined
}
