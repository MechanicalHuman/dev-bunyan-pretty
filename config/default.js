const { supportsColor } = require('supports-color')
const env = process.env

module.exports = {
  level: 10,
  strict: false,
  forceColor:
    'FORCE_COLOR' in env
      ? env.FORCE_COLOR.length === 0 || parseInt(env.FORCE_COLOR, 10) !== 0
      : false,
  termColors: false,
  colorLevel: supportsColor().level,
  depth: 4,
  maxArrayLength: 100,
  printHost: false,
  timeStamps: true,
  stampsFormat: 'YYYY-MM-DD-HH:mm:ss',
  stampsTimeZone: require('moment-timezone').tz.guess()
}
