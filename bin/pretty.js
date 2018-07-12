#! /usr/bin/env node
'use strict'

process.env.SUPPRESS_NO_CONFIG_WARNING = 'y'

// process.env.DEBUG = 'mech*'

const cli = require('yargs')
const updateNotifier = require('update-notifier')
const debug = require('debug')('mech:pretty:cli')
const path = require('path')
const { util } = require('config')
const pkg = require('../package.json')
const { getColumns } = require('../lib/utils')

const config = util.loadFileConfigs(path.join(__dirname, 'config'))

updateNotifier({ pkg }).notify()

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

if (process.stdin.isTTY === false) {
  cli.showHelp()
  process.exit(0)
}

process.stdin.on('end', () => process.exit(0))
process.on('SIGINT', () => cleanupAndExit('SIGINT'))
process.on('SIGQUIT', () => cleanupAndExit('SIGQUIT'))
process.on('SIGTERM', () => cleanupAndExit('SIGTERM'))
process.on('SIGHUP', () => cleanupAndExit('SIGHUP'))
process.on('SIGBREAK', () => cleanupAndExit('SIGBREAK'))

debug('args', cli.argv)

const outputStream = require('../lib')(process.stdout, cli.argv)
process.stdin.pipe(outputStream)

// ────────────────────────────────  private  ──────────────────────────────────

function cleanupAndExit (signal) {
  debug(signal)
  setTimeout(() => process.exit(0), 500)
}
