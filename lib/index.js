'use strict'

/**
 * Prettifies NDJSON (Newline Delimited JSON) writable streams
 *
 * @module @mechanicalhuman/bunyan-pretty
 * @typicalname pretty
 */

process.env.SUPPRESS_NO_CONFIG_WARNING = 'y'

const config = require('config')
const fp = require('lodash/fp')
const CONSTANTS = require('./constants')
const utils = require('./utils')
const debug = require('debug')('mech:pretty')
const debugRecord = require('debug')('mech:pretty:record')

/**
 * WIll wrap the given stream with pretty.
 *
 * @param  {Object}         opts        - Pretty options
 *
 * @return {function}
 *
 */

module.exports = function prettierFactory (opts = {}) {
  debug('Custom options: %O', opts)

  // eslint-disable-next-line lodash-fp/no-unused-result
  fp.pipe(
    () => config.util.loadFileConfigs(CONSTANTS.CONFIG_DIR),
    base => config.util.toObject(base),
    shallow => config.util.extendDeep({}, shallow, opts),
    conf =>
      fp.set('colorLevel', utils.coerceColorLevel(conf, process.stdout), conf),
    conf => fp.set('level', utils.coerceLevel(conf.level), conf),
    fp.pick(CONSTANTS.CONFIG_FILEDS),
    conf => config.util.setModuleDefaults('pretty', conf)
  )()

  const formatters = require('./formatters')
  const conf = config.util.toObject(config.get('pretty'))

  return function pretty (inputData) {
    if (!inputData) debug('No record line')
    if (!inputData) return undefined

    debug('New record line')
    debugRecord('Raw record: %s', inputData)

    let record = {}

    if (typeof inputData === 'string') {
      try {
        record = utils.parseRecord(inputData)
      } catch (err) {
        if (conf.strict) debug('Invalid record, skipping')
        if (conf.strict) return
        debug('Invalid record, bypassing')
        return inputData + CONSTANTS.NEW_LINE
      }
    } else if (fp.isObject(inputData) && utils.isValidRecord(inputData)) {
      record = inputData
    } else {
      if (conf.strict) debug('Invalid record, skipping')
      if (conf.strict) return
      debug('Invalid record, bypassing')
      return inputData + CONSTANTS.NEW_LINE
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
      ...formatters.error(record)
    ]

    debugRecord('About to print %o lines.', lines.length)

    return utils.prefixLines(lines, record) + CONSTANTS.NEW_LINE
  }
}
