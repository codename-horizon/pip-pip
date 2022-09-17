import { WebSocket } from "ws"
import { ServerConnection } from "../networking/ServerConnection"
import { defaultServerPackets } from "../networking/Packets"
import { Flatten, PacketDecoded, PacketDefinitions } from "./client"
import { ServerLobby } from "../networking/ServerLobby"

export type ServerOptions = {
    baseRoute: string,
    port: number,
    maxLobbies: number,
    maxConnections: number,
}

export type ServerEventMap<ServerCon extends ServerConnection = ServerConnection> = {
    start: undefined,

    socketConnect: { ws: WebSocket },
    socketConnectionReconciled: { ws: WebSocket, connection: ServerCon},
    socketClose: undefined,
    socketMessage: { ws: WebSocket, data: string, connection: ServerCon },

    auth: { connection: ServerConnection },
    lobbyCreate: { lobby: ServerLobby }
}

export type ConnectionEventMap = {
    socketMessage: { ws: WebSocket, data: string, connection: ServerConnection },
    reconciled: undefined,
    socketClose: undefined,
}

export type ServerLobbyEventMap = {
    start: undefined,
}

export type DefaultServerPacketEventMap = typeof defaultServerPackets

export type ServerPacketEventMap<
    PacketDefs extends PacketDefinitions, 
    AllDefs extends PacketDefinitions = Flatten<PacketDefs & DefaultServerPacketEventMap>> = {
    [eventName in keyof AllDefs]: {
        group: PacketDecoded[],
        value: ReturnType<AllDefs[eventName]["decode"]>,
        ws: WebSocket,
        connection: ServerConnection,
    }
}