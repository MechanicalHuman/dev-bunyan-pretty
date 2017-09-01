'use strict'

const Renderkid = require('renderkid')

const ms = require('pretty-ms')
const pug = require('pug')
const lodash = require('lodash')
const path = require('path')
const utils = require('../utils')

const formatter = new Renderkid()
const template = pug.compileFile(path.resolve(__dirname, './template.pug'), {self: true})
const style = require('./style')
const times = new Map()

const levels = {
  60: 'FATAL',
  50: 'ERROR',
  40: 'ALERT',
  31: '&sp;&sp;I/O',
  30: '&sp;&sp;LOG', // stupid renderkit trims whitespace
  20: 'DEBUG',
  10: 'TRACE'
}

const colors = {
  60: 'fatal',
  50: 'error',
  40: 'warn',
  31: 'http',
  30: 'info',
  20: 'debug',
  10: 'trace'
}

formatter.style(style)

module.exports = formatHead

function formatHead (record) {
  if (!levels.hasOwnProperty(record.level)) record.level = 30

  if (record.__isError && !record.msg) {
    record.msg = lodash.get(record, 'err.message', null)
  }

  if (record.__ishttp) {
    record.level = 31
    record.msg = utils.httpFormatter(record)
  }

  const head = {}

  head.loggerId = record.name
  head.message = record.msg || null
  head.time = getTimeDiff(record)
  head.reqId = getRequestId(record)

  head.level = levels[record.level]
  head.levelId = record.level
  head.color = colors[record.level]

  return render(head)
}

function render (local) {
  return formatter.render(template(local), utils.useColors())
}

function getTimeDiff (record) {
  const key = record.pid + record.name
  const time = new Date(record.time)
  let diff
  if (times.has(key)) {
    diff = ms(time - times.get(key))
  } else {
    diff = ms(0)
  }
  times.set(key, time)
  if (!diff.match(/^(-)/)) diff = `+${diff}`
  return diff
}

function getRequestId (record) {
  const id = record.req_id || record.tag || false
  if (!id) return ''
  return `⇆ ${id}`
}
