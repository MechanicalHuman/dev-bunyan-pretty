'use strict'

const debug = require('debug')('mech:logger:head')
const stringLength = require('string-length')
const lodash = require('lodash')
const utils = require('../utils')
const httpFormatter = require('./http-formatter')
const Constants = require('../constants')
const chalk = require('../utils/chalk')
const hangingIndent = require('hanging-indent')
const colors = new Map()

const levels = {
  60: chalk.red.bold.inverse('FATAL |'),
  50: chalk.red.bold('ERROR |'),
  40: chalk.yellow.bold('ALERT |'),
  31: chalk.magenta.bold('  I/O |'),
  30: chalk.green.bold('  LOG |'), // stupid renderkit trims whitespace
  20: chalk.blue.bold('DEBUG |'),
  10: chalk.cyan.bold('TRACE |')
}

// const levels = {
//   60: chalk.red.bold.inverse,
//   50: chalk.red.bold,
//   40: chalk.yellow.bold,
//   31: chalk.magenta.bold,
//   30: chalk.green.bold, // stupid renderkit trims whitespace
//   20: chalk.blue.bold,
//   10: chalk.cyan.bold
// }

module.exports = formatHead

function formatHead (record) {
  if (utils.isHttp(record)) {
    record.level = 31
    record.msg = httpFormatter(record)
    // TODO: keep messages
  }

  const color = getColor(record)
  const header = levels[record.level]
  const name = color(record.name)
  const tag = chalk.white.dim(getTag(record))

  record.msg = record.msg ? record.msg : '[no msg]'

  if (record.level === 31) {
    return [header, name, record.msg, tag].join(Constants.SPACE_CHAR)
  }

  const rest = stringLength([header, name, tag].join(Constants.SPACE_CHAR))

  let message = utils.shortPath(record.msg)

  try {
    message = hangingIndent(
      message,
      stringLength(header) + 4,
      Constants.COLUMNS - rest
    )
  } catch (e) {
    debug(e)
  }

  message = message.split(Constants.NEW_LINE)
  message = message.map(line => chalk.white(line))

  const msg = message.shift()

  message.unshift([header, name, msg, tag].join(Constants.SPACE_CHAR))

  return message.join(Constants.NEW_LINE)
}

function getColor (record) {
  const key = record.pid + record.name
  if (colors.has(key)) return colors.get(key)
  const color = chalk.hex(lodash.sample(Constants.COLORS_256))
  colors.set(key, color)
  return color
}

function getTag (record) {
  const acc = []

  if (record.req_id) {
    acc.push(`⇆ ${record.req_id}`)
    delete record.req_id
  }
  if (record.tag) {
    acc.push(chalk.italic(`#${record.tag}`))
    delete record.tag
  }
  if (lodash.isEmpty(acc)) return ''
  return acc.join(' - ')
}
