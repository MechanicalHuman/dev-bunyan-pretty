'use strict'

const split = require('split2')
const Parse = require('json-parse-safe')
const moment = require('moment-timezone')

const Constants = require('./constants')

const { isValid, hasSrc, isError } = require('./utils')

function pretty (writeStream, opts) {
  const {
    level = 'trace',
    strict = false,

    depth = 4,
    maxArrayLength = 100,
    colors = require('supports-color').supportsColor(writeStream).level || 0,

    stampFormat = 'YYYY-MM-DD-HH:mm:ss',
    timeStamps = true,
    timeZone = moment.tz.guess()
  } = opts

  Constants.MIN_LEVEL = Constants.LEVELS[level.toLowerCase()] || 0
  Constants.STRICT = strict

  Constants.DEPTH = depth
  Constants.ARRAY_LENGTH = maxArrayLength

  Constants.TIME_STAMPS = timeStamps
  Constants.TIME_STAMPS_FORMAT = stampFormat
  Constants.TIME_STAMPS_ZONE = timeZone

  Constants.USE_COLORS = colors

  const chalk = require('./utils/chalk')
  const formatters = require('./formatters')

  const prettyStream = split(parser)
  const splitStream = split(chunk => chunk + Constants.NEW_LINE)

  prettyStream.pipe(splitStream)
  splitStream.pipe(writeStream)

  return prettyStream

  function parser (rawline) {
    const { err, value: record } = new Parse(rawline)

    if (err || !record || !isValid(record)) {
      if (Constants.STRICT) return
      return rawline + Constants.NEW_LINE
    }

    if (record.level < Constants.MIN_LEVEL) return

    let line = ''
    line += formatters.head(record)
    line += Constants.NEW_LINE

    if (hasSrc(record)) line += formatters.src(record)

    const keys = formatters.keys(record)
    if (keys) line += keys

    if (isError(record)) line += formatters.error(record)

    if (Constants.TIME_STAMPS) {
      const time = moment(record.time)
        .tz(Constants.TIME_STAMPS_ZONE)
        .format(Constants.TIME_STAMPS_FORMAT)
      return prefixLine(line, time, record) + Constants.NEW_LINE
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
}

module.exports = pretty
