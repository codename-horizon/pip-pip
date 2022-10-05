import WebSocket, { RawData } from "ws"

import { PacketManagerDecoded, PacketManagerSerializerMap } from "../packets/manager"
import { Connection, ConnectionStatus } from "../connection"
import { ServerSerializerMap } from "../packets/server"
import { Lobby, LobbyStatus } from "../lobby"

export type ServerEventMap<
    T extends PacketManagerSerializerMap,
    R extends Record<string, any> = Record<string, any>,
    P extends Record<string, any> = Record<string, any>,
> = {
    start: undefined,

    createConnection: { connection: Connection<T, R, P> },
    addConnection: { connection: Connection<T, R, P> },
    removeConnection: { connection: Connection<T, R, P> },

    createLobby: { lobby: Lobby<T, R, P> },
    removeLobby: { lobby: Lobby<T, R, P> },

    socketOpen: { ws: WebSocket },

    socketReady: { ws: WebSocket, connection: Connection<T, R, P> },

    socketMessage: { ws: WebSocket, data: RawData, connection?: Connection<T, R, P> },
    packetMessage: { 
        packets: PacketManagerDecoded<T & ServerSerializerMap>,
        ws: WebSocket, connection: Connection<T, R, P>,
    }

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
    packetMessage: { 
        packets: PacketManagerDecoded<T & ServerSerializerMap>,
        ws: WebSocket, connection: Connection<T, R, P>,
    }

    lobbyJoin: { lobby: Lobby<T, R, P> },
    lobbyLeave: { lobby: Lobby<T, R, P> },

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

    socketMessage: { data: RawData },
    packetMessage: { 
        packets: PacketManagerDecoded<T & ServerSerializerMap>,
        ws: WebSocket, connection: Connection<T, R, P>,
    }

    addConnection: { connection: Connection<T, R, P> },
    removeConnection: { connection: Connection<T, R, P> },

    destroy: undefined,
}