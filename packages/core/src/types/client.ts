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