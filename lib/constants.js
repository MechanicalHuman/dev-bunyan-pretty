'use strict'

const debug = require('debug')('mech:logger:constants')
const Constants = {}

Constants.ISWIN = process.platform === 'win32' || process.platform === 'win64'
Constants.INPM2 =
  'PM2_HOME' in process.env ||
  'PM2_JSON_PROCESSING' in process.env ||
  'PM2_CLI' in process.env

Constants.USE_COLORS = require('supports-color').stdout.level || 0

Constants.CORE_FIELDS = [
  'pid',
  'hostname',
  'name',
  'msg',
  'level',
  'time',
  'v'
]
Constants.HTTP_FIELDS = ['req', 'res']
Constants.ERROR_FIELDS = ['err']
Constants.SOURCE_FIELDS = ['src']

Constants.COLUMNS = require('term-size')().columns
Constants.COLUMNS_BREAK = Constants.INPM2 ? 79 : 80
Constants.COLUMNS_MIN = Constants.COLUMNS > 60 ? 60 : Constants.COLUMNS

Constants.REGEXP = new RegExp(process.cwd(), 'gmi')
Constants.REPLACE = '[cwd]'

Constants.SPACE_CHAR = ' '
Constants.NEW_LINE = '\n'

Constants.CONF_KEYS = [
  'colors',
  'header',
  'strict',
  'depth',
  'timeStamp',
  'hasKey',
  'level',
  'condition',
  'tag',
  'name'
]

Constants.NODE_PATHS = [
  '_debugger.js',
  '_http_agent.js',
  '_http_client.js',
  '_http_common.js',
  '_http_incoming.js',
  '_http_outgoing.js',
  '_http_server.js',
  '_linklist.js',
  '_stream_duplex.js',
  '_stream_passthrough.js',
  '_stream_readable.js',
  '_stream_transform.js',
  '_stream_writable.js',
  '_tls_legacy.js',
  '_tls_wrap.js',
  'assert.js',
  'bootstrap_node.js',
  'buffer.js',
  'child_process.js',
  'cluster.js',
  'console.js',
  'constants.js',
  'crypto.js',
  'dgram.js',
  'dns.js',
  'domain.js',
  'events.js',
  'freelist.js',
  'fs.js',
  'http.js',
  'https.js',
  'module.js',
  'module.js',
  'net.js',
  'next_tick.js',
  'node.js',
  'os.js',
  'path.js',
  'punycode.js',
  'querystring.js',
  'readline.js',
  'repl.js',
  'smalloc.js',
  'stream.js',
  'string_decoder.js',
  'sys.js',
  'timers.js',
  'tls.js',
  'tty.js',
  'url.js',
  'util.js',
  'vm.js',
  'zlib.js',
  'internal/module.js',
  'internal/process/next_tick.js',
  'internal/streams/destroy.js'
]

Constants.SKIPED_PKGS = [
  'pm2',
  'express',
  'async',
  'lodash',
  // 'request',
  'node-fetch'
]
Constants.OPTIONS_KEYS = [
  'colors',
  'header',
  'strict',
  'depth',
  'timeStamp',
  'hasKey',
  'level',
  'condition',
  'tag',
  'name'
]

// debug(Constants)s

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

module.exports = Constants
