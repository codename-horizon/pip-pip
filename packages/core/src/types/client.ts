export type ConnectionOptions = {
    tcpProtocol: string,
    udpProtocol: string,
    host: string,
    port: number,
    baseRoute: string,
}

export interface Packet<T = unknown>{
    code: string,
    encode: (value: T) => string,
    decode: (value: string) => T,
}

export type LiteralPacketType = string | number | boolean


export type EventMap = Record<string, any>
export type EventKey<T extends EventMap> = string & keyof T
export type EventCallback<T> = (params: T) => void

export type Flatten<T> = T extends Record<string, any> ? { [k in keyof T] : T[k] } : never

export type PacketDecoded = {
    id: string, code: string, value: unknown,
}

export type OptionalIfUndefined<T> = undefined extends T ? [param?: T] : [param: T]

