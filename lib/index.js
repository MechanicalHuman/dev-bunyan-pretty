'use strict'

const split = require('split2')
const Parse = require('json-parse-safe')
const utils = require('./utils')

const render = {
  head: require('./head/formatter'),
  error: require('./error/formatter'),
  keys: require('./keys/formatter'),
  src: require('./src/src-formatter')
}

function formatter (opts) {
  return parser

  function parser (rawline) {
    const parsed = new Parse(rawline)

    if (parsed.err || !parsed.value || !utils.isValid(parsed.value)) return rawline + '\n'

    const record = parsed.value || {}

    let line = ''
    line += render.head(record, opts.head)
    line += '\n'
    if (utils.hasSrc(record)) line += render.src(record, opts)
    const keys = render.keys(record, opts)
    if (keys) line += keys
    if (utils.isError(record)) line += render.error(record, opts)

    return line
  }
}

function pretty (writeStream, opts = {head: true, columns: 60}) {
  if (writeStream.isTTY) opts.columns = writeStream.columns

  const transformSteam = split(formatter(opts))

  transformSteam.pipe(writeStream)

  return transformSteam
}

module.exports = pretty
