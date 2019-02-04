'use strict'

const ms = require('pretty-ms')
const lo = require('lodash')
const fp = require('lodash/fp')
const parseHeaders = require('parse-headers')
const ipaddr = require('ipaddr.js')
const chalk = require('../utils/chalk')

function formatHttp (/** @type {HttpRecord} */ record) {
  const method = chalk.reset.bold.white(lo.get(record, 'req.method', '-'))
  const requrl = chalk.reset(decodeURIComponent(lo.get(record, 'req.url', '-')))

  const message = [
    method,
    getStatusCode(record),
    requrl,
    getRemoteAddress(record),
    getTime(record)
  ]

  return fp.pipe([fp.compact, fp.join(' ')])(message)
}

module.exports = formatHttp

function getStatusCode (/** @type {HttpRecord} */ record) {
  const status = lo.get(record, 'res.statusCode', '-')
  const format = pickColor(status)

  return format(status)

  /**
   * @param {number|string} status
   */
  function pickColor (status) {
    return status >= 500
      ? chalk.reset.red
      : status >= 400
        ? chalk.reset.yellow
        : status >= 300
          ? chalk.reset.cyan
          : status >= 200
            ? chalk.reset.green
            : chalk.reset
  }
}

function getRemoteAddress (/** @type {HttpRecord} */ record) {
  const format = chalk.reset.white

  return format(getIp(record))

  function getIp (/** @type {HttpRecord} */ record) {
    const val = lo.get(record, 'req.remoteAddress', '127.0.0.1')
    return `➔ ${ipaddr.process(val).toString()}`
  }
}

function getTime (/** @type {HttpRecord} */ record) {
  let data

  if (fp.has('duration')) data = getAndUnset('duration')
  else if (fp.has('res.responseTime')) data = getAndUnset('res.responseTime')
  else if (fp.has('responseTime')) data = getAndUnset('responseTime')
  else {
    let headers =
      lo.get(record, 'res.header', false) ||
      lo.get(record, 'res.headers', false) ||
      ''

    if (!lo.isPlainObject(headers)) headers = parseHeaders(headers)

    data =
      lo.get(headers, 'x-response-time', false) ||
      lo.get(headers, 'response-time', false) ||
      0
  }

  return formatTime(data)

  function formatTime (timeField = '') {
    let time = parseInt(timeField, 10)
    if (isNaN(time)) time = 0
    return chalk.reset.cyan(`+${ms(time)}`)
  }

  function getAndUnset (field = '') {
    const output = lo.get(record, field, 0)
    lo.unset(record, field)
    return String(output)
  }
}
