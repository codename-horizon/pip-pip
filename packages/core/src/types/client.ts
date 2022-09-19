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

export type ConnectionManagerEventMap = {
    "beforeAuth": undefined,
    "afterAuth": undefined,
    
    "authStateChange": undefined,
    "authenticate": undefined,
    "logout": undefined,

    "loading": boolean,

    "socketMessage": { data: string },
    "socketClose": undefined,
    "socketConnecting": undefined,
    "socketConnected": undefined,
    "socketReconciling": boolean,
    "socketReconciled": undefined,
    "socketReady": undefined,
}

export type OptionalIfUndefined<T> = undefined extends T ? [param?: T] : [param: T]

export enum ConnectionStatus {
    CONNECTING = 0,
    CONNECTED = 1,
    
    AUTHENTICATING = 2,
    AUTHENTICATED = 3,
    
    RECONCILING = 4,
    RECONCILED = 5,

    
}