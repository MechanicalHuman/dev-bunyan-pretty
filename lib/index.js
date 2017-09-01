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

function formatterWidth (size = 60) {
  return formatter

  function formatter (rawline) {
    const parsed = new Parse(rawline)

    if (parsed.err || !parsed.value || !utils.isValid(parsed.value)) return rawline + '\n'

    const record = parsed.value || {}

    let line = ''
    line += render.head(record, size)
    line += '\n'
    if (utils.hasSrc(record)) line += render.src(record, size)
    const keys = render.keys(record, size)
    if (keys) line += keys
    if (utils.isError(record)) line += render.error(record, size)

    return line
  }
}

function pretty (writeStream) {
  let columns = 60

  if (writeStream.isTTY) columns = writeStream.columns

  const formatter = formatterWidth(columns)
  const transformSteam = split(formatter)

  transformSteam.pipe(writeStream)

  return transformSteam
}

module.exports = pretty
