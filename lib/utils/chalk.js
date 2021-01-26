const chalk = require('chalk')
const config = require('config')

const ctx = new chalk.Instance({ level: config.get('pretty.colorLevel') })
module.exports = ctx
