#! /usr/bin/env node

import Debug from 'debug'
import fp from 'lodash/fp'
import UpdateNotifier from 'update-notifier'
import yargs from 'yargs'
import pkg from '../package.json'

// ────────────────────────────  Update Notifier  ──────────────────────────────

UpdateNotifier({ pkg }).notify({
    isGlobal: true,
    shouldNotifyInNpmScript: true
})

// ─────────────────────────────────  Main  ────────────────────────────────────

const debug = Debug('mech:pretty:cli')

// ────────────────────────────────  private  ──────────────────────────────────

function cleanupAndExit(signal) {
    debug('Received: %s. Clossing on 500ms', signal)
    setTimeout(() => process.exit(0), 500)
}

function exit() {
    debug('stdin ended, closing the app')
    process.exit(0)
}
