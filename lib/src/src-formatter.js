'use strict'

const lodash = require('lodash')
const chalk = require('chalk')

function getSource (record) {
  const file = (lodash.get(record, 'src.file', '')).replace(process.cwd(), '[source]')
  const func = lodash.get(record, 'src.func', '[root]')
  const line = lodash.get(record, 'src.func', '0')
  return chalk.dim(`        ${func} - ${file}:${line}`) + '\n'
}

module.exports = getSource
