const chalk = require('chalk')
const config = require('config')

const ctx = new chalk.constructor({ level: config.get('pretty.colorLevel') })

module.exports = ctx
