'use strict'

const lodash = require('lodash')
const chalk = require('chalk')
const { shortPath } = require('../utils')

function getSource (record) {
  const file = shortPath(lodash.get(record, 'src.file', ''))
  const func = lodash.get(record, 'src.func', '[root]')
  const line = lodash.get(record, 'src.line', '0')
  return chalk.dim(`        ${func} - ${file}:${line}`) + '\n'
}

module.exports = getSource
