#! /usr/bin/env node
'use strict'

const bunyanPretty = require('../lib')

process.stdin.pipe(bunyanPretty(process.stdout))

process.on('SIGINT', function () { cleanupAndExit('SIGINT') })
process.on('SIGQUIT', function () { cleanupAndExit('SIGQUIT') })
process.on('SIGTERM', function () { cleanupAndExit('SIGTERM') })
process.on('SIGHUP', function () { cleanupAndExit('SIGHUP') })
process.on('SIGBREAK', function () { cleanupAndExit('SIGBREAK') })

function cleanupAndExit (signal) {
  // HARD EXIT
  setTimeout(() => {
    console.log(signal)
    process.exit(0)
  }, 500)
}

process.stdin.on('end', () => {
  process.exit(0)
})
