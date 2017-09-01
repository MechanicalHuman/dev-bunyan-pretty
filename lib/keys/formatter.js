'use strict'

const util = require('util')
const stringLength = require('string-length')
const lodash = require('lodash')
const utils = require('../utils')
const chalk = require('chalk')

const knownKeys = {
  standard: ['pid', 'hostname', 'name', 'msg', 'level', 'time', 'v', 'src'],
  error: [ 'stack', 'err', 'message' ],
  http: [ 'req', 'res', 'req_id', 'duration' ],
  extras: ['__ishttp', '__isError', 'req_id']
}

const skipedKeys = lodash.union(knownKeys.standard, knownKeys.extras)
// const skipedKeys = []

function filter (record) {
  var omit = skipedKeys

  if (lodash.get(record, '__isError', false)) omit = lodash.union(omit, knownKeys.error)
  if (lodash.get(record, '__ishttp', false)) omit = lodash.union(omit, knownKeys.http)

  const keys = lodash
    .chain(record)
    .omit(omit)
    .map(format)
    .values()
    .join('\n')
    .value()

  function format (value, key) {
    let heading = chalk.dim(`${lodash.repeat(' ', 2)}• ${key}: `)
    let indentation = stringLength(heading)
    return `${heading}${_indent(value, indentation)}`
  }

  if (keys) return keys + '\n'
  return false
}

module.exports = filter

function _indent (value, indentation) {
  value = util.inspect(value, {colors: utils.useColors(), depth: null}).split('\n')
  for (var i = 1; i < value.length; i++) {
    value[i] = `${lodash.repeat(' ', indentation)}${value[i]}`
  }
  return value.join('\n')
}
// ・•
