'use strict'

const ms = require('pretty-ms')

const lodash = require('lodash')
const chalk = require('chalk')
const parseHeaders = require('parse-headers')

function formatHttp (record) {
  const method = chalk.reset.bold.white(lodash.get(record, 'req.method', '-'))
  const requrl = chalk.reset(decodeURIComponent(lodash.get(record, 'req.url', '-')))

  const headers = parseHeaders(lodash.get(record, 'res.header', false) || lodash.get(record, 'res.headers', false) || '')

  let time = parseInt(
    lodash.get(record, 'duration', false) ||
    lodash.get(record, 'response-time', false) ||
    lodash.get(headers, 'x-response-time', false) ||
    lodash.get(headers, 'response-time', false) || 0,
    10)

  if (isNaN(time)) time = 0
  time = chalk.reset.white(ms(time))
  return `${method} ${requrl} ${getStatusCode(record)} ${getRemoteAddress(record)} ${time}`
}

module.exports = formatHttp

function getStatusCode (record) {
  const status = lodash.get(record, 'res.statusCode', '-')
  const format = pickColor(status)

  return format(status)

  function pickColor (status) {
    return status >= 500 ? chalk.reset.red
      : status >= 400 ? chalk.reset.yellow
        : status >= 300 ? chalk.reset.cyan
          : status >= 200 ? chalk.reset.green
            : chalk.reset
  }
}

function getRemoteAddress (record) {
  const format = chalk.reset.white

  return format(getIp(record))

  function getIp (record) {
    let ip = (lodash.get(record, 'req.remoteAddress', '::1')).replace(/^(:{2}\D*)/, '')
    if (ip === '1' || ip === '127.0.0.1') return '-'
    return `➔ ${ip}`
  }
}
