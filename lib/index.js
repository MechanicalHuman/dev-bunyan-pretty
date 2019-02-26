/*!
 * Copyright 2019 Jorge Proaño.
 */
'use strict'

/**
 * Prettifies NDJSON (Newline Delimited JSON) writable streams
 *
 * @module @mechanicalhuman/bunyan-pretty
 * @typicalname pretty
 */

const fp = require('lodash/fp')
const chalk = require('chalk')
const moment = require('moment-timezone')
const CONSTANTS = require('./constants')

const { defaultConfig } = require('./config')
const { parseRecord, isValidRecord, coerceLevel } = require('./utils')

const headFormatter = require('./formatters/head-formatter')
const keysFormatter = require('./formatters/keys-formatter')
const errorFormatter = require('./formatters/error-formatter')

const debug = require('debug')('mech:pretty')
const debugRecord = require('debug')('mech:pretty:record')

/**
 * Factory function that returns a configured prettifier function.
 */
function PrettyFactory (options = {}) {
  debug('Custom options: %O', options)

  /** @type {Pretty.Configuration}  */
  const conf = fp.pipe(
    fp.assign(defaultConfig),
    fp.update('level', coerceLevel)
  )(options)

  return function pretty (/** @type {*} */ inputData) {
    if (!inputData) debug('No record line')
    if (!inputData) return undefined

    debug('New record line')
    debugRecord('Raw record: %s', inputData)

    let record

    if (typeof inputData === 'string') {
      try {
        record = parseRecord(inputData)
      } catch (err) {
        if (conf.strict) debug('Invalid record, skipping')
        if (conf.strict) return
        debug('Invalid record, bypassing')
        return inputData + CONSTANTS.NEW_LINE
      }
    } else if (fp.isObject(inputData) && isValidRecord(inputData)) {
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

    const ctx = conf.colorize
      ? makeChalkInstance({ enabled: true, level: 3 })
      : makeChalkInstance({ enabled: false })

    const lines = [
      headFormatter(record, conf, ctx),
      ...keysFormatter(record, conf, ctx),
      ...errorFormatter(record, conf, ctx)
    ]

    debugRecord('About to print %o lines.', lines.length)

    return prefixLines(lines, record) + CONSTANTS.NEW_LINE

    /**
     *
     * @param {string[]} lines
     * @param {Pretty.LogRecord} record
     */
    function prefixLines (lines, record) {
      const colors = {
        [CONSTANTS.FATAL]: ctx.red.bold.inverse,
        [CONSTANTS.ERROR]: ctx.red,
        [CONSTANTS.WARN]: ctx.yellow,
        [CONSTANTS.INFO]: ctx.green,
        [CONSTANTS.DEBUG]: ctx.blue,
        [CONSTANTS.TRACE]: ctx.cyan
      }
      const color = colors[record.level] || ctx.green

      const prefix = conf.timeStamps
        ? moment(record.time)
          .tz(conf.stampsTimeZone)
          .format(conf.stampsFormat)
        : CONSTANTS.headers[record.level]

      const prefixed = lines
        .join(CONSTANTS.NEW_LINE)
        .split(CONSTANTS.NEW_LINE)
        .map(line => `${color(prefix + CONSTANTS.PIPE)} ${line}`)
        .join(CONSTANTS.NEW_LINE)
      return prefixed
    }

    /** @returns {import('chalk').Chalk}  */
    function makeChalkInstance (opts = {}) {
      // @ts-ignore-line
      return new chalk.constructor(opts)
    }
  }
}

function PrettyStream (stream = process.stdout, options = {}) {
  const split = require('split2')
  const prettifier = PrettyFactory(options)
  const prettyStream = split(prettifier)
  prettyStream.pipe(stream)
  return prettyStream
}

module.exports = function pretty (stream, opts = {}) {
  if (fp.isPlainObject(stream)) {
    return PrettyFactory({ ...opts, ...stream })
  } else {
    return PrettyStream(stream, opts)
  }
}

module.exports.defaultConfig = defaultConfig
