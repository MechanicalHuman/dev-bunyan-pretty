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
    type: 'String'
  })

  .option('stamps-time-zone', {
    alias: 'tz',
    group: 'Headers',
    default: config.stampsTimeZone,
    describe: 'TimeStamps zone offset.',
    type: 'String'
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

const argv = fp.pipe(
  argv => fp.pick(CONSTANTS.CONFIG_FILEDS, argv),
  argv => util.diffDeep(config, argv)
)(cli.argv)

const outputStream = require('../lib')(process.stdout, argv)
process.stdin.pipe(outputStream)

// ────────────────────────────────  private  ──────────────────────────────────

function cleanupAndExit (signal) {
  debug('Recieved: %s. Clossing on 500ms', signal)
  setTimeout(() => process.exit(0), 500)
}

function exit () {
  debug('stdin ended, closing the app')
  process.exit(0)
}
