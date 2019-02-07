export as namespace Pretty

export = Pretty

declare function Pretty(options?: Pretty.Configuration): function

declare namespace Pretty {
    export declare interface LogRecord {
        pid: string
        hostname: string
        level: number
        time: number
        app?: string
        name?: string
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

    export declare interface Options {
        level?: number
        strict?: boolean
        colorize?: boolean
        depth?: number
        maxArrayLength?: number
        printHost?: boolean
        timeStamps?: boolean
        stampsFormat?: string
        stampsTimeZone?: string
    }
}
