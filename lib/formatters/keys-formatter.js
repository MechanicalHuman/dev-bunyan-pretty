'use strict'

const lodash = require('lodash')
const {
  isHttp,
  shortPath,
  isError,
  stringLength,
  maxLength,
  asSpaces,
  inspect
} = require('../utils')
const Constants = require('../constants')
const chalk = require('../utils/chalk')

function filter (record) {
  var skipKeys = lodash
    .chain([])
    .concat(Constants.CORE_FIELDS)
    .concat(Constants.SOURCE_FIELDS)
    .uniq()
    .sort()
    .value()

  if (isHttp(record)) {
    skipKeys = lodash.union(skipKeys, Constants.HTTP_FIELDS)
  }
  if (isError(record)) {
    skipKeys = lodash.union(skipKeys, Constants.ERROR_FIELDS)
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

function format (value, key, maxLength = Constants.COLUMNS) {
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
  const indent = chalk.dim(': ')
  const indentinit = chalk.dim('┬ ')
  const indentStr = chalk.dim(lodash.padStart('├ ', indentation + 2))
  const indentEnd = chalk.dim(lodash.padStart('└ ', indentation + 2))
  const opts = {
    depth: Constants.DEPTH,
    colors: Constants.USE_COLORS > 0
  }

  return lodash
    .chain(inspect(src, opts))
    .split(Constants.NEW_LINE)
    .map(shortPath)
    .map((str, i, c) => {
      if (i === 0 && c.length === 1) return indent + str
      if (i === 0) return indentinit + str
      if (i === c.length - 1) {
        return indentEnd + str
      }
      return indentStr + str
    })
    .join(Constants.NEW_LINE)
    .value()
}
