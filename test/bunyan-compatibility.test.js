/*!
 * Copyright 2019 Jorge Proaño.
 */

/* eslint-env node, mocha */

'use strict'
// process.env.DEBUG = 'mech*'
const { expect } = require('chai')

const { Writable } = require('stream')

const bunyan = require('bunyan')
const pretty = require('../lib')
const { defaultConfig } = require('../lib/config')
const moment = require('moment-timezone')

const time = new Date()
const isoTime = moment(time)
  .tz(defaultConfig.stampsTimeZone)
  .format(defaultConfig.stampsFormat)
// import 'mocha'

describe('Bunyan Compatibility', function () {
  it('Should format a line', function () {
    const testStream = new Writable({
      write (chunk, _enc, cb) {
        expect(chunk.toString()).to.equal(`${isoTime} │ logger ❯ test me \n`)
        cb()
      }
    })

    const logger = bunyan.createLogger({
      name: 'logger',
      stream: pretty(testStream, { colorize: false }),
      level: 'info'
    })

    logger.info({ time }, 'test me')
  })
})
