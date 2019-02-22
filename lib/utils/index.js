/*!
 * Copyright 2019 Jorge Proaño.
 */

'use strict'

const fp = require('lodash/fp')
const { format } = require('util')
const termSize = require('term-size')
const { STATUS_CODES } = require('http')

const Constants = require('../constants')

/** @param {*} input  */
exports.humanizeStatusCode = input => fp.getOr('Unknown', input, STATUS_CODES)

exports.isValid = fp.negate(fp.isNil)

/**
 * @param {*} rec
 * @returns {rec is Pretty.HttpRecord}
 */

exports.isHttp = function isHttp (rec) {
  return testRecord(Constants.HTTP_FIELDS, rec)
}

/**
 * @param {*} rec
 * @returns {rec is Pretty.ErrRecord}
 */

exports.isError = rec => testRecord(Constants.ERROR_FIELDS, rec)

/**
 *  @param {*} rec
 * @returns {rec is Pretty.LogRecord}
 */

exports.isValidRecord = rec => testRecord(Constants.CORE_FIELDS, rec)

/**
 * @param {string} rawRecord
 * @returns {Pretty.LogRecord}
 */

exports.parseRecord = rawRecord => {
  const record = JSON.parse(rawRecord)
  if (!exports.isValidRecord(record)) {
    throw new Error('Invalid record')
  }
  return exports.normalizeRecordFields(record)
}

/** @param {*} string  */
exports.shortPath = string => {
  if (!fp.isString(string)) return string
  const cwd = process.cwd()
  const regEx = new RegExp(cwd, 'gmi')
  const replacer = cwd === require('os').homedir() ? '~' : '[cwd]'
  return string.replace(regEx, replacer)
}

/** @param {*} string  */
exports.modulePath = string => {
  if (!fp.isString(string)) return string
  const regEx = new RegExp(
    '^.*node_modules/([a-zA-Z0-9-]+|@[a-zA-Z0-9-]+/[a-zA-Z0-9-]+)/(.*)',
    'gmi'
  )
  return string.replace(regEx, '[$1]/$2')
}

exports.stringLength = require('string-length')

/**
 * @param {*} collection
 * @param {string[]} omit
 */
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

/** @param {number} level  */
exports.isValidLevel = level => Constants.LEVELS.includes(level)

/** @param {*} record  */
exports.normalizeRecordFields = record => {
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

/**
 * format a string into a paragraph with hanging indents
 *
 * @param {string} line - source string to format
 * @param {number} indent - number of spaces to indent lines
 * @param {number} limit - maximum number of characters on a line
 * @param {string=} acc - internal accumulator string
 *
 * @returns {string} formatted paragraph with spacing and newlines inserted
 */
exports.hangingIndent = (line, indent, limit, acc) => {
  // params and defaults
  indent = indent || 4
  limit = limit || exports.getColumns()
  acc = acc || ''

  // if line is too long
  if (exports.stringLength(line) > limit) {
    // get longest possible substring from line
    const reverseSlice = line
      .slice(0, limit)
      .split('')
      .reverse()

    const firstSpace = reverseSlice.indexOf(' ')
    const longest = reverseSlice
      .slice(firstSpace + 1)
      .reverse()
      .join('')
    const rem = ' '.repeat(indent) + line.slice(longest.length + 1)

    // call self with new values
    return exports.hangingIndent(rem, indent, limit, (acc += `${longest}\n`))
  }

  // else append line to acc
  return (acc += line)
}

exports.getColumns = function getColumns () {
  return termSize().columns || Constants.COLUMNS
}

/**
 * @param {string|number=} val
 * @param asNamed
 * @param loud
 *
 */
exports.coerceLevel = function coerceLevel (val, asNamed = false, loud = false) {
  if (!fp.isNil(val)) {
    val = String(val)
    const name = val.toLowerCase().trim()
    const num = parseInt(name, 10)
    if (name in Constants.NAMED_LEVELS) {
      return asNamed ? name : Constants.NAMED_LEVELS[name]
    }
    if (num in Constants.REVERSE_LEVELS) {
      return asNamed ? Constants.REVERSE_LEVELS[num] : num
    }
  }

  if (loud) throw new TypeError(format('Cannot resolve level %s', val))
  return asNamed ? 'trace' : Constants.TRACE
}

// ────────────────────────────────  Private  ──────────────────────────────────

/**
 *
 *
 * @param {string[]} keys
 * @param {*} record
 * @return {boolean}
 */
function testRecord (keys, record) {
  return fp.pipe([
    fp.map(key => fp.get(key, record)),
    fp.every(fp.negate(fp.isNil))
  ])(keys)
}
