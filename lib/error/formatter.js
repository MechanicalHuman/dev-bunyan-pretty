'use strict'

const PrettyError = require('pretty-error')
const minimist = require('minimist')

const errorStyle = require('./style')
const utils = require('../utils')
const error = new PrettyError()

error.skipNodeFiles()
error.skipPath('internal/process/next_tick.js')
error.skipPath('internal/module.js')
error.skipPath('bootstrap_node.js')
error.skipPackage('pm2')
error.skipPackage('express')
error.skipPackage('pino-http')
error.alias(getRoot(), '[source]')
error.appendStyle(errorStyle)

if (!utils.useColors()) error.withoutColors()

function render (entry) {
  if (!entry.__isError) return false
  if (entry.hasOwnProperty('err')) {
    return error.render(entry.err)
  }
  return error.render(entry)
}

function getRoot () {
  const argv = minimist(process.argv.slice(2))
  if (argv.hasOwnProperty('root')) return argv.root
  return process.cwd()
}

module.exports = render
