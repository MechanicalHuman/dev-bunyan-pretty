'use strict'

const supportsColor = require('supports-color')
const argv = require('yargs').argv
const lodash = require('lodash')

module.exports.core = ['pid', 'hostname', 'name', 'msg', 'level', 'time', 'v']
module.exports.http = [ 'req', 'res' ]
module.exports.err = ['err']
module.exports.src = ['src']
module.exports.columns = require('term-size').columns
module.exports.colors = useColors()
module.exports.depth = lodash.get(argv, 'depth', 3)
module.exports.maxArrayLength = lodash.has(argv, 'maxArray', 100)
module.exports.printHead = Boolean(lodash.get(argv, 'head', true))
module.exports.filterLevel = parseLevel()
module.exports.filter = filter()
module.exports.strict = lodash.has(argv, 'strict')

function useColors () {
  if (supportsColor || lodash.has(argv, 'force')) {
    process.env['FORCE_COLOR'] = 1
    return true
  }
  if ('FORCE_COLOR' in process.env) {
    return (parseInt(process.env.FORCE_COLOR, 10) === 1)
  }

  return false
}

function parseLevel () {
  if (!lodash.has(argv, 'level')) return 0

  const levels = {
    60: 'fatal',
    50: 'error',
    40: 'warn',
    30: 'info',
    20: 'debug',
    10: 'trace'
  }

  const level = lodash.get(argv, 'level')
  return lodash.findKey(levels, l => level === l) || 0
}

function filter () {
  let js = lodash.get(argv, 'cond', 'this === this')
  if (js.indexOf('return') === -1) {
    if (js.substring(js.length - 1) === ';') {
      js = js.substring(0, js.length - 1)
    }
    js = 'return (' + js + ')'
  }

  return (new Function(js)) // eslint-disable-line no-new-func
}
