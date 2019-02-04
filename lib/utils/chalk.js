const chalk = require('chalk')
const config = require('config')

// @ts-ignore
const ctx = new chalk.constructor({ level: config.get('pretty.colorLevel') })

module.exports = ctx
