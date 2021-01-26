'use strict'

/**
 * @file Prettifies NDJSON (Newline Delimited JSON) writable streams
 */

process.env.SUPPRESS_NO_CONFIG_WARNING = 'y'

const split = require('split2')
const config = require('config')
const fp = require('lodash/fp')
const CONSTANTS = require('./constants')
const utils = require('./utils')
const debug = require('debug')('mech:pretty')
const debugRecord = require('debug')('mech:pretty:record')

/**
 * Wraps the given stream with pretty.
 * @param {NodeJS.WriteStream} stream Writable stream to wrap pretty around
 * @param {Object} opts Pretty options
 */

module.exports = function pretty(stream = process.stdout, opts = {}) {
  debug('Custom options: %O', opts)

  fp.pipe(
    () => config.util.loadFileConfigs(CONSTANTS.CONFIG_DIR),
    (base) => config.util.toObject(base),
    (shallow) => config.util.extendDeep(shallow, opts),
    (conf) => fp.set('colorLevel', utils.coerceColorLevel(conf, stream), conf),
    (conf) => fp.set('level', utils.coerceLevel(conf.level), conf),
    (conf) => fp.pick(CONSTANTS.CONFIG_FIELDS, conf),
    (conf) => config.util.setModuleDefaults('pretty', conf)
  )()

  const formatters = require('./formatters')

  const conf = config.util.toObject(config.get('pretty'))
  const prettyStream = split(parser)

  debug('Options: %O', conf)

  prettyStream.pipe(stream)

  return prettyStream

  function parser(rawline) {
    if (!rawline) debug('No record line')
    if (!rawline) return CONSTANTS.NEW_LINE

    debug('New record line')
    debugRecord('Raw record: %s', rawline)
    let record = {}

    try {
      record = utils.parseRecord(rawline)
    } catch (err) {
      if (conf.strict) debug('Invalid record, skipping')
      if (conf.strict) return
      debug('Invalid record, bypassing')
      return rawline + CONSTANTS.NEW_LINE
    }

    debugRecord('Parsed record: %O', record)

    debugRecord(
      'Skip Record: %o (%s > %s)',
      record.level < conf.level,
      conf.level,
      record.level
    )

    if (record.level < conf.level) return

    const lines = [
      formatters.head(record),
      ...formatters.keys(record),
      ...formatters.error(record),
    ]

    debugRecord('About to print %o lines.', lines.length)

    return utils.prefixLines(lines, record) + CONSTANTS.NEW_LINE
  }
}
