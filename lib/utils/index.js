'use strict'

const fp = require('lodash/fp')
const moment = require('moment-timezone')
const Constants = require('../constants')
const Config = require('../config')
const { STATUS_CODES } = require('http')

exports.humanizeStatusCode = input => fp.getOr('Unknown', input, STATUS_CODES)

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
  const cwd = process.cwd()
  const regEx = new RegExp(cwd, 'gmi')
  const replacer = cwd === require('os').homedir() ? '~' : '[cwd]'
  return string.replace(regEx, replacer)
}

exports.modulePath = string => {
  if (!fp.isString(string)) return string
  const regEx = new RegExp(
    '^.*node_modules/([a-zA-Z0-9-]+|@[a-zA-Z0-9-]+/[a-zA-Z0-9-]+)/(.*)',
    'gmi'
  )
  return string.replace(regEx, '[$1]/$2')
}

exports.stringLength = require('string-length')

exports.maxLength = (collection = {}, omit = []) => {
  return fp.pipe([
    fp.omit(omit),
    fp.keys,
    fp.reduce((length, current) => {
      const test = exports.stringLength(current)
      return test > length ? test : length
    }, 0)
  ])(collection)
}

exports.asSpaces = (n = 0) => fp.repeat(n, Constants.SPACE_CHAR)

exports.isValidLevel = level => Constants.LEVELS.includes(level)

exports.normalizeRecordFields = record => {
  if (!Constants.LEVELS.includes(record.level)) record.level = Constants.INFO
  if (fp.isNil(record.msg)) record.msg = ''
  if (fp.isNil(record.name)) record.name = 'app'
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

  const prefix =
    Config.timeStamps === true
      ? moment(record.time)
        .tz(Config.stampsTimeZone)
        .format(Config.stampsFormat)
      : Constants.headers[record.level]

  const prefixed = lines
    .join(Constants.NEW_LINE)
    .split(Constants.NEW_LINE)
    .map(line => `${color(prefix + Constants.PIPE)} ${line}`)
    .join(Constants.NEW_LINE)

  return prefixed
}

exports.stringLength = require('string-length')

/**
 * format a string into a paragraph with hanging indents
 *
 * @param {string} line - source string to format
 * @param {number} indent - number of spaces to indent lines
 * @param {number} limit - maximum number of characters on a line
 * @param {string} accum - internal accumulator string
 *
 * @returns {string} formatted paragraph with spacing and newlines inserted
 */
exports.hangingIndent = (line, indent, limit, accum) => {
  // params and defaults
  indent = indent || 4
  limit = limit || Config.columns
  accum = accum || ''

  // if line is too long
  if (exports.stringLength(line) > limit) {
    // get longest possible substring from line
    const reverseSlice = line
      .slice(0, limit)
      .split('')
      .reverse('')
    const firstSpace = reverseSlice.indexOf(' ')
    const longest = reverseSlice
      .slice(firstSpace + 1)
      .reverse()
      .join('')
    const rem = ' '.repeat(indent) + line.slice(longest.length + 1)

    // call self with new values
    return exports.hangingIndent(rem, indent, limit, (accum += `${longest}\n`))
  }

  // else append line to accum
  return (accum += line)
}

// ────────────────────────────────  Private  ──────────────────────────────────

function testRecord (keys, record) {
  return fp.pipe([
    fp.map(key => fp.get(key, record)),
    fp.every(fp.negate(fp.isNil))
  ])(keys)
}
