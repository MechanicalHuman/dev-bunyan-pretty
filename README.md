# @mechanicalhuman/bunyan-pretty

![hero image](https://raw.githubusercontent.com/MechanicalHuman/dev-bunyan-pretty/master/img/pretty-nostamps.png)

> Prettifies NDJSON (Newline Delimited JSON) logs, like \`bunyan -o short\` but actually pretty.

---

## Table of contents

-   [Install](#install)

-   [Usage](#usage)

-   [Options](#options)

    -   -   [Notes:](#notes)

-   [Programatic Interface](#programatic-interface)

    -   [Default Options](#default-options)
    -   [Example](#example)

-   [Maintainers](#maintainers)

-   [Changelog](#changelog)

-   [License](#license)

## Install

```sh
npm install @mechanicalhuman/bunyan-pretty
```

## Usage

The tool reads from the `STDIN` and is installed as the cmd `pretty` in the shell.

-   You can pipe it to the output of a running application:

    ```sh
    node index.js | pretty [OPTIONS]
    ```

-   Or just feed it an already existing file.

    ```sh
    pretty [OPTIONS] < input.log
    ```

## Options

    pretty --help
    ___

    Usage: ... | pretty [options]

    Time Staps
    --time-stamps                   Print TimeStamps.                   [boolean][default: true]
    --stamps-format, -f             TimeStamps format.                  [YYYY-MM-DD-HH:mm:ss]
    --stamps-time-zone, --tz        TimeStamps zone offset.             [default: "Etc/UTC"]
    --print-host                    Prepends the host to the log line.  [boolean][default: false]

    Filter
    --strict                        Only show "legal" log lines.        [boolean][default: false]
    --level, -l                     Only show messages >= level.        [string][default: "trace"]

    Inspect
    --depth                         (passed to util.inspect)            [number][default: 4]
    --max-array-length              (passed to util.inspect)            [number][default: 100]

    Other
    --force-color                   Force color output                  [boolean][default: false]

#### Notes:

-   The`boolean` options can be set false using `--no-option`. Example: `--no-time-stamps`
-   The`--level` choices are: "trace", "debug", "info", "error", "warn", "fatal"
-   The`--stamps-format` value is passed directly to [`moment.format()`](https://momentjs.com/docs/#/displaying/format/)
-   You force the colored output using the env variable: `FORCE_COLOR=1`
-   You can pass the time stamps zone offset via the env variable: `PRETTY_TZ`
-   You can pass the time stamps format via the env variable: `PRETTY_STAMPS_FORMAT`

## Programatic Interface

You can use pretty as a writable stream from inside your NodeJS scripts. Probably usefull on development.

```js
/**
 * WIll wrap the given stream with pretty.
 *
 * @param  {WritableStream} stream          Writable stream to wrap pretty around
 * @param  {Object} [opts]                  Options object, will merge with the default options.
 *
 * @return {WritableStream}
 */

const pretty = require('@mechanicalhuman/bunyan-pretty')
```

### Default Options

The options object passed to `pretty` will merge with the default options.

```js
const defaultOptions = {
    level: 0, // Named level or bunyan/pino level value
    strict: false,

    forceColor: false
    termColors: false, // trust the term colors, not the stream ones
    colorLevel: 2, // based on your terminal (uses supports-color)

    depth: 4,
    maxArrayLength: 100,

    printHost: false,
    timeStamps: true,
    stampsFormat: 'YYYY-MM-DD-HH:mm:ss',
    stampsTimeZone: moment.tz.guess(), // Based on your Locale
}
```

### Example

```js
const pretty = require('@mechanicalhuman/bunyan-pretty')
const bunyan = require('bunyan')

const log = bunyan.createLogger({
    name: 'myapp',
    stream: pretty(process.stdout, { timeStamps: false }),
    level: 'info'
})

log.info('hello world')
```

## Maintainers

-   [Jorge Proaño](mailto:jorge@hiddennodeproblem.com)

## Changelog

## License

[MIT](LICENSE) © [Jorge Proaño](http://www.hidden-node-problem.com)
