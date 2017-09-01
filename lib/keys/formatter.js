'use strict'

const util = require('util')
const stringLength = require('string-length')
const lodash = require('lodash')
const utils = require('../utils')
const constants = require('../constants')
const chalk = require('chalk')

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
    const l = maxkey - stringLength(key)
    // console.log(maxkey, l, stringLength(key))
    let heading = chalk.dim(`${lodash.repeat(' ', 2)}• ${key}${lodash.repeat(' ', l)}: `)
    let indentation = stringLength(heading)
    return `${heading}${_indent(value, indentation)}`
  }

  if (keys) return keys + '\n'
  return false
}

module.exports = filter

function _indent (value, indentation, line = 60) {
  if (!lodash.isString(value)) {
    value = util.inspect(value, {colors: utils.useColors(), depth: null, breakLength: line}).split('\n')
    for (var i = 1; i < value.length; i++) {
      value[i] = `${lodash.repeat(' ', indentation)}${value[i]}`
    }
    return value.join('\n')
  }

  return value
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
