'use strict'

const env = process.env
const Constants = {}

Constants.PIPED = !process.stdin.isTTY
Constants.ISWIN = process.platform === 'win32' || process.platform === 'win64'

Constants.FORCE_COLOR =
  'FORCE_COLOR' in env
    ? env.FORCE_COLOR.length === 0 || parseInt(env.FORCE_COLOR, 10) !== 0
    : false

Constants.TRACE = 10
Constants.DEBUG = 20
Constants.INFO = 30
Constants.WARN = 40
Constants.ERROR = 50
Constants.FATAL = 60

Constants.LEVELS = [60, 50, 40, 30, 20, 10]

Constants.NAMED_LEVELS = {
  fatal: Constants.FATAL,
  error: Constants.ERROR,
  warn: Constants.WARN,
  info: Constants.INFO,
  debug: Constants.DEBUG,
  trace: Constants.TRACE
}

Constants.headers = {
  60: 'FATAL',
  50: 'ERROR',
  40: 'ALERT',
  30: '  LOG',
  20: 'DEBUG',
  10: 'TRACE'
}

Constants.CORE_FIELDS = ['pid', 'hostname', 'level', 'time', 'v']
Constants.HTTP_FIELDS = ['req', 'res']
Constants.ERROR_FIELDS = ['err']
Constants.SOURCE_FIELDS = ['src']
Constants.OMIT_FIELDS = [...Constants.CORE_FIELDS, 'msg', 'app', 'name']

Constants.SPACE_CHAR = ' '
Constants.NEW_LINE = '\n'
Constants.PIPE = Constants.ISWIN ? ' |' : ' │'
Constants.ARROW = '↳'
Constants.DASH = '-'
Constants.DOT = '•'

Constants.PADDING = Constants.SPACE_CHAR + Constants.SPACE_CHAR

Constants.COLORS_256 = [
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

Constants.COLORS_16 = [
  '#CD9A34',
  '#CD679A',
  '#CD67CD',
  '#CD9A00',
  '#CD9A01',
  '#CD6767'
]

Constants.COLUMNS = 80
Constants.COLUMNS_MIN = 60

module.exports = Constants
