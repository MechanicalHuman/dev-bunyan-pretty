'use strict'

const ms = require('pretty-ms')
const lodash = require('lodash')
const fp = require('lodash/fp')
const chalk = require('../utils/chalk')
const parseHeaders = require('parse-headers')

function formatHttp (record) {
  const method = chalk.reset.bold.white(lodash.get(record, 'req.method', '-'))
  const requrl = chalk.reset(
    decodeURIComponent(lodash.get(record, 'req.url', '-'))
  )

  let headers =
    lodash.get(record, 'res.header', false) ||
    lodash.get(record, 'res.headers', false) ||
    ''

  if (!lodash.isPlainObject(headers)) headers = parseHeaders(headers)

  let timeField = false

  timeField = lodash.get(record, 'duration', false)
  if (timeField) lodash.unset(record, 'duration')

  timeField = lodash.get(record, 'response-time', false)
  if (timeField) lodash.unset(record, 'response-time')

  let time = parseInt(
    timeField ||
      lodash.get(headers, 'x-response-time', false) ||
      lodash.get(headers, 'response-time', false) ||
      0,
    10
  )

  if (isNaN(time)) time = 0

  time = chalk.reset.white(ms(time))

  const message = [
    method,
    requrl,
    getStatusCode(record),
    getRemoteAddress(record),
    time,
    getUser(record)
  ]

  return fp.pipe([fp.compact, fp.join(' ')])(message)
}

module.exports = formatHttp

function getUser (record) {
  const user = lodash.get(record, 'req.userId')
  if (user) return chalk.dim(`@${user}`)
  return undefined
}

function getStatusCode (record) {
  const status = lodash.get(record, 'res.statusCode', '-')
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
    let ip = lodash
      .get(record, 'req.remoteAddress', '::1')
      .replace(/^(:{2}\D*)/, '')
    ip = ip === '1' ? '127.0.0.1' : ip
    return `➔ ${ip}`
  }
}
