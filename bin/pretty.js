#! /usr/bin/env node
'use strict'

process.env.SUPPRESS_NO_CONFIG_WARNING = 'y'

const cli = require('yargs')
const updateNotifier = require('update-notifier')
const debug = require('debug')('mech:pretty:cli')
const { util } = require('config')
const fp = require('lodash/fp')
const pkg = require('../package.json')
const { getColumns } = require('../lib/utils')
const CONSTANTS = require('../lib/constants')
const pump = require('pump')
const split = require('split2')
const { Transform } = require('readable-stream')

const config = util.toObject(util.loadFileConfigs(CONSTANTS.CONFIG_DIR))

updateNotifier({ pkg }).notify({
  isGlobal: true,
  shouldNotifyInNpmScript: true
})

cli
  .usage('Usage: ... | pretty [options]')

  .option('time-stamps', {
    group: 'Headers',
    default: config.timeStamps,
    describe: 'Print TimeStamps',
    type: 'boolean'
  })

  .option('stamps-format', {
    alias: 'f',
    group: 'Headers',
    default: config.stampsFormat,
    describe: 'TimeStamps format',
    type: 'string'
  })

  .option('stamps-time-zone', {
    alias: 'tz',
    group: 'Headers',
    default: config.stampsTimeZone,
    describe: 'TimeStamps zone offset.',
    type: 'string'
  })

  .option('print-host', {
    group: 'Headers',
    default: false,
    describe: 'prepends the host to the log line, useful for combined streams',
    type: 'boolean'
  })

  .option('strict', {
    group: 'Filter',
    default: config.strict,
    describe: 'Suppress all but legal Bunyan JSON log lines',
    type: 'boolean'
  })

  .option('level', {
    alias: 'l',
    group: 'Filter',
    choices: ['trace', 'debug', 'info', 'error', 'warn', 'fatal'],
    describe: 'Only show messages at or above the specified level.',
    type: 'string'
  })

  .option('depth', {
    group: 'Inspect',
    describe: '(passed to util.inspect)',
    default: config.depth,
    type: 'number'
  })

  .option('max-array-length', {
    group: 'Inspect',
    describe: '(passed to util.inspect)',
    default: config.maxArrayLength,
    type: 'number'
  })

  .option('force-color', {
    default: config.forceColor,
    type: 'boolean',
    describe: 'Force color output'
  })

  .epilog('Copyright (c) 2018 Jorge Proaño. All rights reserved.')
  .wrap(getColumns())
  .version()
  .help()

if (process.stdin.isTTY === true) {
  cli.showHelp()
  process.exit(0)
}

process.stdin.on('end', exit)
process.on('SIGINT', () => cleanupAndExit('SIGINT'))
process.on('SIGQUIT', () => cleanupAndExit('SIGQUIT'))
process.on('SIGTERM', () => cleanupAndExit('SIGTERM'))
process.on('SIGHUP', () => cleanupAndExit('SIGHUP'))
process.on('SIGBREAK', () => cleanupAndExit('SIGBREAK'))

const parser = fp.pipe(
  fp.pick(CONSTANTS.CONFIG_FILEDS),
  argv => util.diffDeep(config, argv)
)

const opts = parser(cli.argv)
const pretty = require('../lib')(opts)

const prettyTransport = new Transform({
  objectMode: true,
  transform(chunk, enc, cb) {
    const line = pretty(chunk.toString())
    if (line === undefined) return cb()
    cb(undefined, line)
  }
})

pump(process.stdin, split(), prettyTransport, process.stdout)

// // https://github.com/pinojs/pino/pull/358
// if (!process.stdin.isTTY && !fs.fstatSync(process.stdin.fd).isFile()) {
//   process.once('SIGINT', function noOp () {})
// } else {
//   process.on('SIGINT', () => cleanupAndExit('SIGINT'))
// }
// ────────────────────────────────  private  ──────────────────────────────────

function cleanupAndExit(signal = 'NULL') {
  debug('Received: %s. Clossing on 500ms', signal)
  setTimeout(() => process.exit(0), 500)
}

function exit() {
  debug('stdin ended, closing the app')
  process.exit(0)
}
