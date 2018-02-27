'use strict'

const lodash = require('lodash')
const { isNil, isString, isArray, replace } = lodash
const util = require('util')
const Constants = require('../constants')
const stringLength = require('string-length')
// ────────────────────────────────  public  ───────────────────────────────────

function isHttp (record) {
  return testKeys(Constants.HTTP_FIELDS, record, 'isHttp')
}

function isError (record) {
  return lodash.has(record, 'err')
}

function hasSrc (record) {
  return testKeys(Constants.SOURCE_FIELDS, record, 'hasSrc')
}

function isValid (record) {
  return testKeys(Constants.CORE_FIELDS, record, 'isValid')
}

function shortPath (string) {
  if (!isString(string)) return string
  const regEx = new RegExp(require('os').homedir(), 'gmi')
  return replace(string, regEx, '~')
}

function maxLength (collection = [], omit = []) {
  return lodash
    .chain(Object.keys(collection))
    .difference(omit)
    .reduce(reducer, 0)
    .value()

  function reducer (length, current) {
    const test = stringLength(current)
    return test > length ? test : length
  }
}

function asSpaces (n = 0) {
  return lodash.repeat(Constants.SPACE_CHAR, n)
}

// ───────────────────────────────  exports  ───────────────────────────────────

exports.hasSrc = hasSrc
exports.isArray = isArray
exports.isError = isError
exports.isHttp = isHttp
exports.isString = isString
exports.isValid = isValid
exports.shortPath = shortPath
exports.stringLength = stringLength
exports.maxLength = maxLength
exports.asSpaces = asSpaces
exports.format = util.format
exports.inspect = util.inspect

// ───────────────────────────────  private  ───────────────────────────────────

function testKeys (keys, record) {
  return lodash
    .chain(keys)
    .map(lodash.propertyOf(record))
    .every(lodash.negate(isNil))
    .value()
}
