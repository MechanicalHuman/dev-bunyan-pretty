'use strict'

const debug = require('debug')('mech:logger:keyformatter')
const lodash = require('lodash')
const {
  isHttp,
  shortPath,
  isString,
  stringLength,
  maxLength,
  asSpaces,
  inspect
} = require('../utils')
const Constants = require('../constants')
const chalk = require('chalk')
const hangingIndent = require('hanging-indent')

function filter (record) {
  var skipKeys = lodash
    .chain([])
    .concat(Constants.CORE_FIELDS)
    .concat(Constants.ERROR_FIELDS)
    .concat(Constants.SOURCE_FIELDS)
    // .concat(Constants.HTTP_FIELDS)
    .uniq()
    .sort()
    .value()

  if (isHttp(record)) {
    skipKeys = lodash.union(skipKeys, Constants.HTTP_FIELDS)
  }

  const maxkey = maxLength(record, skipKeys)

  const keys = lodash
    .chain(record)
    .omit(skipKeys)
    .map((value, key) => format(value, key, maxkey))
    .values()
    .join('\n')
    .value()

  if (lodash.isEmpty(keys)) return false

  return keys + Constants.NEW_LINE
}

module.exports = filter

// ───────────────────────────────  private  ───────────────────────────────────

/**
 * Creates a log line composed by the Key and value
 *
 * @param     {Object}    value
 * @param     {String}    key
 * @param     {Number}    maxkey
 * @return    {[type]}
 */

function format (value, key, maxLength = Constants.COLUMNS_MIN) {
  const keyLength = maxLength - stringLength(key)

  const heading = chalk.dim(`${asSpaces(keyLength)} ${key} `)

  const indentation = stringLength(heading)

  return heading + indent(value, indentation)
}

/**
 * Indents the given input with the provided indentation value
 *
 * @param     {Object}    src
 * @param     {Number}    indentation
 * @return    {String}
 */

function indent (src, indentation) {
  const maxLine = Constants.COLUMNS_MIN - indentation
  const hangingSpace = indentation + 4
  const indent = chalk.dim(': ')
  const indentinit = chalk.dim('┬ ')
  const indentStr = chalk.dim(lodash.padStart('├ ', indentation + 2))
  const indentEnd = chalk.dim(lodash.padStart('└ ', indentation + 2))
  const opts = {
    depth: 2,
    colors: true,
    breakLength: maxLine
  }

  if (isString(src)) {
    return indent + hangingIndent(shortPath(src), hangingSpace, maxLine)
  }

  return lodash
    .chain(inspect(src, opts))
    .split(Constants.NEW_LINE)
    .map(shortPath)
    .map((str, i, c) => {
      if (i === 0 && c.length === 1) return indent + str
      if (i === 0) return indentinit + str.replace('{', Constants.SPACE_CHAR)
      if (i === c.length - 1) {
        return indentEnd + str.replace('}', Constants.SPACE_CHAR)
      }
      return indentStr + str
    })
    .join(Constants.NEW_LINE)
    .value()
}
