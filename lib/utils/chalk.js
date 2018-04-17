const chalk = require('chalk')
const config = require('../config')
const ctx = new chalk.constructor({ level: config.colorLevel })

module.exports = ctx
