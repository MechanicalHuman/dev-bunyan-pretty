'use strict'

const lodash = require('lodash')
const chalk = require('chalk')

function getSource (record) {
  const src = lodash.get(record, 'src', false)
  if (!src) return false
  src.file = src.file.replace(process.cwd(), '[source]')
  src.func = lodash.get(record, 'src.func', '[root]')
  return chalk.dim(`        ${src.func} - ${src.file}:${src.line}`) + '\n'
}

module.exports = getSource
