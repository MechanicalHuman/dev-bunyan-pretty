'use strict'

const util = require('util')
const moment = require('moment-timezone')
const { supportsColor } = require('supports-color')
const termSize = require('term-size')

const Constants = require('./constants')

class Config {
  constructor () {
    this._level = 10
    this.strict = false
    this.depth = 4
    this.maxArrayLength = 100
    this.timeStamps = true
    this.stampsFormat = 'YYYY-MM-DD-HH:mm:ss'
    this.stampsTimeZone = moment.tz.guess()
    this.forceColor = Constants.FORCE_COLOR
    this.stream = process.stdout
  }

  get colorLevel () {
    if (this.forceColor) return 1
    return this._colors || supportsColor(this.stream).level
  }

  set colorLevel (val) {
    if (!val) return
    this._colors = val
  }

  get columns () {
    return termSize().columns || Constants.COLUMNS
  }

  get minColumns () {
    return this.columns > Constants.COLUMNS_MIN
      ? Constants.COLUMNS_MIN
      : this.columns
  }

  set level (nameOrNum) {
    if (!nameOrNum) return
    const type = typeof nameOrNum

    if (type === 'string') {
      const test = nameOrNum.toLowerCase()
      if (test in Constants.NAMED_LEVELS) {
        this._level = Constants.NAMED_LEVELS[test]
        return
      }
    }

    if (type === 'number' && Constants.LEVELS.includes(nameOrNum)) {
      this._level = nameOrNum
      return
    }

    throw new TypeError(
      util.format('cannot resolve level: invalid arg (%s):%s', type, nameOrNum)
    )
  }

  get level () {
    return this._level
  }
}

module.exports = new Config()
