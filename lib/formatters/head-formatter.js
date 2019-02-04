'use strict'

const debug = require('debug')('mech:pretty:head')
const lo = require('lodash')
const config = require('config')
const httpFormatter = require('./http-formatter')
const Constants = require('../constants')
const chalk = require('../utils/chalk')
const Utils = require('../utils')

const colors = new Map()

/** @param {LogRecord} record  */
module.exports = function formatHead (record) {
  const color = getColor(record)

  const name =
    config.get('pretty.printHost') === true
      ? record.app && record.app !== record.name
        ? color(`${record.hostname}:${record.app}:${record.name}`)
        : color(`${record.hostname}:${record.name}`)
      : record.app && record.app !== record.name
        ? color(`${record.app}:${record.name}`)
        : color(record.name)

  const tag = chalk.white.dim(getIds(record))

  let message

  if (Utils.isHttp(record)) {
    const status = record.res.statusCode || 418
    message = lo.isEmpty(record.msg)
      ? httpFormatter(record) + ' - ' + Utils.humanizeStatusCode(status)
      : httpFormatter(record) + ' - ' + record.msg
  } else {
    message = record.msg ? chalk.dim('[no msg]') : record.msg
    message = Utils.shortPath(message)
    try {
      message = Utils.hangingIndent(
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
}

function getColor (record) {
  const key = record.pid + record.name + (record.req_id || record.reqId || '')
  if (colors.has(key)) return colors.get(key)
  if (config.get('pretty.colorLevel') === 1) {
    const color = chalk.hex(lo.sample(Constants.COLORS_16))
    colors.set(key, color)
    return color
  } else if (config.get('pretty.colorLevel') === 2) {
    const color = chalk.hex(lo.sample(Constants.COLORS_256))
    colors.set(key, color)
    return color
  } else {
    return lo.identity
  }
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

  if (lo.isEmpty(acc)) return ''

  return acc.join(' ')
}

/**
 * @param {string} name
 * @param {string} tag
 */
function getavailableColumns (name, tag) {
  const headers = config.get('pretty.timeStamps')
    ? Utils.stringLength(config.get('pretty.stampsFormat')) + 5
    : 10
  const extras = Utils.stringLength([name, tag].join(Constants.SPACE_CHAR))
  const available = Utils.getColumns() - (extras + headers)
  return available
}
