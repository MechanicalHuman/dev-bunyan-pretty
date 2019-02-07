'use strict'

const chalk = require('chalk')
const fp = require('lodash/fp')

/** @type {Pretty.Configuration} */
exports.defaultConfig = {
  level: 0,
  strict: false,
  // @ts-ignore
  colorize: chalk.supportsColor !== false,
  depth: 4,
  maxArrayLength: 100,
  printHost: false,
  timeStamps: true,
  stampsFormat: 'YYYY-MM-DD-HH:mm:ss',
  stampsTimeZone: require('moment-timezone').tz.guess()
}

/** @return {Pretty.Configuration}  */
exports.coerceConfig = function coerce (opts = {}) {
  const options = Object.assign({}, opts, exports.defaultConfig)

  return options
}

/** @return {Pretty.Options}  */
exports.asOptions = function asOptions (opts = {}) {
  const fields = [
    'level',
    'strict',
    'colorize',
    'depth',
    'maxArrayLength',
    'printHost',
    'timeStamps',
    'stampsFormat',
    'stampsTimeZone'
  ]
  return fp.pick(fields, opts)
}
