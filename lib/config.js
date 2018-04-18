'use strict'

const Conf = require('conf')
const moment = require('moment-timezone')
const { supportsColor } = require('supports-color')
const termSize = require('term-size')

const Constants = require('./constants')
const util = require('util')

const defaults = new Conf({
  defaults: {
    depth: 4,
    maxArrayLength: 100,
    timeStamps: true,
    stampsFormat: 'YYYY-MM-DD-HH:mm:ss',
    stampsTimeZone: moment.tz.guess()
  }
})

class Config {
  constructor () {
    this.level = 10
    this.strict = false

    this.depth = defaults.get('depth', 4)
    this.maxArrayLength = defaults.get('maxArrayLength', 100)

    this.timeStamps = defaults.get('timeStamps', true)
    this.stampsFormat = defaults.get('stampsFormat', 'YYYY-MM-DD-HH:mm:ss')
    this.stampsTimeZone = defaults.get('stampsTimeZone', moment.tz.guess())
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
      if (test in Constants.NAMED_LEVELS) return Constants.NAMED_LEVELS[test]
    }

    if (type === 'number' && Constants.LEVELS.includes(nameOrNum)) {
      return nameOrNum
    }

    throw new TypeError(
      util.format('cannot resolve level: invalid arg (%s):', type, nameOrNum)
    )
  }
}

module.exports = new Config()
