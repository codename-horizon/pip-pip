import { Server } from "../server"
import { generateId } from "../../common"
import { EventEmitter } from "../../common/events"
import { PacketManagerSerializerMap, ServerPacketManagerEventMap } from "../packets/manager"
import { ServerSerializerMap } from "../packets/server"
import { Connection } from "../connection"
import { LobbyJSON } from "../api/types"
import { LobbyEventMap } from "../server/events"

export type LobbyInitializer<
    T extends PacketManagerSerializerMap,
    R extends Record<string, any> = Record<string, any>,
    P extends Record<string, any> = Record<string, any>,
> = (arg: {
    lobby: Lobby<T, R, P>,
    server: Server<T, R, P>,
}) => void

export type LobbyTypeOptions = {
    maxInstances: number,
    maxConnections: number,
    userCreatable: boolean,
}

export type LobbyType<
    T extends PacketManagerSerializerMap,
    R extends Record<string, any> = Record<string, any>,
    P extends Record<string, any> = Record<string, any>,
> = {
    options: LobbyTypeOptions,
    initializer: LobbyInitializer<T, R, P>,
}

export enum LobbyStatus {
    IDLE = 0,
    ACTIVE = 1,
    DESTROYED = 2,
}

export class Lobby<
    T extends PacketManagerSerializerMap,
    R extends Record<string, any> = Record<string, any>,
    P extends Record<string, any> = Record<string, any>,
>{
    id = generateId(8)
    type: string

    events: EventEmitter<LobbyEventMap<T, R, P>> = new EventEmitter("Lobby")

    server: Server<T, R, P>
    connections: Record<string, Connection<T, R, P>> = {}

    locals = {} as P

    packets: {
        events: EventEmitter<ServerPacketManagerEventMap<T & ServerSerializerMap>>
    }

    idleTimeout?: NodeJS.Timeout
    destroyed = false

    constructor(server: Server<T, R, P>, type: string){
        this.type = type
        this.server = server
        this.packets = {
            events: new EventEmitter("LobbyPackets")
        }
        this.startIdle()
    }

    get status(){
        if(this.destroyed === true) return LobbyStatus.DESTROYED
        if(typeof this.idleTimeout !== "undefined") return LobbyStatus.IDLE
        return LobbyStatus.ACTIVE
    }

    addConnection(connection: Connection<T, R, P>){
        if(connection.id in this.connections) throw new Error(`Connection "${connection.id}" already in lobby ${this.id}.`)

        const connections = Object.values(this.connections)
        if(connections.length >= this.typeOptions.maxConnections) throw new Error("Max connections reached for lobby.")

        this.connections[connection.id] = connection
        connection.setLobby(this)
        this.events.emit("addConnection", { connection })
        this.stopIdle()
    }

    removeConnection(connection: Connection<T, R, P>){
        if(connection.id in this.connections){
            connection.removeLobby()
            delete this.connections[connection.id]
            this.events.emit("removeConnection", { connection })

            const connections = Object.values(this.connections)
            if(connections.length === 0){
                this.startIdle()
            }
        }
    }

    startIdle(){
        this.stopIdle()
        this.idleTimeout = setTimeout(() => {
            this.destroy()
        }, this.server.options.lobbyIdleLifespan)
        this.events.emit("idleStart")
        this.events.emit("statusChange", { status: this.status })
    }

    stopIdle(){
        if(typeof this.idleTimeout === "undefined") return
        clearTimeout(this.idleTimeout)
        this.idleTimeout = undefined
        this.events.emit("idleEnd")
        this.events.emit("statusChange", { status: this.status })
    }

    destroy(){
        if(this.destroyed === false){
            this.destroyed = true
            // TODO: remove from lobby
            // TODO: remove all connections
            this.server.removeLobby(this)
            this.events.emit("destroy")
            // TODO: Imrpove status change calls
            this.events.emit("statusChange", { status: this.status })
        }
    }

    get typeOptions(){
        return this.server.lobbyType[this.type].options
    }

    toJson(): LobbyJSON{
        const output: LobbyJSON = {
            lobbyId: this.id,
            lobbyType: this.type,
            connections: Object.keys(this.connections).length,
            maxConnections: this.typeOptions.maxConnections,
            status: this.status,
        }

        return output
    }
}