'use strict'

const lodash = require('lodash')
const constants = require('../constants')

module.exports.isHttp = isHttp
module.exports.isError = isError
module.exports.hasSrc = hasSrc
module.exports.useColors = useColors
module.exports.isValid = isValid

function isHttp (record) {
  return testKeys(constants.http, record)
}

function isError (record) {
  return testKeys(constants.err, record)
}

function hasSrc (record) {
  return testKeys(constants.src, record)
}

function isValid (record) {
  return testKeys(constants.core, record)
}

function useColors () {
  if (process.env['FORCE_COLOR'] === '1') return true
  return false
}

function testKeys (keys, record) {
  const values = lodash.map(keys, lodash.propertyOf(record))
  return lodash.every(values, val => !lodash.isNil(val))
}
