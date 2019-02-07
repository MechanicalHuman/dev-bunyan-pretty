#! /usr/bin/env node
'use strict'

const yargs = require('yargs')
const updateNotifier = require('update-notifier')
const pump = require('pump')
const split = require('split2')
const { Transform } = require('stream')
const moment = require('moment-timezone')
const chalk = require('chalk')

const debug = require('debug')('mech:pretty:cli')
const pkg = require('../package.json')
const { getColumns, coerceLevel } = require('../lib/utils')
const { defaultConfig, asOptions } = require('../lib/config')

updateNotifier({ pkg }).notify({
  isGlobal: true,
  shouldNotifyInNpmScript: true
})

// ───────────────────────────────  CLI conf  ──────────────────────────────────

yargs
  .usage('Usage: $0 [options]')
  .scriptName('pretty')
  .env('PRETTY')
  .wrap(getColumns())

  .option('time-stamps', {
    alias: 'stamps',
    group: 'Headers',
    default: defaultConfig.timeStamps,
    describe: 'Print TimeStamps',
    type: 'boolean'
  })

  .option('stamps-format', {
    alias: 'f',
    group: 'Headers',
    default: defaultConfig.stampsFormat,
    describe: 'TimeStamps format (moment)',
    type: 'string'
  })

  .option('stamps-time-zone', {
    alias: 'z',
    group: 'Headers',
    default: defaultConfig.stampsTimeZone,
    coerce: val => {
      const zone = val.trim()
      if (moment.tz.zone(zone)) return zone
      throw new RangeError(`${zone} is not a known time zone`)
    },
    describe: 'TimeStamps zone offset.',
    type: 'string'
  })

  .option('print-host', {
    group: 'Headers',
    default: defaultConfig.printHost,
    describe: 'prepends the host to the log line, useful for combined streams',
    type: 'boolean'
  })

  .option('strict', {
    group: 'Filter',
    default: defaultConfig.strict,
    describe: 'Suppress all but legal Bunyan JSON log lines',
    type: 'boolean'
  })

  .option('level', {
    alias: 'l',
    group: 'Filter',
    choices: ['trace', 'debug', 'info', 'error', 'warn', 'fatal'],
    describe: 'Only show messages at or above the specified level.',
    coerce: v => coerceLevel(v, true, true),
    type: 'string'
  })

  .option('depth', {
    group: 'Inspect',
    describe: '(passed to util.inspect)',
    default: defaultConfig.depth,
    coerce: v => (v < 0 ? 0 : v),
    type: 'number'
  })

  .option('max-array-length', {
    group: 'Inspect',
    describe: '(passed to util.inspect)',
    default: defaultConfig.maxArrayLength,
    coerce: v => (v < 0 ? 0 : v),
    type: 'number'
  })

  .option('colorize', {
    alias: 'c',
    default: defaultConfig.colorize,
    describe: 'Force color output',
    type: 'boolean'
  })

  .fail(onValidationFail)
  .showHelpOnFail(false)

  .example('node server.js | $0 [options]', 'Prettifies program server.js')
  .example('$0 [options] < server.log', 'Prettifies log file server.log')

  .help('h')
  .alias('h', 'help')

  .version()
  .epilog('Copyright (c) 2019 Jorge Proaño. All rights reserved.')

  .completion()

// ────────────────────────────────  Parser  ───────────────────────────────────

const opts = asOptions(yargs.argv)

// ─────────────────────────────────  Exit  ────────────────────────────────────

if (process.stdin.isTTY === true) {
  debug('CLI Options: %O', opts)
  yargs.showHelp()
  process.exit(0)
}

process.stdin.on('end', exit)
process.on('SIGINT', () => cleanupAndExit())
process.on('SIGQUIT', () => cleanupAndExit())
process.on('SIGTERM', () => cleanupAndExit())
process.on('SIGHUP', () => cleanupAndExit())
process.on('SIGBREAK', () => cleanupAndExit())

function cleanupAndExit () {
  setTimeout(() => process.exit(0), 500)
}

function exit () {
  process.exit(0)
}

// ─────────────────────────────────  Main  ────────────────────────────────────

const pretty = require('../lib')(opts)

const prettyTransport = new Transform({
  objectMode: true,
  transform (chunk, _enc, cb) {
    const line = pretty(chunk.toString())
    if (line === undefined) return cb()
    cb(undefined, line)
  }
})

pump(process.stdin, split(), prettyTransport, process.stdout)

// ────────────────────────────────  private  ──────────────────────────────────

function onValidationFail (msg) {
  // eslint-disable-next-line no-console
  console.error(`
    ${chalk.red.bold(msg)}

    ${chalk.yellow('Use --help for available options')}
    `)
  process.exit(1)
}
