'use strict'

const split = require('split2')
const Parse = require('json-parse-safe')
const utils = require('./utils')
const { strict, filterLevel, filter } = require('./constants')
const render = {
  head: require('./head/formatter'),
  error: require('./error/formatter'),
  keys: require('./keys/formatter'),
  src: require('./src/src-formatter')
}

function parser (rawline) {
  const parsed = new Parse(rawline)

  if (parsed.err || !parsed.value || !utils.isValid(parsed.value)) {
    if (strict === true) return
    return rawline + '\n'
  }

  const record = parsed.value

  if (filterLevel >= record.level) return
  if (filter.call(record) !== true) return

  let line = ''
  line += render.head(record)
  line += '\n'
  if (utils.hasSrc(record)) line += render.src(record)
  const keys = render.keys(record)
  if (keys) line += keys
  if (utils.isError(record)) line += render.error(record)

  return line
}

function pretty (writeStream, opts) {
  const transformSteam = split(parser)

  transformSteam.pipe(writeStream)

  return transformSteam
}

module.exports = pretty
