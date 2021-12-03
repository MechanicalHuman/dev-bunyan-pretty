const { stdout } = require('supports-color')
const momentTz = require('moment-timezone')
const fp = require('lodash/fp')
const constants = require('../constants')

// ───────────────────────────────  CONSTANTS  ─────────────────────────────────

const TZ = momentTz.tz.guess()
const COLOR_LEVEL = /** @type {ColorLevel} */ (stdout ? stdout.level : 0)
const ST_FMT = 'YYYY-MM-DD-HH:mm:ss'

// ───────────────────────────────  Typedefs  ──────────────────────────────────

/** @typedef { typeof import("../constants").NAMED_LEVELS } NAMED_LEVELS */
/** @typedef { import("../constants").LogLevel } LogLevel */

/** @typedef { 0 | 1 | 2 | 3 } ColorLevel */

// ──────────────────────────────  Base Config  ────────────────────────────────

/**
 * @typedef {object} PrettyConfig
 * @property {LogLevel} level - Log Level
 * @property {boolean} strict - Ignore not Bunyan/Pino logs
 * @property {boolean} forceColor - Force Color output
 * @property {boolean} termColors - Trust the terminal colors, not the stream ones
 * @property {ColorLevel} colorLevel - Based on your terminal
 * @property {number} depth
 * @property {number} maxArrayLength
 * @property {boolean} printHost
 * @property {boolean} timeStamps
 * @property {string} stampsFormat
 * @property {string} stampsTimeZone - Based on your Locale
 */

/** @type {PrettyConfig} */
let CONFIG = {
  level: 10,
  strict: false,
  forceColor: /** @type {boolean} */ (getEnv('FORCE_COLOR', false)),
  termColors: /** @type {boolean} */ (getEnv('PRETTY_TERM_COLORS', false)),
  colorLevel: COLOR_LEVEL,
  depth: 4,
  maxArrayLength: 100,
  printHost: /** @type {boolean} */ (getEnv('PRETTY_PRINT_HOST', false)),
  timeStamps: true,
  stampsFormat: /** @type {string} */ (getEnv('PRETTY_STAMPS_FORMAT', ST_FMT)),
  stampsTimeZone: /** @type {string} */ (getEnv('PRETTY_TZ', TZ)),
}

/** @param {keyof PrettyConfig} key */
exports.get = (key) => fp.get(key)(CONFIG)

/**
 * @param {keyof PrettyConfig} key
 * @param {string|number|boolean} val
 * @return {PrettyConfig}
 */
exports.set = (key, val) => {
  CONFIG = fp.set(key, val)(CONFIG)
  return CONFIG
}

/**
 *
 * @param {Partial<PrettyConfig>} val
 * @returns {PrettyConfig}
 */
exports.extend = (val) =>
  fp.pipe(fp.pick(constants.CONFIG_FIELDS), fp.extend(CONFIG))(val)

/**
 * Get the config
 * @returns {PrettyConfig}
 */
exports.getAll = () => CONFIG

// ─────────────────────────────────  UTILS  ───────────────────────────────────

/**
 * Gets the environment key casted to a primitive or the default value
 * @param {string} key
 * @param {string|number|boolean} [defaultVal]
 * @returns {string|number|boolean|null|undefined}
 */

function getEnv(key, defaultVal) {
  let value = process.env[key]
  if (value === undefined) return defaultVal
  value = value.trim()

  if (defaultVal !== undefined) {
    if (typeof defaultVal === 'boolean') {
      if (/^(yes|on|true|enabled|1)$/i.test(value.toLowerCase())) return true
      if (/^(no|off|false|disabled|0)$/i.test(value.toLowerCase())) return false
      return defaultVal
    }

    if (typeof defaultVal === 'number') {
      if (!Number.isNaN(Number(value))) return Number(value)
      return defaultVal
    }
  }

  if (/^(yes|on|true|enabled)$/i.test(value.toLowerCase())) return true
  if (/^(no|off|false|disabled)$/i.test(value.toLowerCase())) return false
  if (value === 'null') return null
  if (!Number.isNaN(Number(value))) return Number(value)
  return value
}
