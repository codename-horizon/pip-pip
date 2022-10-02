import { EventEmitter } from "../../common"
import { PacketManager, PacketManagerSerializerMap, ServerPacketManagerEventMap } from "../packets/manager"
import { Packet } from "../packets/packet"
import { ServerSerializerMap } from "../packets/server"
import { Connection } from "./connection"
import { ServerEventMap } from "./events"
import { Lobby, LobbyInitializer, LobbyOptions, LobbyType } from "./lobby"

export type ServerOptions = {
    port: number,
}

export class Server<T extends PacketManagerSerializerMap>{
    options: ServerOptions = {
        port: 3000,
    }

    events: EventEmitter<ServerEventMap> = new EventEmitter()

    connections: Record<string, Connection<T>> = {}
    lobbies: Record<string, Lobby<T>> = {}

    lobbyType: Record<string, LobbyType<T>> = {}

    packets: {
        manager: PacketManager<T>,
        events: EventEmitter<ServerPacketManagerEventMap<T & ServerSerializerMap>>
    }

    constructor(packetManager: PacketManager<T>){
        this.packets = {
            manager: packetManager,
            events: new EventEmitter(),
        }

        this.connections.test = new Connection(this)
    }

    registerLobby(id: string, options: LobbyOptions, initializer: LobbyInitializer<T>){
        // double check if already registered
        this.lobbyType[id] = {
            options,
            initializer,
        }
    }
}