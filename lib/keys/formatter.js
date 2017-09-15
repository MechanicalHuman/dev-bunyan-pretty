'use strict'

const util = require('util')
const stringLength = require('string-length')
const lodash = require('lodash')
const utils = require('../utils')
const constants = require('../constants')
const chalk = require('chalk')
const hangingIndent = require('hanging-indent')
function filter (record) {
  var omit = lodash.clone(constants.core)

  if (utils.isHttp(record)) omit = lodash.union(omit, lodash.clone(constants.http))
  if (utils.isError(record)) omit = lodash.union(omit, lodash.clone(constants.err))
  if (utils.hasSrc(record)) omit = lodash.union(omit, lodash.clone(constants.src))

  const maxkey = getMaxKeylength(record, omit)
  const keys = lodash
    .chain(record)
    .omit(omit)
    .map(format)
    .values()
    .join('\n')
    .value()

  function format (value, key) {
    const keyLength = maxkey - stringLength(key)
    const heading = chalk.dim(`${lodash.repeat(' ', 2)}• ${key}${lodash.repeat(' ', keyLength)}: `)
    const indentation = stringLength(heading)

    return `${heading}${_indent(value, indentation)}`
  }

  if (keys) return keys + '\n'

  return false
}

module.exports = filter

function _indent (value, indentation) {
  if (lodash.isString(value)) {
    value = value.trim()
    const total = stringLength(value) + indentation
    if (total >= constants.columns) {
      value = hangingIndent(value, indentation + 4, constants.columns)
    }
    return value
  }

  const values = util.inspect(value, {colors: constants.colors, depth: constants.depth, maxArrayLength: constants.maxArrayLength}).split('\n')

  const mapped = lodash.map(values, line => {
    line = line.trim()
    const total = stringLength(line) + indentation
    if (total >= constants.columns) {
      return hangingIndent(line, indentation + 4, constants.columns)
    }

    return `${lodash.repeat(' ', indentation)}${line}`
  })

  return mapped.join('\n')
}

function getMaxKeylength (obj, omit) {
  const keys = Object.keys(lodash.omit(obj, omit))
  const longest = lodash.reduce(keys, (acc, val) => {
    const l = stringLength(val)
    if (l > acc) return l
    return acc
  }, 0)
  return longest
}
