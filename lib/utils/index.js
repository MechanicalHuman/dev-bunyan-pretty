'use strict'

const fp = require('lodash/fp')
const moment = require('moment-timezone')
const Constants = require('../constants')
const Config = require('../config')

exports.format = require('util').format
exports.inspect = require('util').inspect

exports.isValid = fp.negate(fp.isNil)

exports.isHttp = rec => testRecord(Constants.HTTP_FIELDS, rec)
exports.isError = rec => testRecord(Constants.ERROR_FIELDS, rec)

exports.hasSrc = rec => testRecord(Constants.SOURCE_FIELDS, rec)
exports.isValidRecord = rec => testRecord(Constants.CORE_FIELDS, rec)

exports.parseRecord = rawRecord => {
  const record = JSON.parse(rawRecord)
  if (!testRecord(Constants.CORE_FIELDS, record)) {
    throw new Error('Invalid record')
  }
  return exports.normalizeRecordFields(record)
}

exports.shortPath = string => {
  if (!fp.isString(string)) return string
  const regEx = new RegExp(require('os').homedir(), 'gmi')
  return string.replace(regEx, '~')
}

exports.modulePath = string => {
  if (!fp.isString(string)) return string
  const regEx = new RegExp('^.*node_modules/(\\w+)/(.*)', 'gmi')
  return string.replace(regEx, '[$1]/$2')
}

exports.stringLength = require('string-length')

exports.maxLength = (collection = {}, omit = []) => {
  return fp.pipe([
    fp.keys,
    fp.difference(omit),
    fp.reduce(0, (length, current) => {
      const test = exports.stringLength(current)
      return test > length ? test : length
    })
  ])(collection)
}

exports.asSpaces = (n = 0) => fp.repeat(n, Constants.SPACE_CHAR)

exports.isValidLevel = level => Constants.LEVELS.includes(level)

exports.normalizeRecordFields = record => {
  if (!Constants.LEVELS.includes(record.level)) record.level = Constants.INFO
  if (fp.isNil(record.msg)) record.msg = ''
  return record
}

exports.pickHeadColor = level => {
  const chalk = require('./chalk')

  const colors = {
    60: chalk.red.bold.inverse,
    50: chalk.red,
    40: chalk.yellow,
    30: chalk.green,
    20: chalk.blue,
    10: chalk.cyan
  }

  return colors[level] || chalk.green
}

exports.prefixLines = (lines, record) => {
  const color = exports.pickHeadColor(record.level)
  const prefix = Config.timeStamps
    ? exports.getTimeStamp(record)
    : exports.getHeader(record)

  const prefixed = lines
    .map(line => `${color(prefix + Constants.PIPE)} ${line}`)
    .join(Constants.NEW_LINE)

  return prefixed
}

exports.getHeader = record => Constants.headers[record.level]

exports.getTimeStamp = record =>
  moment(record.time)
    .tz(Config.stampsTimeZone)
    .format(Config.stampsFormat)

function testRecord (keys, record) {
  return fp.pipe([
    fp.map(key => fp.get(key, record)),
    fp.every(exports.isValid)
  ])(keys)
}
