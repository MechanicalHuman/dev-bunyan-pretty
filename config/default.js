const supportsColor = require('supports-color')

module.exports = {
  level: 10,
  strict: false,
  forceColor: process.env.FORCE_COLOR
    ? process.env.FORCE_COLOR.length === 0 ||
      parseInt(process.env.FORCE_COLOR, 10) !== 0
    : false,
  termColors: false,
  colorLevel: supportsColor.stdout.level,
  depth: 4,
  maxArrayLength: 100,
  printHost: false,
  timeStamps: true,
  stampsFormat: 'YYYY-MM-DD-HH:mm:ss',
  stampsTimeZone: require('moment-timezone').tz.guess(),
}
