#! /usr/bin/env node
'use strict'

process.env.DEBUG = 'mech*'

const cli = require('yargs')
const updateNotifier = require('update-notifier')
const debug = require('debug')('mech:logger:cli')

const Constants = require('../lib/constants')
const Config = require('../lib/config')
const pkg = require('../package.json')

updateNotifier({ pkg }).notify()

debug('???')

cli
  .usage('Usage: ... | pretty [options]')

  .option('time-stamps', {
    group: 'Headers',
    default: Config.timeStamps,
    describe: 'Print TimeStamps',
    type: 'boolean'
  })

  .option('stamps-format', {
    alias: 'f',
    group: 'Headers',
    default: Config.stampsFormat,
    describe: 'TimeStamps format',
    type: 'String'
  })

  .option('stamps-time-zone', {
    alias: 'tz',
    group: 'Headers',
    default: Config.stampsTimeZone,
    describe: 'TimeStamps zone offset.',
    type: 'String'
  })

  .option('strict', {
    group: 'Filter',
    default: Config.strict,
    describe: 'Suppress all but legal Bunyan JSON log lines',
    type: 'boolean'
  })

  .option('level', {
    alias: 'l',
    group: 'Filter',
    choices: ['trace', 'debug', 'info', 'warn', 'fatal'],
    describe: 'Only show messages at or above the specified level.',
    type: 'string'
  })

  .option('depth', {
    group: 'Inspect',
    describe: '(passed to util.inspect)',
    default: Config.depth,
    type: 'number'
  })

  .option('max-array-length', {
    group: 'Inspect',
    describe: '(passed to util.inspect)',
    default: Config.maxArrayLength,
    type: 'number'
  })

  .option('force-color', {
    default: false,
    type: 'boolean',
    describe: 'Force color output'
  })

  .epilog('Copyright (c) 2018 Jorge Proaño. All rights reserved.')
  .wrap(Config.columns)
  .version()
  .help()

if (!Constants.PIPED) {
  cli.showHelp()
  process.exit(0)
}

process.stdin.on('end', () => process.exit(0))
process.on('SIGINT', () => cleanupAndExit('SIGINT'))
process.on('SIGQUIT', () => cleanupAndExit('SIGQUIT'))
process.on('SIGTERM', () => cleanupAndExit('SIGTERM'))
process.on('SIGHUP', () => cleanupAndExit('SIGHUP'))
process.on('SIGBREAK', () => cleanupAndExit('SIGBREAK'))

const outputStream = require('../lib')(process.stdout, cli.argv)
process.stdin.pipe(outputStream)

// ────────────────────────────────  private  ──────────────────────────────────

function cleanupAndExit (signal) {
  debug(signal)
  setTimeout(() => process.exit(0), 500)
}
