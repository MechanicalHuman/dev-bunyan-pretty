'use strict'

const lodash = require('lodash')
const Constants = require('../constants')
const chalk = require('../utils/chalk')
const { shortPath } = require('../utils')
const { format: printf } = require('util')
const Stack = require('../utils/Stack')

function render (record) {
  const err = lodash.clone(record.err)

  const output = []

  if (err.name !== null && err.name !== undefined) {
    output.push(chalk.red.bold(`↳ ${err.name}`))
  }
  if (err.code !== null && err.code !== undefined) {
    output.push(chalk.red('  code: ') + chalk.reset(err.code))
  }
  if (err.signal !== null && err.signal !== undefined) {
    output.push(chalk.red('  signal: ') + chalk.reset(err.signal))
  }

  const stackFrames = prettyStack(new Stack(err))

  if (stackFrames.length > 0) {
    output.push(
      chalk.red('  stack: ') + chalk.dim(`[${stackFrames.length} Frames]`)
    )

    stackFrames.forEach(function (frame) {
      output.push(chalk.dim('   • ') + frame)
    })
  }

  // console.dir(error.getObject(err), { depth: 100 })
  return output.map(v => `  ${v}`).join(Constants.NEW_LINE)
}

module.exports = render

function prettyStack (stack) {
  var frames = stack.stackFrames || []
  var lines = []
  frames.forEach(function (frame) {
    var color = 'dim'
    switch (frame.kind) {
      case 'Library':
      case 'External':
        color = 'reset'
        break
      case 'Application':
        color = 'yellow'
        break
    }
    var formatframe = printf('%s:%s - %s', frame.file, frame.line, frame.fn)
    if (frame.kind === 'Application') {
      var filepath = shortPath(frame.file)
      formatframe = printf('%s:%s - %s', filepath, frame.line, frame.fn)
    }
    lines.push(chalk[color](formatframe))
  })

  return lines
}
