#! /usr/bin/env node
'use strict'

// process.env.DEBUG = 'mech*'

const chalk = require('chalk')
const cli = require('yargs')
const termSize = require('term-size')
const updateNotifier = require('update-notifier')

const Constants = require('../lib/constants')
const pkg = require('../package.json')

const debug = require('debug')('mech:logger:cli')
const PIPED = !process.stdin.isTTY

updateNotifier({ pkg }).notify()

cli
  .usage('Usage: pretty [options]')
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
  .option('depth', {
    default: 4,
    describe: '(passed to util.inspect)'
  })
  .alias('help', 'h')
  .alias('version', 'v')
  .fail(msg => {
    cli.showHelp()
    console.error(chalk.red(`${chalk.bold('>')} ${msg}`))
    process.exit(0)
  })
  .epilog('Copyright (c) 2017 Jorge Proaño. All rights reserved.')
  .wrap(termSize().columns)
  .version()
  .help()

const { timeStamps, stampFormat, depth } = cli.argv

if (PIPED) {
  Constants.DEPTH = depth
  Constants.TIME_STAMPS = timeStamps
  Constants.TIME_STAMPS_FORMAT = stampFormat
  attachToEvents()
  process.stdin.pipe(require('../lib')(process.stdout))
}

function attachToEvents () {
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
  function cleanupAndExit (signal) {
    debug(signal)
    setTimeout(() => process.exit(0), 500)
  }
}
