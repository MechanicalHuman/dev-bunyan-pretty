'use strict'

const ms = require('pretty-ms')
const lo = require('lodash')
const fp = require('lodash/fp')
const parseHeaders = require('parse-headers')
const ipaddr = require('ipaddr.js')
const chalk = require('../utils/chalk')

function formatHttp (record) {
  const method = chalk.reset.bold.white(lo.get(record, 'req.method', '-'))
  const requrl = chalk.reset(
    decodeURIComponent(lo.get(record, 'req.url', '-'))
  )

  let headers =
    lo.get(record, 'res.header', false) ||
    lo.get(record, 'res.headers', false) ||
    ''

  if (!lo.isPlainObject(headers)) headers = parseHeaders(headers)

  let timeField = false

  timeField = lo.get(record, 'duration', false)
  if (timeField) lo.unset(record, 'duration')

  timeField = lo.get(record, 'res.responseTime', false)
  if (timeField) lo.unset(record, 'res.responseTime')

  let time = parseInt(
    timeField ||
      lo.get(headers, 'x-response-time', false) ||
      lo.get(headers, 'response-time', false) ||
      0,
    10
  )

  if (isNaN(time)) time = 0

  time = chalk.reset.cyan(`+${ms(time)}`)

  const message = [
    method,
    getStatusCode(record),
    requrl,
    getRemoteAddress(record),
    time
  ]

  return fp.pipe([fp.compact, fp.join(' ')])(message)
}

module.exports = formatHttp

function getStatusCode (record) {
  const status = lo.get(record, 'res.statusCode', '-')
  const format = pickColor(status)

  return format(status)

  function pickColor (status) {
    return status >= 500
      ? chalk.reset.red
      : status >= 400
        ? chalk.reset.yellow
        : status >= 300
          ? chalk.reset.cyan
          : status >= 200 ? chalk.reset.green : chalk.reset
  }
}

function getRemoteAddress (record) {
  const format = chalk.reset.white

  return format(getIp(record))

  function getIp (record) {
    const val = lo.get(record, 'req.remoteAddress', '127.0.0.1')
    return `➔ ${ipaddr.process(val).toString()}`
  }
}

// function getTime(record){
//   'responseTime'
//   'Response-Time'
// }
