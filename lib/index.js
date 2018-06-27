'use strict'

const split = require('split2')
const Constants = require('./constants')
const Config = require('./config')
const Utils = require('./utils')
const debug = require('debug')('mech:pretty')

/**
 * WIll wrap the given stream with pretty.
 *
 * @param  {WritableStream} writeStream Writable stream to wrap pretty around
 * @param  {Object} opts                Pretty options
 *
 * @return {WriteStream}
 */

function pretty (writeStream, opts = {}) {
  Config.stream = writeStream || Config.stream

  setConfig('forceColor')
  setConfig('colorLevel')
  setConfig('strict')
  setConfig('depth')
  setConfig('maxArrayLength')
  setConfig('timeStamps')
  setConfig('stampsFormat')
  setConfig('stampsTimeZone')
  setConfig('level')

  debug('colorLevel', Config.colorLevel)
  debug('columns', Config.columns)
  debug('minColumns', Config.minColumns)
  debug('minLevel', Config.level)

  const formatters = require('./formatters')
  const prettyStream = split(parser)
  const splitStream = split(chunk => chunk + Constants.NEW_LINE)

  prettyStream.pipe(splitStream)
  splitStream.pipe(writeStream)

  return prettyStream

  function parser (rawline) {
    if (!rawline) return Constants.NEW_LINE

    let record = {}

    try {
      record = Utils.parseRecord(rawline)
    } catch (err) {
      if (Config.strict) return
      return rawline + Constants.NEW_LINE
    }

    if (record.level < Config.level) return

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

  function setConfig (prop) {
    if (prop in opts) Config[prop] = opts[prop]
  }
}

module.exports = pretty
