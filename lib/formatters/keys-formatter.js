'use strict'

const fp = require('lodash/fp')
const lo = require('lodash')
const config = require('../utils/config')
const Constants = require('../constants')
const chalk = require('../utils/chalk')
const Utils = require('../utils')

function filter(record) {
  /** @type {string[]} */
  let skipKeys = [...Constants.CORE_FIELDS]

  skipKeys = fp.union(skipKeys, Constants.OMIT_FIELDS)

  if (Utils.isHttp(record)) {
    skipKeys = fp.union(skipKeys, Constants.HTTP_FIELDS)
  }

  if (Utils.isError(record)) {
    skipKeys = fp.union(skipKeys, Constants.ERROR_FIELDS)
  }

  const maxkey = Utils.maxLength(record, skipKeys)

  return lo
    .chain(record)
    .omit(skipKeys)
    .map((value, key) => format(value, key, maxkey))
    .values()
    .value()
}

module.exports = filter

// ───────────────────────────────  private  ───────────────────────────────────

/**
 * Creates a log line composed by the Key and value
 *
 * @param     {object}    value
 * @param     {string}    key
 * @param     {number}    maxLength
 * @return    {string}
 */

function format(value, key, maxLength = Utils.getColumns()) {
  const keyLength = maxLength - Utils.stringLength(key)

  const heading = chalk.dim(`${Utils.asSpaces(keyLength)} ${key} `)

  const indentation = Utils.stringLength(heading)

  return heading + indent(value, indentation)
}

/**
 * Indents the given input with the provided indentation value
 *
 * @param     {object}    src
 * @param     {number}    indentation
 * @return    {string}
 */

function indent(src, indentation) {
  const indent = chalk.dim(': ')
  const indentinit = chalk.dim('┬ ')
  const indentStr = chalk.dim(lo.padStart('├ ', indentation + 2))
  const indentEnd = chalk.dim(lo.padStart('└ ', indentation + 2))

  const opts = {
    depth: config.get('depth'),
    colors: config.get('colorLevel') > 0,
    maxArrayLength: config.get('maxArrayLength'),
  }

  return lo
    .chain(Utils.inspect(src, opts))
    .split(Constants.NEW_LINE)
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
