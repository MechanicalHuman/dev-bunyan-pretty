'use strict'

process.env.SUPPRESS_NO_CONFIG_WARNING = 'y'

const split = require('split2')
const config = require('config')
const fp = require('lodash/fp')
const CONSTANTS = require('./constants')
const utils = require('./utils')
const debug = require('debug')('mech:pretty')

/**
 * WIll wrap the given stream with pretty.
 *
 * @param  {WritableStream} writeStream Writable stream to wrap pretty around
 * @param  {Object} opts                Pretty options
 *
 * @return {WritableStream}
 */

module.exports = function pretty (stream = process.stdout, opts = {}) {
  const conf = fp.pipe(
    () => config.util.loadFileConfigs(CONSTANTS.configDir),
    base => config.util.toObject(base),
    shallow => config.util.extendDeep({}, shallow, opts),
    conf => fp.set('colorLevel', utils.coerceColorLevel(conf, stream), conf),
    conf => fp.set('level', utils.coerceLevel(conf.level), conf)
  )()

  config.util.setModuleDefaults('pretty', conf)

  debug('colorLevel', config.get('pretty.colorLevel'))
  debug('minLevel', config.get('pretty.level'))

  const prettyStream = split(parser)
  const splitStream = split(chunk => chunk + CONSTANTS.NEW_LINE)

  prettyStream.pipe(splitStream)
  prettyStream.pipe(stream)

  return prettyStream

  function parser (rawline) {
    const formatters = require('./formatters')

    if (!rawline) return CONSTANTS.NEW_LINE

    let record = {}

    try {
      record = utils.parseRecord(rawline)
    } catch (err) {
      if (config.get('pretty.strict')) return
      return rawline + CONSTANTS.NEW_LINE
    }

    if (record.level < config.get('pretty.level')) return

    if (record.req && record.req.body && utils.isValid(record.req.body)) {
      record.body = record.req.body
    }

    const lines = [
      formatters.head(record),
      ...formatters.keys(record),
      ...formatters.error(record)
    ]

    return utils.prefixLines(lines, record) + CONSTANTS.NEW_LINE
  }
}
