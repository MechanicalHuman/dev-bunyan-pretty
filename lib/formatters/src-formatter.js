'use strict'

const lo = require('lodash')

const Constants = require('../constants')
const Utils = require('../utils')

const chalk = require('../utils/chalk')

module.exports = function getSource (record) {
  if (!Utils.hasSrc(record)) return []

  const file = Utils.shortPath(lo.get(record, 'src.file', ''))
  const func = lo.get(record, 'src.func', '[root]')
  const line = lo.get(record, 'src.line', '0')

  // prettier-ignore
  return [chalk`${Constants.PADDING}{bold ${Constants.ARROW} src:%} ${func} - ${file}:${line}`]
  // "  ↳ src: "
}
