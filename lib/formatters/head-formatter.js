'use strict'

const debug = require('debug')('mech:logger:head')
const stringLength = require('string-length')
const lodash = require('lodash')
const utils = require('../utils')
const httpFormatter = require('./http-formatter')
const Constants = require('../constants')
const Config = require('../config')
const chalk = require('../utils/chalk')
const hangingIndent = require('hanging-indent')
const colors = new Map()

module.exports = formatHead

function formatHead (record) {
  const color = getColor(record)
  const name = color(record.name)
  const tag = chalk.white.dim(getTag(record))

  record.msg = record.msg ? record.msg : '[no msg]'

  if (utils.isHttp(record)) {
    record.msg = httpFormatter(record)
    return [name, record.msg, tag].join(Constants.SPACE_CHAR)
  }

  const rest = stringLength([name, tag].join(Constants.SPACE_CHAR))

  let message = utils.shortPath(record.msg)

  try {
    message = hangingIndent(message, 4, Config.columns - rest)
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
    const color = chalk.hex(lodash.sample(Constants.COLORS_16))
    colors.set(key, color)
    return color
  } else if (Config.colorLevel === 2) {
    const color = chalk.hex(lodash.sample(Constants.COLORS_256))
    colors.set(key, color)
    return color
  } else {
    return lodash.identity
  }
}

function getTag (record) {
  const acc = []

  if (record.req_id) {
    acc.push(`⇆ ${record.req_id}`)
    delete record.req_id
  }

  if (lodash.isEmpty(acc)) return ''

  return acc.join(' - ')
}
