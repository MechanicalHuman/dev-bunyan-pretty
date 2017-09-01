'use strict'

const ms = require('pretty-ms')

const lodash = require('lodash')
const chalk = require('chalk')
const parseHeaders = require('parse-headers')

function formatHttp (record) {
  if (!record.__ishttp) return

  const method = chalk.reset.bold.white(lodash.get(record, 'req.method', '-'))
  const requrl = chalk.styles.reset.open + decodeURIComponent(lodash.get(record, 'req.url', '-')) + chalk.styles.reset.close
  const status = getStatusCode(record)
  const remoteAddress = chalk.reset.white(getRemoteAddress(record))
  const headers = parseHeaders(
    lodash.get(record, 'res.header', false) ||
    lodash.get(record, 'res.headers', false) ||
    lodash.get(record, 'response-headers', false) ||
    lodash.get(record, 'res-headers', false) ||
    ''
  )
  let time = parseInt(lodash.get(record, 'duration', false) ||
    lodash.get(record, 'response-time', false) ||
    lodash.get(headers, 'x-response-time', false) ||
    lodash.get(headers, 'response-time', false) ||
    0, 10)

  if (isNaN(time)) time = 0
  time = chalk.reset.white(ms(time))
  const httpreq = `${method} ${requrl} ${status} ${remoteAddress} ${time}`
  return httpreq
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
  let ip = lodash.get(record, 'req.remoteAddress', '::1')
  ip = ip.replace(/^(:{2}\D*)/, '')
  if (ip === '1' ||
    ip === '127.0.0.1') return '-'
  return `➔ ${ip}`
}
