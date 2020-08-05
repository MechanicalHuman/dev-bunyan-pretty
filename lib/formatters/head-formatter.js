/*!
 * Copyright 2019 Jorge Proaño.
 */
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
 * @return {string}
 */
module.exports = function formatHead (record, config, chalk) {
  const color = config.colorize ? getColor(record) : fp.identity
  const dim = config.colorize ? chalk.white.dim : fp.identity
  const white = config.colorize ? chalk.white : fp.identity

  const name =
    config.printHost === true
      ? record.app && record.app !== record.name
        ? `${record.hostname}:${record.app}:${record.name}`
        : `${record.hostname}:${record.name}`
      : record.app && record.app !== record.name
        ? `${record.app}:${record.name}`
        : record.name

  const tag = getIds(record)
  let message = getMsg(record)

  debug('tag: %s', tag)
  debug('name: %s', name)
  debug('msg: %s', message)

  if (utils.isHttp(record)) {
    message = `${httpFormatter(record, config, chalk)} - ${message}`
  } else {
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

  message = message.map(msg => white(msg))

  const head = [
    color(name),
    color(Constants.FW),
    message.shift(),
    dim(tag)
  ].join(Constants.SPACE_CHAR)

  debug('head: %s', head)

  message.unshift(head)
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

  function getMsg (record) {
    return fp.isEmpty(record.msg)
      ? utils.isHttp(record)
        ? utils.humanizeStatusCode(fp.getOr(418, 'res.statusCode', record))
        : '[no msg]'
      : record.msg
  }
}
