import { Connection, ConnectionStatus } from "../connection"
import { PacketManagerSerializerMap } from "../packets/manager"

export type ServerEventMap<
    T extends PacketManagerSerializerMap,
    R extends Record<string, any> = Record<string, any>,
    P extends Record<string, any> = Record<string, any>,
> = {
    start: undefined,

    addConnection: { connection: Connection<T, R, P> },
    removeConnection: { connection: Connection<T, R, P> },
}

export type ConnectionEventMap<
    T extends PacketManagerSerializerMap,
    R extends Record<string, any> = Record<string, any>,
    P extends Record<string, any> = Record<string, any>,
> = {
    idleStart: undefined,
    idleEnd: undefined,

    statusChange: { status: ConnectionStatus },

    destroy: undefined,
}

export type LobbyEventMap<
    T extends PacketManagerSerializerMap,
    R extends Record<string, any> = Record<string, any>,
    P extends Record<string, any> = Record<string, any>,
> = {
    start: undefined,
}