/*!
 * Copyright 2019 Jorge Proaño.
 */
'use strict'

const ms = require('pretty-ms')
const lo = require('lodash')
const fp = require('lodash/fp')
const parseHeaders = require('parse-headers')
const ipaddr = require('ipaddr.js')

/**
 * @param {Pretty.HttpRecord} record
 * @param {Pretty.Configuration} _config
 * @param {import("chalk").Chalk} chalk
 * @returns {string[]}
 * @todo Use fp.getOr instead of lo.get
 */
function formatHttp (record, _config, chalk) {
  const message = [
    getMethod(),
    getStatusCode(),
    getReqUrl(),
    getRemoteAddress(),
    getTime()
  ]

  return fp.pipe([fp.compact, fp.join(' ')])(message)

  function getMethod () {
    return chalk.reset.bold.white(lo.get(record, 'req.method', '-'))
  }

  function getStatusCode () {
    const status = lo.get(record, 'res.statusCode', '-')
    const format = pickColor(status)

    return format(status)

    /**
     * @param {number} status
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

  function getReqUrl () {
    return chalk.reset(decodeURIComponent(lo.get(record, 'req.url', '-')))
  }

  function getRemoteAddress () {
    const val = lo.get(record, 'req.remoteAddress', '127.0.0.1')
    return chalk.reset.white(`➔ ${ipaddr.process(val).toString()}`)
  }

  function getTime () {
    let data

    if (fp.has('duration', record)) data = getAndUnset('duration')
    else if (fp.has('responseTime', record)) data = getAndUnset('responseTime')
    else if (fp.has('res.responseTime', record)) {
      data = getAndUnset('res.responseTime')
    } else if (fp.has('responseTime', record)) {
      data = getAndUnset('responseTime')
    } else {
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
}

module.exports = formatHttp
