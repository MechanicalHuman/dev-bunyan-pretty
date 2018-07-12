'use strict'

process.env.SUPPRESS_NO_CONFIG_WARNING = 'y'

const split = require('split2')
const config = require('config')
const path = require('path')
const supportsColor = require('supports-color')
const lo = require('lodash')
const Constants = require('./constants')
const Utils = require('./utils')
const debug = require('debug')('mech:pretty')

let baseConfig = config.util.loadFileConfigs(path.join(__dirname, 'config'))

/**
 * WIll wrap the given stream with pretty.
 *
 * @param  {WritableStream} writeStream Writable stream to wrap pretty around
 * @param  {Object} opts                Pretty options
 *
 * @return {WritableStream}
 */

function pretty (writeStream = process.stdout, opts = {}) {
  config.util.extendDeep(baseConfig, opts)

  const colorLevel = baseConfig.forceColor
    ? baseConfig.colorLevel <= 1
      ? 1
      : baseConfig.colorLevel
    : supportsColor(writeStream).level >= baseConfig.colorLevel
      ? supportsColor(writeStream).level
      : baseConfig.colorLevel

  const level = Utils.coerceLevel(baseConfig.level)

  config.util.extendDeep(baseConfig, { colorLevel, level })
  lo.unset(baseConfig, 'forceColor')

  config.util.setModuleDefaults('pretty', baseConfig)

  debug('colorLevel', config.get('pretty.colorLevel'))
  debug('minLevel', config.get('pretty.level'))

  const prettyStream = split(parser)
  const splitStream = split(chunk => chunk + Constants.NEW_LINE)

  prettyStream.pipe(splitStream)
  prettyStream.pipe(writeStream)

  return prettyStream

  function parser (rawline) {
    const formatters = require('./formatters')

    if (!rawline) return Constants.NEW_LINE

    let record = {}

    try {
      record = Utils.parseRecord(rawline)
    } catch (err) {
      if (config.get('pretty.strict')) return
      return rawline + Constants.NEW_LINE
    }

    if (record.level < config.get('pretty.level')) return

    if (record.req && record.req.body && Utils.isValid(record.req.body)) {
      record.body = record.req.body
    }

    const lines = [
      formatters.head(record),
      ...formatters.src(record),
      ...formatters.keys(record),
      ...formatters.error(record)
    ]

    return Utils.prefixLines(lines, record) + Constants.NEW_LINE
  }
}

module.exports = pretty
