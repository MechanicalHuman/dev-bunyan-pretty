'use strict'

const split = require('split2')
const Parse = require('fast-json-parse')

const utils = require('./utils')

const render = {
  head: require('./head/formatter'),
  error: require('./error/formatter'),
  keys: require('./keys/formatter'),
  src: require('./src/src-formatter')
}

function formatter (rawline) {
  const parsed = new Parse(rawline)
  const record = parsed.value

  if (parsed.err || !utils.isBunyanLine(record)) return rawline + '\n'

  record.__ishttp = utils.isHttp(record)
  record.__isError = utils.isError(record)

  const keys = render.keys(record)
  const error = render.error(record)
  const src = render.src(record)

  let line = ''
  line += render.head(record)
  line += '\n'
  if (src) line += src
  if (keys) line += keys
  if (error) line += error

  return line
}

function pretty (writeStream) {
  const transformSteam = split(formatter)
  transformSteam.pipe(writeStream)
  return transformSteam
}

module.exports = pretty
