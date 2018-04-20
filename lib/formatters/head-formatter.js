'use strict'

const debug = require('debug')('mech:logger:head')
const stringLength = require('string-length')
const hangingIndent = require('hanging-indent')
const lo = require('lodash')

const httpFormatter = require('./http-formatter')

const Constants = require('../constants')
const Config = require('../config')
const chalk = require('../utils/chalk')
const utils = require('../utils')

const colors = new Map()

module.exports = function formatHead (record) {
  const color = getColor(record)

  const name =
    record.app && record.app !== record.name
      ? color(`${record.app}:${record.name}`)
      : color(record.name)

  const tag = chalk.white.dim(getTag(record))

  let message

  if (utils.isHttp(record)) {
    message = lo.isEmpty(record.msg)
      ? httpFormatter(record)
      : httpFormatter(record) + ' - ' + record.msg
  } else {
    message = lo.isEmpty(record.msg) ? chalk.dim('[no msg]') : record.msg
  }

  message = utils.shortPath(message)

  try {
    message = hangingIndent(message, 4, getavailableColumns(name, tag))
  } catch (e) {
    debug(e)
  }

  message = message.split(Constants.NEW_LINE)
  message = message.map(line => chalk.white(line))

  const msg = message.shift()

  message.unshift([name, msg, tag].join(Constants.SPACE_CHAR))

  return message.join(Constants.NEW_LINE)
}

function getColor (record) {
  const key = record.pid + record.name
  if (colors.has(key)) return colors.get(key)
  if (Config.colorLevel === 1) {
    const color = chalk.hex(lo.sample(Constants.COLORS_16))
    colors.set(key, color)
    return color
  } else if (Config.colorLevel === 2) {
    const color = chalk.hex(lo.sample(Constants.COLORS_256))
    colors.set(key, color)
    return color
  } else {
    return lo.identity
  }
}

function getTag (record) {
  const acc = []

  if (record.userId) {
    acc.push(`@${record.userId}`)
    delete record.userId
  }

  if (record.req && record.req.userId) {
    acc.push(`@${record.req.userId}`)
    delete record.req.userId
  }

  if (record.req_id) {
    acc.push(`⇆ ${record.req_id}`)
    delete record.req_id
  }

  if (record.reqId) {
    acc.push(`⇆ ${record.reqId}`)
    delete record.reqId
  }

  if (lo.isEmpty(acc)) return ''

  return acc.join(' - ')
}

function getavailableColumns (name, tag) {
  const headers = Config.timeStamps ? 24 : 10
  const extras = stringLength([name, tag].join(Constants.SPACE_CHAR))
  return Config.columns - (extras + headers)
}
