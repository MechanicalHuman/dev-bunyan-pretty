'use strict'

const split = require('split2')

const Constants = require('./constants')
const Config = require('./config')
const Utils = require('./utils')

function pretty (writeStream, opts = {}) {
  Config.forceColor = opts.forceColor || Config.forceColor
  Config.strict = opts.strict || Config.strict
  Config.depth = opts.depth || Config.depth
  Config.maxArrayLength = opts.maxArrayLength || Config.maxArrayLength
  Config.timeStamps = opts.timeStamps || Config.timeStamps
  Config.stampsFormat = opts.stampsFormat || Config.stampsFormat
  Config.stampsTimeZone = opts.stampsTimeZone || Config.stampsTimeZone
  Config.stream = writeStream || Config.stream
  Config.colorLevel = opts.colorLevel

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
