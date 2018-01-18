'use strict'

const split = require('split2')
const Parse = require('json-parse-safe')
const { isValid, hasSrc, isError } = require('./utils')
const chalk = require('./utils/chalk')
const formatters = require('./formatters')
const Constants = require('./constants')

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

  const time = chalk.dim(
    `${require('moment')(record.time).format('YYYY-MM-DD-HH:mm:ss')} | `
  )

  // console.log(line.split(Constants.NEW_LINE))
  const lines = line.split(Constants.NEW_LINE)
  lines.pop()
  const timestamped = lines.map(v => `${time}${v}`).join(Constants.NEW_LINE)
  return timestamped + Constants.NEW_LINE
}

function pretty (writeStream, opts) {
  const stream = split(parser)
  stream.pipe(writeStream)
  return stream
}

module.exports = pretty
