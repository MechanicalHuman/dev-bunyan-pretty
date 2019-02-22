import stream from 'stream'

export as namespace Pretty

export = Pretty

/** Factory function that returns a configured prettifier function.  */
declare function Pretty(options?: Partial<Pretty.Configuration>): function

/** Will wrap the given stream with pretty.  */
declare function Pretty(
  stream: Pretty.DestinationStream,
  options?: Partial<Pretty.Configuration>
): stream.Writable

declare namespace Pretty {
  type DestinationStream =
    | stream.Writable
    | stream.Duplex
    | stream.Transform
    | NodeJS.WritableStream

  export declare interface LogRecord {
    pid: string
    hostname: string
    level: number
    time: number
    app?: string
    name: string
    msg?: string
    v: 1

    [x: string]: any
  }

  export interface SerializedReq {
    method: string
    url: string
    remoteAddress?: string
  }

  export interface SerializedRes {
    statusCode: number
  }

  export interface SerializedErr {
    stack: string
    name?: string
    code?: number
    signal?: string
  }

  export declare interface HttpRecord extends LogRecord {
    req: SerializedReq
    res: SerializedRes
    userId?: string
    req_id?: string
    reqId?: string
  }

  export declare interface ErrRecord extends LogRecord {
    err: SerializedErr
  }

  export declare interface Configuration {
    level: number
    strict: boolean
    colorize: boolean
    depth: number
    maxArrayLength: number
    printHost: boolean
    timeStamps: boolean
    stampsFormat: string
    stampsTimeZone: string
  }
}
