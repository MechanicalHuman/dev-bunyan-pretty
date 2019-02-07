'use strict'

const debug = require('debug')('mech:pretty:head')
const fp = require('lodash/fp')
const httpFormatter = require('./http-formatter')
const Constants = require('../constants')
const utils = require('../utils')

const colors = new Map()

/**
 * @param {Pretty.LogRecord} record
 * @param {Pretty.Configuration} config
 * @param {import("chalk").Chalk} chalk
 * @returns {string[]}
 */
module.exports = function formatHead (record, config, chalk) {
  const color = config.colorize ? getColor(record) : fp.identity

  const name =
    config.printHost === true
      ? record.app && record.app !== record.name
        ? color(`${record.hostname}:${record.app}:${record.name}`)
        : color(`${record.hostname}:${record.name}`)
      : record.app && record.app !== record.name
        ? color(`${record.app}:${record.name}`)
        : color(record.name)

  const tag = chalk.white.dim(getIds(record))

  let message

  if (utils.isHttp(record)) {
    const status = record.res.statusCode || 418
    message = fp.isEmpty(record.msg)
      ? httpFormatter(record, config, chalk) +
        ' - ' +
        utils.humanizeStatusCode(status)
      : httpFormatter(record, config, chalk) + ' - ' + record.msg
  } else {
    message = record.msg ? chalk.dim('[no msg]') : record.msg
    message = utils.shortPath(message)
    try {
      message = utils.hangingIndent(
        message,
        4,
        getavailableColumns(name, tag),
        ''
      )
    } catch (e) {
      debug(e)
    }
  }

  message = message.split(Constants.NEW_LINE)
  message = message.map(chalk.white)

  const msg = message.shift()

  message.unshift([name, msg, tag].join(Constants.SPACE_CHAR))

  return message.join(Constants.NEW_LINE)

  /**
   *
   * @param {Pretty.LogRecord} record
   */
  function getColor (record) {
    const key = record.pid + record.name + (record.req_id || record.reqId || '')
    if (colors.has(key)) return colors.get(key)

    /** @return {string} */
    const sample = arr => fp.sample(arr)
    const color = chalk.hex(sample(Constants.COLORS_256))
    colors.set(key, color)
    while (colors.size >= Constants.COLORS_256.length) {
      for (let key of colors.keys()) {
        colors.delete(key)
        break
      }
    }

    return color
  }

  function getIds (record) {
    const acc = []

    if (record.userId) {
      acc.push(`@${record.userId}`)
      delete record.userId
    }

    if (!record.userId && record.req && record.req.userId) {
      acc.push(`@${record.req.userId}`)
      delete record.req.userId
    }

    if (record.req_id) {
      acc.push(`⇆ ${record.req_id}`)
      delete record.req_id
    }

    if (!record.req_id && record.reqId) {
      acc.push(`⇆ ${record.reqId}`)
      delete record.reqId
    }

    if (fp.isEmpty(acc)) return ''

    return acc.join(' ')
  }

  /**
   * @param {string} name
   * @param {string} tag
   */
  function getavailableColumns (name, tag) {
    const headers = config.timeStamps
      ? utils.stringLength(config.stampsFormat) + 5
      : 10
    const extras = utils.stringLength([name, tag].join(Constants.SPACE_CHAR))
    const available = utils.getColumns() - (extras + headers)
    return available
  }
}
