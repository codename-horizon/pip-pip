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
}

export class Lobby<
    T extends PacketManagerSerializerMap,
    R extends Record<string, any> = Record<string, any>,
    P extends Record<string, any> = Record<string, any>,
>{
    id = generateId(8)
    type: string

    events: EventEmitter<LobbyEventMap<T, R, P>> = new EventEmitter()

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
        if(typeof this.idleTimeout !== "undefined") return LobbyStatus.IDLE
        return LobbyStatus.ACTIVE
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
            // remove all connections
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