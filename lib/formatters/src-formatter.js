'use strict'

const lo = require('lodash')
const Constants = require('../constants')
const chalk = require('../utils/chalk')

const { shortPath } = require('../utils')

function getSource (record) {
  const file = shortPath(lo.get(record, 'src.file', ''))
  const func = lo.get(record, 'src.func', '[root]')
  const line = lo.get(record, 'src.line', '0')

  // prettier-ignore
  return chalk`${Constants.PADDING}{bold ${Constants.ARROW} src:%} ${func} - ${file}:${line}${Constants.NEW_LINE}`
  // "  ↳ src: "
}
module.exports = getSource
