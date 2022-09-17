import { WebSocket } from "ws"
import { Connection } from "../networking/Connection"
import { defaultServerPackets } from "../networking/Packets"
import { PacketDefinitions } from "./client"

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

export type ServerPacketEventMap<PacketDefs extends PacketDefinitions> = {
    [eventName in keyof PacketDefs]: {
        value: ReturnType<PacketDefs[eventName]["decode"]>,
        ws: WebSocket,
        connection: Connection,
    }
}

type Test = ServerPacketEventMap<typeof defaultServerPackets>