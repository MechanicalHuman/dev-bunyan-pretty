'use strict'

const fp = require('lodash/fp')
const Constants = require('../constants')
const Utils = require('../utils')
const chalk = require('../utils/chalk')
const Stack = require('../utils/Stack')

function render(record, raw = false) {
  if (raw === false) {
    if (!Utils.isError(record)) return []
  }

  const bold = chalk.red.bold
  const normal = chalk.reset
  const dimmed = chalk.dim

  const err = raw ? fp.cloneDeep(record) : fp.cloneDeep(record.err)

  const output = []

  if (err.name !== null && err.name !== undefined) {
    output.push(bold(Constants.ARROW + Constants.SPACE_CHAR + err.name))
  }

  if (err.code !== null && err.code !== undefined) {
    output.push(padRed('code') + normal(err.code))
  }

  if (err.signal !== null && err.signal !== undefined) {
    output.push(padRed('signal') + normal(err.signal))
  }

  const stacks = err.stack.split('Caused by: ')

  const stack = Stack(stacks.shift())

  if (stack.length > 0) {
    output.push(padRed('stack') + chalk.dim(`[${stack.length - 1} Frames]`))
    const onlyApps = stack.filter((frame) => frame.kind === 'Application')
    if (onlyApps.length === 0) addFrames(stack)
    else addFrames(onlyApps)
  }

  stacks.forEach((cause) => {
    const reason = getReason(cause)
    const stackFrames = Stack(cause)

    if (stackFrames.length > 0) {
      output.push(
        padRed('Caused by') +
          chalk.red(reason) +
          chalk.dim(` [${stackFrames.length - 1} Frames]`)
      )

      const onlyApps = stackFrames.filter(
        (frame) => frame.kind === 'Application'
      )
      if (onlyApps.length === 0) addFrames(stackFrames)
      else addFrames(onlyApps)
    }
  })

  return output.map((v) => Constants.PADDING + v)

  function addFrames(stack) {
    const formatStack = prettyStack(stack)

    formatStack.forEach(function (frame) {
      output.push(
        Constants.PADDING +
          dimmed(Constants.SPACE_CHAR + Constants.DOT + Constants.SPACE_CHAR) +
          frame
      )
    })
  }
}

module.exports = render

function padRed(head) {
  return chalk.red(Constants.PADDING + head + ':' + Constants.SPACE_CHAR)
}

function getReason(cause) {
  const first = cause.split('\n').shift().split(';').shift()

  return first.replace('Caused by: ', '') || ''
}

function prettyStack(stack) {
  const frames = stack || []
  const lines = []
  frames.forEach(function (frame) {
    let color = 'dim'
    switch (frame.kind) {
      case 'Library':
        color = 'reset'
        break
      case 'Application':
        color = 'yellow'
        break
    }

    let formatframe = Utils.format(
      '%s:%s - %s',
      frame.path,
      frame.line,
      frame.fn
    )

    if (frame.kind === 'Application') {
      const filepath = Utils.shortPath(frame.path)
      formatframe = Utils.format('%s:%s - %s', filepath, frame.line, frame.fn)
    }

    if (frame.kind === 'Library') {
      const filepath = Utils.modulePath(frame.path)
      formatframe = Utils.format('%s:%s - %s', filepath, frame.line, frame.fn)
    }

    lines.push(chalk[color](formatframe))
  })

  return lines
}
