import { Connection, ConnectionStatus } from "../connection"
import { PacketManagerSerializerMap } from "../packets/manager"
import WebSocket, { RawData } from "ws"
import { Lobby, LobbyStatus } from "../lobby"

export type ServerEventMap<
    T extends PacketManagerSerializerMap,
    R extends Record<string, any> = Record<string, any>,
    P extends Record<string, any> = Record<string, any>,
> = {
    start: undefined,

    addConnection: { connection: Connection<T, R, P> },
    removeConnection: { connection: Connection<T, R, P> },

    createLobby: { lobby: Lobby<T, R, P> },
    removeLobby: { lobby: Lobby<T, R, P> },

    socketOpen: { ws: WebSocket },

    socketMessage: { ws: WebSocket, data: RawData, connection?: Connection<T, R, P> },
    socketReady: { ws: WebSocket, connection: Connection<T, R, P> },

    socketError: { ws: WebSocket, error: Error }

    socketClose: { ws: WebSocket, connection: Connection<T, R, P> },
    socketVerifyFail: { ws: WebSocket },
}

export type ConnectionEventMap<
    T extends PacketManagerSerializerMap,
    R extends Record<string, any> = Record<string, any>,
    P extends Record<string, any> = Record<string, any>,
> = {
    idleStart: undefined,
    idleEnd: undefined,

    statusChange: { status: ConnectionStatus },

    socketClose: undefined,
    socketMessage: { data: RawData },

    destroy: undefined,
}

export type LobbyEventMap<
    T extends PacketManagerSerializerMap,
    R extends Record<string, any> = Record<string, any>,
    P extends Record<string, any> = Record<string, any>,
> = {
    idleStart: undefined,
    idleEnd: undefined,

    statusChange: { status: LobbyStatus },

    destroy: undefined,
}