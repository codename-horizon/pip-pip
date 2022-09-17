import { WebSocket } from "ws"
import { ServerConnection } from "../networking/ServerConnection"
import { PacketDecoded } from "./client"
import { ServerLobby } from "../networking/ServerLobby"
import { InternalPacketMap, PacketMap } from "./packets"
import { EventEmitter } from "../networking/Events"

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

export type ServerPacketEventFormat<T extends PacketMap> = {
    [K in keyof T]: {
        group: PacketDecoded[],
        value: ReturnType<T[K]["decode"]>,
        ws: WebSocket,
        connection: ServerConnection,
    }
}

export type ServerPacketEventMap<T extends PacketMap> = ServerPacketEventFormat<T & InternalPacketMap>
export type InternalServerPacketEventMap = ServerPacketEventFormat<InternalPacketMap>
export type InternalServerPacketEventEmitter = EventEmitter<InternalServerPacketEventMap>