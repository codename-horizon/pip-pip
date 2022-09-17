import { BasePacket } from "../networking/Packets"

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

export type PacketDefinitions = Record<string, BasePacket>

export type LiteralPacketType = string | number | boolean


export type HorizonEventMap = Record<string, any>
export type HorizonEventKey<T extends HorizonEventMap> = string & keyof T
export type HorizonEventReceiver<T> = (params: T) => void

export type Flatten<T> = T extends Record<string, any> ? { [k in keyof T] : T[k] } : never
