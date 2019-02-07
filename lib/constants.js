'use strict'

exports.TRACE = 10
exports.DEBUG = 20
exports.INFO = 30
exports.WARN = 40
exports.ERROR = 50
exports.FATAL = 60

exports.LEVELS = [
  exports.FATAL,
  exports.ERROR,
  exports.WARN,
  exports.INFO,
  exports.DEBUG,
  exports.TRACE
]

exports.NAMED_LEVELS = {
  fatal: exports.FATAL,
  error: exports.ERROR,
  warn: exports.WARN,
  info: exports.INFO,
  debug: exports.DEBUG,
  trace: exports.TRACE
}

exports.REVERSE_LEVELS = {
  [exports.FATAL]: 'fatal',
  [exports.ERROR]: 'error',
  [exports.WARN]: 'warn',
  [exports.INFO]: 'info',
  [exports.DEBUG]: 'debug',
  [exports.TRACE]: 'trace'
}

exports.headers = {
  [exports.FATAL]: 'FATAL',
  [exports.ERROR]: 'ERROR',
  [exports.WARN]: 'ALERT',
  [exports.INFO]: '  LOG',
  [exports.DEBUG]: 'DEBUG',
  [exports.TRACE]: 'TRACE'
}

exports.CORE_FIELDS = ['pid', 'hostname', 'level', 'time', 'v']
exports.HTTP_FIELDS = ['req', 'res']
exports.ERROR_FIELDS = ['err']
exports.OMIT_FIELDS = [...exports.CORE_FIELDS, 'msg', 'app', 'name']

exports.SPACE_CHAR = ' '
exports.NEW_LINE = '\n'
exports.PIPE = process.platform === 'win32' ? ' |' : ' │'
exports.ARROW = '↳'
exports.DASH = '-'
exports.DOT = '•'

exports.PADDING = exports.SPACE_CHAR + exports.SPACE_CHAR

exports.COLORS_256 = [
  '#0000CC',
  '#0000FF',
  '#0033CC',
  '#0033FF',
  '#0066CC',
  '#0066FF',
  '#0099CC',
  '#0099FF',
  '#00CC00',
  '#00CC33',
  '#00CC66',
  '#00CC99',
  '#00CCCC',
  '#00CCFF',
  '#3300CC',
  '#3300FF',
  '#3333CC',
  '#3333FF',
  '#3366CC',
  '#3366FF',
  '#3399CC',
  '#3399FF',
  '#33CC00',
  '#33CC33',
  '#33CC66',
  '#33CC99',
  '#33CCCC',
  '#33CCFF',
  '#6600CC',
  '#6600FF',
  '#6633CC',
  '#6633FF',
  '#66CC00',
  '#66CC33',
  '#9900CC',
  '#9900FF',
  '#9933CC',
  '#9933FF',
  '#99CC00',
  '#99CC33',
  '#CC0000',
  '#CC0033',
  '#CC0066',
  '#CC0099',
  '#CC00CC',
  '#CC00FF',
  '#CC3300',
  '#CC3333',
  '#CC3366',
  '#CC3399',
  '#CC33CC',
  '#CC33FF',
  '#CC6600',
  '#CC6633',
  '#CC9900',
  '#CC9933',
  '#CCCC00',
  '#CCCC33',
  '#FF0000',
  '#FF0033',
  '#FF0066',
  '#FF0099',
  '#FF00CC',
  '#FF00FF',
  '#FF3300',
  '#FF3333',
  '#FF3366',
  '#FF3399',
  '#FF33CC',
  '#FF33FF',
  '#FF6600',
  '#FF6633',
  '#FF9900',
  '#FF9933',
  '#FFCC00',
  '#FFCC33'
]

exports.COLORS_16 = [
  '#CD9A34',
  '#CD679A',
  '#CD67CD',
  '#CD9A00',
  '#CD9A01',
  '#CD6767'
]

exports.COLUMNS = 80
exports.COLUMNS_MIN = 60
