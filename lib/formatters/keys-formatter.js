/*!
 * Copyright 2019 Jorge Proaño.
 */
'use strict'

const fp = require('lodash/fp')
const lo = require('lodash')
const CONSTANTS = require('../constants')
const utils = require('../utils')
const { inspect } = require('util')

/**
 * @param {Pretty.LogRecord} record
 * @param {Pretty.Configuration} config
 * @param {import("chalk").Chalk} chalk
 * @returns {string[]}
 * @todo Refactor to use lodash/fp
 */
function filter (record, config, chalk) {
  let skipKeys = [...CONSTANTS.CORE_FIELDS]

  skipKeys = fp.union(skipKeys, CONSTANTS.OMIT_FIELDS)

  if (utils.isHttp(record)) {
    skipKeys = fp.union(skipKeys, CONSTANTS.HTTP_FIELDS)
  }

  if (utils.isError(record)) {
    skipKeys = fp.union(skipKeys, CONSTANTS.ERROR_FIELDS)
  }

  const maxkey = utils.maxLength(record, skipKeys)

  return lo
    .chain(record)
    .omit(skipKeys)
    .map((value, key) => format(value, key, maxkey))
    .values()
    .value()

  /**
   * Creates a log line composed by the Key and value
   *
   * @param     {Object}    value
   * @param     {string}    key
   * @param     {number}    maxLength
   * @return    {string}
   */

  function format (value, key, maxLength = utils.getColumns()) {
    const keyLength = maxLength - utils.stringLength(key)

    const heading = chalk.dim(`${utils.asSpaces(keyLength)} ${key} `)

    const indentation = utils.stringLength(heading)

    return heading + indent(value, indentation)
  }

  /**
   * Indents the given input with the provided indentation value
   *
   * @param     {Object}    src
   * @param     {Number}    indentation
   * @return    {String}
   * @todo Refactor indent to use lodash/fp
   */

  function indent (src, indentation) {
    const indent = chalk.dim(': ')
    const indentInit = chalk.dim('┬ ')
    const indentStr = chalk.dim(lo.padStart('├ ', indentation + 2))
    const indentEnd = chalk.dim(lo.padStart('└ ', indentation + 2))

    const opts = {
      colors: config.colorize,
      depth: config.depth,
      maxArrayLength: config.maxArrayLength
    }

    return lo
      .chain(inspect(src, opts))
      .split(CONSTANTS.NEW_LINE)
      .map((str, i, c) => {
        if (i === 0 && c.length === 1) return indent + str
        if (i === 0) return indentInit + str
        if (i === c.length - 1) {
          return indentEnd + str
        }
        return indentStr + str
      })
      .join(CONSTANTS.NEW_LINE)
      .value()
  }
}

module.exports = filter

// ───────────────────────────────  private  ───────────────────────────────────
