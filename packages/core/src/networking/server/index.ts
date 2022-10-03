import { generateId } from "../../common"
import { EventEmitter } from "../../common/events"
import { PacketManager, PacketManagerSerializerMap, ServerPacketManagerEventMap } from "../packets/manager"
import { Packet } from "../packets/packet"
import { ServerSerializerMap } from "../packets/server"
import { Connection } from "./connection"
import { ServerEventMap } from "./events"
import { Lobby, LobbyInitializer, LobbyOptions, LobbyType } from "./lobby"

export type ServerOptions = {
    port: number,
}

export class Server<
    T extends PacketManagerSerializerMap,
    R extends Record<string, any> = Record<string, any>,
    P extends Record<string, any> = Record<string, any>,
>{
    options: ServerOptions = {
        port: 3000,
    }

    events: EventEmitter<ServerEventMap> = new EventEmitter()

    connections: Record<string, Connection<T, R, P>> = {}
    lobbies: Record<string, Lobby<T, R, P>> = {}

    lobbyType: Record<string, LobbyType<T, R, P>> = {}

    packets: {
        manager: PacketManager<T>,
        events: EventEmitter<ServerPacketManagerEventMap<T & ServerSerializerMap>>
    }

    constructor(packetManager: PacketManager<T>){
        this.packets = {
            manager: packetManager,
            events: new EventEmitter(),
        }
    }

    setOptions(options: Partial<ServerOptions> = {}){
        this.options = {
            ...this.options,
            ...options,
        }
    }

    registerLobby(type: string, options: LobbyOptions, initializer: LobbyInitializer<T>){
        if(type in this.lobbyType) throw new Error(`Lobby Type "${type}" already registered in server.`)
        this.lobbyType[type] = {
            options,
            initializer,
        }
    }

    createLobby<K extends keyof typeof this.lobbyType>(type: K, id?: string){
        if(!(type in this.lobbyType)) throw new Error(`Lobby type "${type}" does not exist.`)
        const lobbyType = this.lobbyType[type]
        const lobby = new Lobby(this, lobbyType.options)
        lobbyType.initializer({
            lobby,
            server: this,
        })
        if(typeof id === "string") lobby.id = id
        this.lobbies[lobby.id] = lobby
    }
}