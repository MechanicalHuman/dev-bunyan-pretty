'use strict'

const PrettyError = require('pretty-error')

const errorStyle = require('./style')
const error = new PrettyError()
const lodash = require('lodash')
const { colors } = require('../constants')

error.skipNodeFiles()
error.skipPath('internal/process/next_tick.js')
error.skipPath('internal/module.js')
error.skipPath('bootstrap_node.js')
error.skipPackage('pm2')
error.skipPackage('express')
error.skipPackage('async')
error.skipPackage('lodash')
error.skipPackage('request')
error.skipPackage('lodash')
error.alias(process.cwd(), '[source]')
error.appendStyle(errorStyle)

if (!colors) error.withoutColors()

function render (record) {
  const err = lodash.clone(record.err)

  if (err.message === record.msg) {
    err.stack = err.stack.replace(record.msg, '')
  }
  return error.render(err)
}

module.exports = render
