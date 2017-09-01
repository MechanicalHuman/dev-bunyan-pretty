'use strict'

module.exports = {
  'pretty-error': {
    marginLeft: 2
  },
  'pretty-error > header > title > kind': {
    color: 'red',
    background: 'none'
  },
  'pretty-error > header > colon': {
    display: 'none'
  },
  'pretty-error > header > message': {
    display: 'none'
  },

  'pretty-error > trace': {
    marginLeft: 2,
    marginTop: 0,
    marginBottom: 0
  },
  'pretty-error > trace > item': {
    marginLeft: 2,
    marginTop: 0,
    marginBottom: 0,
    bullet: '"<red>↳</red>"'
  // bullet: '"<red>❯</red>"'
  },
  'pretty-error > trace > item > header': {
    display: 'block'
  },
  'pretty-error > trace > item > header > pointer': {
    marginRight: 1
  },
  'pretty-error > trace > item > header > pointer > file': {
    color: 'white'
  },

  'pretty-error > trace > item > header > pointer > colon': {
    display: 'none'
  },

  'pretty-error > trace > item > header > pointer > line': {
    display: 'none'
  },

  'pretty-error > trace > item > header > what': {
    display: 'inline',
    color: 'grey'
  },

  'pretty-error > trace > item > footer': {
    display: 'block'
  },
  'pretty-error > trace > item > footer > addr': {
    display: 'block',
    marginLeft: 2,
    bullet: '"<grey>↳</grey>"',
    color: 'grey'
  }

}
