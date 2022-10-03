import { Server } from "../server"
import { generateId } from "../../common"
import { EventEmitter } from "../../common/events"
import { PacketManagerSerializerMap, ServerPacketManagerEventMap } from "../packets/manager"
import { ServerSerializerMap } from "../packets/server"
import { Connection } from "../connection"

export type LobbyInitializer<
    T extends PacketManagerSerializerMap,
    R extends Record<string, any> = Record<string, any>,
    P extends Record<string, any> = Record<string, any>,
> = (arg: {
    lobby: Lobby<T, R, P>,
    server: Server<T, R, P>,
}) => void

export type LobbyOptions = {
    maxInstances: number,
    maxConnections: number,
    userCreatable: boolean,
    discoverable: boolean,
}

export type LobbyType<
    T extends PacketManagerSerializerMap,
    R extends Record<string, any> = Record<string, any>,
    P extends Record<string, any> = Record<string, any>,
> = {
    options: LobbyOptions,
    initializer: LobbyInitializer<T, R, P>,
}

export class Lobby<
    T extends PacketManagerSerializerMap,
    R extends Record<string, any> = Record<string, any>,
    P extends Record<string, any> = Record<string, any>,
>{
    id = generateId()
    options: LobbyOptions
    server: Server<T, R, P>
    connections: Record<string, Connection<T, R, P>> = {}

    locals = {} as P

    packets: {
        events: EventEmitter<ServerPacketManagerEventMap<T & ServerSerializerMap>>
    }

    constructor(server: Server<T, R, P>, options: LobbyOptions){
        this.options = options
        this.server = server
        this.packets = {
            events: new EventEmitter()
        }
    }
}