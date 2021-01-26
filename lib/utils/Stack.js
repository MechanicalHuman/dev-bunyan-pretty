'use strict'

const path = require('path')
const lodash = require('lodash')

// ──────────────────────        Module Exports        ─────────────────────────
module.exports = (stack) => formatStack(getStack(stack))

// ──────────────────────    StackFrame Constructor    ─────────────────────────

/**
 * @param {{ file: any; path: any; line: any; fn: any; kind: any; }} frame
 */
function StackFrame(frame) {
  this.file = frame.file
  this.path = frame.path
  this.line = frame.line
  this.fn = frame.fn
  this.kind = frame.kind
}

// ──────────────────────       Private Methods        ─────────────────────────

/**
 *
 * @param {string} stack
 */
function getStack(stack) {
  if (!stack) return []

  const lines = stack.split('\n').slice(1)

  // TODO: Make GetStack() Function less complex
  return lines
    .map(function (line) {
      if (line.match(/^\s*[-]{4,}$/)) {
        return createParsedCallSite({
          FileName: line,
          LineNumber: null,
          FunctionName: null,
          TypeName: null,
          MethodName: null,
          ColumnNumber: null,
          native: null,
        })
      }
      const regexMatch = /at (?:(.+)\s+\()?(?:(.+?):(\d+):(\d+)|([^)]+))\)?/
      const lineMatch = line.match(regexMatch)
      if (!lineMatch) return null
      let object = null
      let method = null
      let functionName = null
      let typeName = null
      let methodName = null
      const isNative = lineMatch[5] === 'native'
      if (lineMatch[1]) {
        const methodMatch = lineMatch[1].match(/([^.]+)(?:\.(.+))?/)
        object = methodMatch[1]
        method = methodMatch[2]
        functionName = lineMatch[1]
        typeName = 'Object'
      }
      if (method) {
        typeName = object
        methodName = method
      }
      if (method === '<anonymous>') {
        methodName = null
        functionName = ''
      }
      const properties = {
        FileName: lineMatch[2] || null,
        LineNumber: parseInt(lineMatch[3], 10) || null,
        FunctionName: functionName,
        TypeName: typeName,
        MethodName: methodName,
        ColumnNumber: parseInt(lineMatch[4], 10) || null,
        native: isNative,
      }
      return createParsedCallSite(properties)
    })
    .filter(function (callSite) {
      return !!callSite
    })

  function createParsedCallSite(properties) {
    const Stack = {}
    lodash.each(properties, function (property, key) {
      let prefix = 'get'
      if (key === 'native') {
        prefix = 'is'
      }
      property = '' + property
      const method = prefix + key
      const Callsite = function (property) {
        const t = lodash.clone(property)
        return function () {
          return t
        }
      }
      Stack[method] = new Callsite(property)
    })
    return Stack
  }
}

/**
 * Pretty formats the ugly V8 Stack Trace
 * @param  {StackTrace} stack The StackTrace to be formated
 * @return {Array}            The Pretty StackFrame Array
 */
function formatStack(stack) {
  return lodash.each(stack, function (frame, key, collection) {
    const thisframe = {
      file: null,
      path: null,
      line: null,
      fn: null,
      kind: null, // ['Application', 'Library', 'NodeJS', 'Native']
    }

    const filepath = frame.getFileName()
    const functionName = frame.getFunctionName()
    if (lodash.isEmpty(filepath) === false) {
      thisframe.file = path.basename(filepath)
      thisframe.line = frame.getLineNumber() || '0'
      thisframe.path = filepath

      thisframe.kind =
        filepath.indexOf('/') !== 0
          ? 'NodeJS'
          : filepath.indexOf('node_modules') > -1
          ? 'Library'
          : 'Application'
    } else {
      if (frame.isnative()) {
        thisframe.file = 'V8'
        thisframe.path = 'V8'
      } else {
        thisframe.file = 'Unknown'
        thisframe.path = 'Unknown'
      }
      thisframe.kind = 'Native'
    }

    if (functionName === 'null') {
      thisframe.fn = 'Root'
    } else if (lodash.isEmpty(functionName) === false) {
      thisframe.fn = functionName
    } else {
      thisframe.fn = 'Script Evaluation'
    }

    collection[key] = new StackFrame(thisframe)
  })
}
