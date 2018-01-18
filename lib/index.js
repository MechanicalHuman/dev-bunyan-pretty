'use strict'

const split = require('split2')
const Parse = require('json-parse-safe')
const { isValid, hasSrc, isError } = require('./utils')
const chalk = require('./utils/chalk')
const formatters = require('./formatters')
const Constants = require('./constants')
const moment = require('moment')

const levels = {
  60: 'FATAL',
  50: 'ERROR',
  40: 'ALERT',
  30: '  LOG',
  20: 'DEBUG',
  10: 'TRACE'
}
const colors = {
  60: chalk.red.bold.inverse,
  50: chalk.red,
  40: chalk.yellow,
  30: chalk.green,
  20: chalk.blue,
  10: chalk.cyan
}

function parser (rawline) {
  const { err, value: record } = new Parse(rawline)

  if (err || !record || !isValid(record)) {
    // if (strict === true) return
    return rawline + Constants.NEW_LINE
  }

  let line = ''
  line += formatters.head(record)
  line += Constants.NEW_LINE
  if (hasSrc(record)) line += formatters.src(record)
  const keys = formatters.keys(record)
  if (keys) line += keys
  if (isError(record)) line += formatters.error(record)

  if (Constants.TIME_STAMPS) {
    const time = moment(record.time).format(Constants.TIME_STAMPS_FORMAT)
    return prefixLine(line, time, record) + Constants.NEW_LINE
  }
  const header = levels[record.level]
  return prefixLine(line, header, record) + Constants.NEW_LINE
}

function pretty (writeStream, opts) {
  const stream = split(parser)
  stream.pipe(writeStream)
  return stream
}

function prefixLine (line, prefix, record) {
  const color = colors[record.level]
  const lines = line.split(Constants.NEW_LINE)
  lines.pop()
  return lines
    .map(line => `${color(prefix + Constants.PIPE)} ${line}`)
    .join(Constants.NEW_LINE)
}

module.exports = pretty
