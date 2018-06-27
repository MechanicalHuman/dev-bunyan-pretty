<!--@h1([pkg.name])-->

# @mechanicalhuman/bunyan-pretty

<!--/@-->

<!--@pkg.description-->

Pretty format for Bunyan/Pino logs, similar to `bunyan -o short` but actually pretty.

<!--/@-->

![hero image](https://raw.githubusercontent.com/MechanicalHuman/dev-bunyan-pretty/master/img/pretty-nostamps.png)

<!--@installation()-->

## Installation

```sh
npm install --save @mechanicalhuman/bunyan-pretty
```

<!--/@-->

## Usage

The tool reads from the `STDIN` and is installed as the cmd `pretty` in the shell.

-   You can pipe it to the output of a running application:

    ```sh
    node index.js | pretty [OPTIONS]
    ```

-   Or just feed it an already exisitng file.

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

### Default Options:

The options object passed to `pretty` will merge with the default options.

```js
const defaultOptions = {
    strict: false,
    level: 0, // Named level or bunyan/pino level value
    forceColor: false,
    timeStamps: true,
    stampsFormat: 'YYYY-MM-DD-HH:mm:ss',
    stampsTimeZone: moment.tz.guess(), // Based on your Locale
    depth: 4,
    maxArrayLength: 100
}
```

### Example:

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

<!--@license()-->

## License

[MIT](./LICENSE) © [Jorge Proaño](https://www.hidden-node-problem.com)

<!--/@-->
