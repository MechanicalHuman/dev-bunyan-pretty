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
  if (utils.isHttp(record)) {
    record.level = 31
    record.msg = utils.httpFormatter(record)
  }

  const head = {}

  head.loggerId = record.name
  head.message = record.msg || null
  head.time = getTimeDiff(record)
  head.id = getId(record)

  head.level = levels[record.level] || '&sp;&sp;LOG'
  head.levelId = record.level
  head.color = colors[record.level] || 'info'

  return render(head)
}

function render (local) {
  return formatter.render(template(local), utils.useColors())
}

function getTimeDiff (record) {
  const key = record.pid + record.name
  const time = new Date(record.time)
  let diff = false
  if (times.has(key)) {
    diff = ms(time - times.get(key))
    if (!diff.match(/^(-)/)) diff = `+${diff}`
  }
  times.set(key, time)
  return diff
}

function getId (record) {
  const acc = []

  if (record.req_id) {
    acc.push(`⇆ ${record.req_id}`)
    delete record.req_id
  }
  if (record.tag) {
    acc.push(`#${record.tag}`)
    delete record.tag
  }
  if (lodash.isEmpty(acc)) return false
  return acc.join(' - ')
}
