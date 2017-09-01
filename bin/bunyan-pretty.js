#! /usr/bin/env node
'use strict'

const bunyanPretty = require('../lib')

process.stdin.pipe(bunyanPretty(process.stdout))
