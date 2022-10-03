import { Server } from "../server"
import { EventEmitter } from "../../common/events"
import { PacketManagerSerializerMap, ServerPacketManagerEventMap } from "../packets/manager"
import { ServerSerializerMap } from "../packets/server"
import { ConnectionEventMap } from "../server/events"
import { Lobby } from "../lobby"
import { generateId } from "../../common"
import { ConnectionJSON } from "../api/types"
import WebSocket, { RawData } from "ws"
import { initializeWebSockets } from "./websockets"

export type ConnectionLatencyRecord = {
    amount: number,
    timestamp: ReturnType<typeof Date["now"]>,
}

/*
status
idling
connected
disconnected
timedout

*/

export enum ConnectionStatus {
    IDLE = 0,
    READY = 1,
    DESTROYED = 2,
}

export class Connection<
    T extends PacketManagerSerializerMap,
    R extends Record<string, any> = Record<string, any>,
    P extends Record<string, any> = Record<string, any>,
>{
    id = generateId(8)
    token = {
        connection: generateId(64),
        websocket: generateId(64),
    }

    server: Server<T, R, P>
    lobby?: Lobby<T, R, P>

    events: EventEmitter<ConnectionEventMap<T, R, P>> = new EventEmitter("Connection")

    locals = {} as R

    packets: {
        events: EventEmitter<ServerPacketManagerEventMap<T & ServerSerializerMap>>
    }

    latencyHistory: ConnectionLatencyRecord[] = []

    ws?: WebSocket

    idleTimeout?: NodeJS.Timeout

    destroyed = false

    constructor(server: Server<T, R, P>){
        this.server = server
        this.packets = {
            events: new EventEmitter("ConnectionPackets")
        }
        this.startIdle()
        initializeWebSockets(this)
    }

    get latency(): ConnectionLatencyRecord{
        if(0 in this.latencyHistory){
            return this.latencyHistory[0]
        }
        return {
            amount: 0,
            timestamp: Date.now(),
        }
    }

    get status(): ConnectionStatus{
        if(this.destroyed) return ConnectionStatus.DESTROYED
        if(typeof this.ws !== undefined) return ConnectionStatus.READY
        return ConnectionStatus.IDLE
    }

    get isIdle(){ return this.status === ConnectionStatus.IDLE }
    get isReady(){ return this.status === ConnectionStatus.READY }
    get isDestroyed(){ return this.status === ConnectionStatus.DESTROYED }

    startIdle(){
        this.stopIdle()
        this.idleTimeout = setTimeout(() => {
            this.destroy()
        }, this.server.options.connectionIdleLifespan)
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
            this.removeWebSocket()
            this.server.removeConnection(this)
            this.events.emit("destroy")
            // TODO: Imrpove status change calls
            this.events.emit("statusChange", { status: this.status })
        }
    }

    setLobby(lobby: Lobby<T, R, P>){
        this.lobby = lobby
    }

    toJson(showSensitive = false){
        const output: ConnectionJSON = {
            connectionId: this.id
        }

        if(showSensitive){
            output.connectionToken = this.token.connection
            output.websocketToken = this.token.websocket
        }

        return output
    }
}

export interface Connection<
    T extends PacketManagerSerializerMap,
    R extends Record<string, any> = Record<string, any>,
    P extends Record<string, any> = Record<string, any>,
>{
    setWebSocket: (ws: WebSocket) => void
    removeWebSocket: () => void
    send: (data: string | ArrayBuffer) => void
}