import { WebSocket } from "ws"
import { generateId } from "../lib/utils"
import { EventMap } from "../types/client"
import { PacketMap } from "../types/packets"
import { ServerConnectionEventMap, ServerEventMap, ServerPacketEventMap } from "../types/server"
import { EventEmitter } from "./Events"
import { Server } from "./Server"
import { ServerLobby } from "./ServerLobby"

export class ServerConnection<
    PU = Record<string, any>, 
    PR = Record<string, any>,
    PM extends PacketMap = PacketMap,
    EM extends EventMap = Record<string, never>,
>{
    id: string
    token: string
    publicState!: PU
    privateState!: PR
    ws?: WebSocket

    packetEvents: EventEmitter<ServerPacketEventMap<PM>> = new EventEmitter("SERVER_CONNECTION_PACKET_EVENTS")
    connectionEvents: EventEmitter<ServerConnectionEventMap> = new EventEmitter("SERVER_CONNECTION_EVENTS")
    customEvents: EventEmitter<EM> = new EventEmitter("SERVER_CONNECTION_CUSTOM_EVENTS")

    lobby?: ServerLobby

    // idleLifespan = 10 * 60 * 1000 // 10 minutes
    idleLifespan = 5000
    idleTimeout?: NodeJS.Timeout
    idleForTooLong = false

    constructor(){
        this.id = generateId()
        this.token = generateId()
        this.publicState = {} as PU
        this.privateState = {} as PR

        this.beginIdleTimer()
    }
    
    destory(){
        this.idleForTooLong = true
        this.packetEvents.reset()
        this.connectionEvents.reset()
        this.customEvents.reset()
        if(typeof this.ws !== "undefined"){
            this.ws.close()
        }
    }

    stopIdleTimer(){
        if(typeof this.idleTimeout !== "undefined"){
            this.connectionEvents.emit("idleEnd")
            clearTimeout(this.idleTimeout)
            this.idleTimeout = undefined
        }
    }

    beginIdleTimer(){
        this.stopIdleTimer()
        this.connectionEvents.emit("idleStart")
        this.idleTimeout = setTimeout(() => {
            this.connectionEvents.emit("destroy")
            this.destory()
        }, this.idleLifespan)
    }

    get isConnected(){
        if(typeof this.ws === "undefined") return false
        if(this.ws.readyState === this.ws.CLOSED) return false
        return true
    }

    setWebSocket(ws?: WebSocket){
        if(typeof this.ws !== "undefined"){
            this.ws.close()
        }
        this.ws = ws
        if(typeof this.ws === "undefined"){
            this.beginIdleTimer()
        } else{
            this.stopIdleTimer()
            this.ws.on("close", () => {
                this.connectionEvents.emit("socketClose")
                this.setWebSocket()
            })
        }
    }

    send(data: string){
        if(this.isConnected){
            this.ws?.send(data)
        }
    }

    toJSON(){
        return {
            token: this.token,
            state: this.publicState,
        }
    }
}