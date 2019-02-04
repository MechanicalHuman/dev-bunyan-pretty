declare interface LogRecord {
    pid: string
    hostname: string
    level: number
    time: number
    app?: string
    name?: string
    msg?: string
}

interface SerializedReq {
    method: string
    url: string
    remoteAddress?: string
}

interface SerializedRes {
    statusCode: number
}

interface SerializedErr {
    stack: string
    name?: string
    code?: number
    signal?: string
}

declare interface HttpRecord extends LogRecord {
    req: SerializedReq
    res: SerializedRes
    userId?: string
    req_id?: string
    reqId?: string
}

declare interface ErrRecord extends LogRecord {
    err: SerializedErr
}

declare interface Configuration {
    level?: number
    strict?: boolean
    forceColor?: boolean
    termColors?: boolean
    colorLevel?: number
    depth?: number
    maxArrayLength?: number
    printHost?: boolean
    timeStamps?: boolean
    stampsFormat?: string
    stampsTimeZone?: string
}
