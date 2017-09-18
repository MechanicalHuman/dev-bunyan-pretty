'use strict'

const PrettyError = require('pretty-error')
const debug = require('debug')('mech:logger:cli')
const errorStyle = require('./style')
const error = new PrettyError()
const lodash = require('lodash')
const Constants = require('../constants')

Constants.NODE_PATHS.forEach(path => error.skipPath(path))
Constants.SKIPED_PKGS.forEach(pkg => error.skipPackage(pkg))

error.alias(Constants.REGEXP, Constants.REPLACE)
error.appendStyle(errorStyle)

// if (!Constants.colors) error.withoutColors()

function render (record) {
  const err = lodash.clone(record.err)

  if (err.message === record.msg) {
    err.stack = err.stack.replace(record.msg, '')
  }
  // console.dir(error.getObject(err), { depth: 100 })
  return error.render(err)
}

module.exports = render
