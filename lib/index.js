'use strict'

const split = require('split2')
const Parse = require('json-parse-safe')
const moment = require('moment-timezone')
const { supportsColor } = require('supports-color')
const Constants = require('./constants')

const { isValid, hasSrc, isError } = require('./utils')

function pretty (writeStream, opts = {}) {
  Constants.USE_COLORS = opts.colors
    ? opts.colors
    : supportsColor(writeStream).level > Constants.USE_COLORS
      ? supportsColor(writeStream).level
      : Constants.USE_COLORS

  Constants.set('STRICT', opts.strict)
  Constants.set('MIN_LEVEL', opts.level)
  Constants.set('DEPTH', opts.depth)
  Constants.set('ARRAY_LENGTH', opts.maxArrayLength)
  Constants.set('TIME_STAMPS', opts.timeStamps)
  Constants.set('TIME_STAMPS_FORMAT', opts.stampFormat)
  Constants.set('TIME_STAMPS_ZONE', opts.timeZone)

  const levels = [60, 50, 40, 30, 20, 10]

  const chalk = require('./utils/chalk')
  const formatters = require('./formatters')

  const prettyStream = split(parser)
  const splitStream = split(chunk => chunk + Constants.NEW_LINE)

  prettyStream.pipe(splitStream)
  splitStream.pipe(writeStream)

  return prettyStream

  function parser (rawline) {

    if(!rawline) return Constants.NEW_LINE

    let record = {}

    try {
      record = JSON.parse(record)
    }


    const { err, value: record } = new Parse(rawline)

    if (err || !record || !isValidRecord(record)) {
      if (Constants.STRICT) return
      return rawline + Constants.NEW_LINE
    }
    if (!levels.includes(record.level)) record.level = 30
    if (record.level < Constants.MIN_LEVEL) return

    let line = formatters.head(record) + Constants.NEW_LINE

    if (hasSrc(record)) line += formatters.src(record)

    const keys = formatters.keys(record)
    if (keys) line += keys

    if (isError(record)) line += formatters.error(record)

    if (Constants.TIME_STAMPS) {
      // prettier-ignore
      return prefixLine(line, formatTime(record.time), record) + Constants.NEW_LINE
    }

    const header = Constants.headers[record.level]
    return prefixLine(line, header, record) + Constants.NEW_LINE
  }

  function prefixLine (line, prefix, record) {
    const colors = {
      60: chalk.red.bold.inverse,
      50: chalk.red,
      40: chalk.yellow,
      30: chalk.green,
      20: chalk.blue,
      10: chalk.cyan
    }

    const color = colors[record.level]
    const lines = line.split(Constants.NEW_LINE)
    lines.pop()
    return lines
      .map(line => `${color(prefix + Constants.PIPE)} ${line}`)
      .join(Constants.NEW_LINE)
  }

  function formatTime (time) {
    return moment(time)
      .tz(Constants.TIME_STAMPS_ZONE)
      .format(Constants.TIME_STAMPS_FORMAT)
  }
}

module.exports = pretty
