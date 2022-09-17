import { WebSocket } from "ws"
import { Connection } from "../networking/Connection"
import { defaultServerPackets } from "../networking/Packets"
import { Flatten, PacketDecoded, PacketDefinitions } from "./client"

export type ServerOptions = {
    baseRoute: string,
    port: number,
    maxLobbies: number,
    maxConnections: number,
}

export type ServerEventMap = {
    start: undefined,
    connect: { ws: WebSocket },
    connectionReconciled: undefined,
}

export type DefaultServerPacketEventMap = typeof defaultServerPackets

export type ServerPacketEventMap<
    PacketDefs extends PacketDefinitions, 
    AllDefs extends PacketDefinitions = Flatten<PacketDefs & DefaultServerPacketEventMap>> = {
    [eventName in keyof AllDefs]: {
        group: PacketDecoded[],
        value: ReturnType<AllDefs[eventName]["decode"]>,
        ws: WebSocket,
        connection: Connection,
    }
}