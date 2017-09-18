'use strict'

const split = require('split2')
const Parse = require('json-parse-safe')
const { isValid, hasSrc, isError } = require('./utils')

const formatters = require('./formatters')

function parser (rawline) {
  const { err, value: record } = new Parse(rawline)

  if (err || !record || !isValid(record)) {
    // if (strict === true) return
    return rawline + '\n'
  }

  let line = ''
  line += formatters.head(record)
  line += '\n'
  if (hasSrc(record)) line += formatters.src(record)
  const keys = formatters.keys(record)
  if (keys) line += keys
  if (isError(record)) line += formatters.error(record)

  return line
}

function pretty (writeStream, opts) {
  const stream = split(parser)
  stream.pipe(writeStream)
  return stream
}

module.exports = pretty
