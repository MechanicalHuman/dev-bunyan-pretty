#! /usr/bin/env node
'use strict'

process.env.DEBUG = 'mech:logger*'

const chalk = require('chalk')
const cli = require('yargs')
const fs = require('fs')
const lodash = require('lodash')
const path = require('path')
const supportsColor = require('supports-color')
const termSize = require('term-size')
const updateNotifier = require('update-notifier')

const Constants = require('../lib/constants')
const config = require('../lib/config')
const pkg = require('../package.json')

const debug = require('debug')('mech:logger:cli')
const PIPED = !process.stdin.isTTY

updateNotifier({ pkg }).notify()

cli
  .usage('Usage: pretty <file> [options]')
  .env('MECH_LOGGER')
  .option('depth', {
    alias: 'd',
    group: 'Formating Options',
    describe:
      'Specifies the number of times to recurse while formatting the object.',
    number: true,
    default: 3
  })
  .option('colors', {
    describe: 'Whether or not to use colors in the debug output.',
    group: 'Formating Options',
    boolean: true,
    default: !!supportsColor,
    defaultDescription: 'Detect from terminal'
  })
  .option('header', {
    describe: 'Prepend the record name',
    group: 'Formating Options',
    boolean: true,
    default: true
  })
  .option('time-stamp', {
    describe: 'Timestamp format',
    group: 'Formating Options',
    string: true,
    choices: ['diff', 'ISO', 'local'],
    default: 'diff',
    defaultDescription: 'Millisecond diff'
  })
  .option('strict', {
    alias: 's',
    group: 'Filtering Options',
    describe: 'Suppress all but legal Bunyan JSON log lines.',
    boolean: true
  })
  .option('level', {
    alias: 'l',
    group: 'Filtering Options',
    describe: 'Only show messages at or above the specified level.',
    choices: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'],
    string: true,
    array: true
  })
  .option('condition', {
    alias: 'c',
    group: 'Filtering Options',
    describe:
      'Run each log message through the condition and only show those that return truish.',
    array: true,
    coerce: coerceConditions
  })
  .option('has-key', {
    alias: 'k',
    group: 'Filtering Options',
    string: true,
    array: true,
    describe: 'Only show messages that include the spefic key.'
  })
  .option('tag', {
    alias: 't',
    group: 'Filtering Options',
    string: true,
    array: true,
    describe: 'Only show messages that include the spefic tag.'
  })
  .option('name', {
    alias: 'n',
    group: 'Filtering Options',
    string: true,
    array: true,
    describe: 'Only show messages from the specified name (regEx aware)'
  })
  .check(checkInput)
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

const { file } = cli.argv
const rawOptions = lodash.pick(cli.argv, Constants.OPTIONS_KEYS)
debug(file)
debug(rawOptions)

debug(config.create(rawOptions))

if (PIPED) attachToEvents()

const stream = PIPED ? process.stdin : fs.createReadStream(file)
stream.pipe(require('../lib')(process.stdout))

// ───────────────────────────────  private  ───────────────────────────────────

function coerceConditions (condition) {
  return condition.map(js => {
    if (js.indexOf('return') === -1) {
      if (js.substring(js.length - 1) === ';') {
        js = js.substring(0, js.length - 1)
      }
      js = 'return (' + js + ')'
    }
    return new Function(js) // eslint-disable-line no-new-func
  })
}

function checkInput (argv) {
  const file = lodash.get(argv, '_[0]')
  const HASFILE = !lodash.isNil(file)

  if (HASFILE) {
    // debug('File Provided')
    argv.file = path.resolve(file)
  }

  if (!HASFILE && !PIPED) {
    throw new Error('You need to provide either a <file> or pipe the command')
  }
  if (HASFILE && PIPED) {
    throw new Error("You can't provide a <file> and pipe the command")
  }

  if (PIPED) return true

  try {
    const isFile = fs.statSync(argv.file).isFile()
    if (isFile) return true
    throw new Error(`[ ${file} ] is not a File`)
  } catch (error) {
    if (error.code === 'ENOENT') throw new Error(`[ ${file} ] do not exists`)
    throw error
  }
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
