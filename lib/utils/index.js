'use strict'

const fp = require('lodash/fp')
const moment = require('moment-timezone')
const config = require('config')
const util = require('util')
const Constants = require('../constants')
const termSize = require('term-size')
const supportsColor = require('supports-color').supportsColor
const { STATUS_CODES } = require('http')

exports.humanizeStatusCode = (input) => fp.getOr('Unknown', input, STATUS_CODES)

exports.format = require('util').format
exports.inspect = require('util').inspect

exports.isValid = fp.negate(fp.isNil)

exports.isHttp = (rec) => testRecord(Constants.HTTP_FIELDS, rec)
exports.isError = (rec) => testRecord(Constants.ERROR_FIELDS, rec)
exports.isValidRecord = (rec) => testRecord(Constants.CORE_FIELDS, rec)

exports.parseRecord = (rawRecord) => {
  const record = JSON.parse(rawRecord)
  if (!exports.isValidRecord(record)) {
    throw new Error('Invalid record')
  }
  return exports.normalizeRecordFields(record)
}

exports.shortPath = (string) => {
  if (!fp.isString(string)) return string
  const cwd = process.cwd()
  const regEx = new RegExp(cwd, 'gmi')
  const replacer = cwd === require('os').homedir() ? '~' : '[cwd]'
  return string.replace(regEx, replacer)
}

exports.modulePath = (string) => {
  if (!fp.isString(string)) return string
  // eslint-disable-next-line prefer-regex-literals
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
    }, 0),
  ])(collection)
}

exports.asSpaces = (n = 0) => fp.repeat(n, Constants.SPACE_CHAR)

exports.isValidLevel = (level) => Constants.LEVELS.includes(level)

exports.normalizeRecordFields = (record) => {
  if (!Constants.LEVELS.includes(record.level)) record.level = Constants.INFO
  if (fp.isNil(record.msg)) record.msg = ''
  if (fp.isNil(record.name)) record.name = 'app'
  if (fp.has('req.body', record)) {
    record = fp.pipe(
      fp.set('body', fp.get('req.body', record)),
      fp.unset('req.body')
    )(record)
  }
  return record
}

exports.pickHeadColor = (level) => {
  const chalk = require('./chalk')
  const colors = {
    60: chalk.red.bold.inverse,
    50: chalk.red,
    40: chalk.yellow,
    30: chalk.green,
    20: chalk.blue,
    10: chalk.cyan,
  }
  return colors[level] || chalk.green
}

exports.prefixLines = (lines, record) => {
  const color = exports.pickHeadColor(record.level)

  const prefix =
    config.get('pretty.timeStamps') === true
      ? moment(record.time)
          .tz(config.get('pretty.stampsTimeZone'))
          .format(config.get('pretty.stampsFormat'))
      : Constants.headers[record.level]

  const prefixed = lines
    .join(Constants.NEW_LINE)
    .split(Constants.NEW_LINE)
    .map((line) => `${color(prefix + Constants.PIPE)} ${line}`)
    .join(Constants.NEW_LINE)
  return prefixed
}

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
  limit = limit || exports.getColumns()
  accum = accum || ''

  // if line is too long
  if (exports.stringLength(line) > limit) {
    // get longest possible substring from line
    const reverseSlice = line.slice(0, limit).split('').reverse('')
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

exports.getColumns = function getColumns() {
  return termSize().columns || Constants.COLUMNS
}

exports.coerceLevel = function coerceLevel(nameOrNum) {
  if (!nameOrNum) return 10
  const type = typeof nameOrNum

  if (type === 'string') {
    const test = nameOrNum.toLowerCase()
    if (test in Constants.NAMED_LEVELS) {
      return Constants.NAMED_LEVELS[test]
    }
  }

  if (type === 'number' && Constants.LEVELS.includes(nameOrNum)) {
    return nameOrNum
  }

  throw new TypeError(
    util.format('cannot resolve level: invalid arg (%s):%s', type, nameOrNum)
  )
}

exports.coerceColorLevel = (conf, stream) => {
  let { colorLevel = 0, forceColor, termColors } = conf
  colorLevel = colorLevel > 3 ? 3 : colorLevel
  termColors = Boolean(termColors) === true
  forceColor = Boolean(forceColor) === true
  const current = supportsColor(stream).level || 0
  const max = current > colorLevel ? current : colorLevel
  return forceColor ? (max <= 1 ? 1 : max) : termColors ? max : current
}

// ────────────────────────────────  Private  ──────────────────────────────────

function testRecord(keys, record) {
  return fp.pipe([
    fp.map((key) => fp.get(key, record)),
    fp.every(fp.negate(fp.isNil)),
  ])(keys)
}
