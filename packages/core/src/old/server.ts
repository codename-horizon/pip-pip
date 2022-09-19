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
    socketMessage: { ws: WebSocket, data: string, connection?: ServerCon, reconciled: boolean },

    auth: { connection: ServerConnection },
    lobbyCreate: { lobby: ServerLobby }

    connectionDestroy: { connection: ServerConnection }
    connectionCreate: { connection: ServerConnection }
}

export type ServerConnectionEventMap = {
    idleStart: undefined,
    idleEnd: undefined,
    destroy: undefined,
    socketClose: undefined,
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

export enum ServerConnectionStatus {
    DISCONNECTED = 0,
    CONNECTING = 1,
    CONNECTED_AND_RECONCILING = 2,
    READY = 2,

}