const chalk = require('chalk')
const config = require('./config')

const ctx = new chalk.Instance({ level: config.get('colorLevel') })
module.exports = ctx
