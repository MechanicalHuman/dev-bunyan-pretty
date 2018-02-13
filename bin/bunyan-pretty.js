#! /usr/bin/env node
'use strict'

// process.env.DEBUG = 'mech*'

const cli = require('yargs')
const termSize = require('term-size')
const updateNotifier = require('update-notifier')
const moment = require('moment-timezone')
const supportsColor = require('supports-color')

const Constants = require('../lib/constants')
const pkg = require('../package.json')

const debug = require('debug')('mech:logger:cli')

const PIPED = !process.stdin.isTTY

updateNotifier({ pkg }).notify()

Constants.COLUMNS = termSize().columns
Constants.COLUMNS_BREAK = Constants.INPM2 ? 79 : 80
Constants.COLUMNS_MIN = Constants.COLUMNS > 60 ? 60 : Constants.COLUMNS

Constants.USE_COLORS = supportsColor.stdout.level || 0

cli
  .usage('Usage: ... | pretty [options]')
  .option('t', {
    alias: 'time-stamps',
    default: true,
    describe: 'Print TimeStamps',
    type: 'boolean'
  })
  .option('f', {
    alias: 'stamp-format',
    default: 'YYYY-MM-DD-HH:mm:ss',
    describe: 'TimeStamps format (passed to moment.format)',
    type: 'String'
  })
  .option('z', {
    alias: 'time-zone',
    default: moment.tz.guess() || 'UTC',
    describe: 'TimeStamps zone offset (ex: "America/New_York")',
    type: 'String'
  })
  .option('l', {
    alias: 'level',
    default: 'trace',
    describe: 'Only show messages at or above the specified level.',
    type: 'String'
  })
  .option('depth', {
    default: 4,
    describe: '(passed to util.inspect)'
  })
  .option('strict', {
    default: false,
    type: 'boolean',
    describe: 'Suppress all but legal Bunyan JSON log lines'
  })
  .epilog('Copyright (c) 2018 Jorge Proaño. All rights reserved.')
  .wrap(Constants.COLUMNS)
  .version()
  .help()

if (!PIPED) {
  cli.showHelp()
  process.exit(0)
}

const { timeStamps, stampFormat, depth, timeZone, strict, level } = cli.argv

Constants.STRICT = strict
Constants.DEPTH = depth
Constants.MIN_LEVEL = Constants.LEVELS[level.toLowerCase()] || 0
Constants.TIME_STAMPS = timeStamps
Constants.TIME_STAMPS_FORMAT = stampFormat
Constants.TIME_STAMPS_ZONE = timeZone

process.stdin.on('end', () => process.exit(0))
process.on('SIGINT', function () {
  cleanupAndExit('SIGINT')
})
process.on('SIGQUIT', function () {
  cleanupAndExit('SIGQUIT')
})
process.on('SIGTERM', function () {
  cleanupAndExit('SIGTERM')
})
process.on('SIGHUP', function () {
  cleanupAndExit('SIGHUP')
})
process.on('SIGBREAK', function () {
  cleanupAndExit('SIGBREAK')
})

const outputStream = require('../lib')(process.stdout)

process.stdin.pipe(outputStream)

// ────────────────────────────────  private  ──────────────────────────────────

function cleanupAndExit (signal) {
  debug(signal)
  setTimeout(() => process.exit(0), 500)
}
