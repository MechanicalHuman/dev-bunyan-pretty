'use strict'

module.exports.isHttp = isHttp
module.exports.isError = isError
module.exports.useColors = useColors
module.exports.isBunyanLine = isBunyanLine
module.exports.httpFormatter = require('./http-formatter')

function isHttp (line) {
  return line && line.hasOwnProperty('req') && line.hasOwnProperty('res')
}

function isError (line) {
  return line && line.hasOwnProperty('err') && line.error !== null
}

function isBunyanLine (rec) {
  if (
    rec.v == null ||
    rec.level == null ||
    rec.name == null ||
    rec.hostname == null ||
    rec.pid == null ||
    rec.time == null ||
    rec.msg == null
  ) {
    return false
  }
  return true
}

function useColors () {
  if (process.env['FORCE_COLOR'] === '1') return true
  return false
}
