import { WebSocket } from "ws"
import { generateId } from "../lib/utils"
import { EventMap } from "../types/client"
import { PacketMap } from "../types/packets"
import { ServerEventMap, ServerPacketEventMap } from "../types/server"
import { EventEmitter } from "./Events"

export class ServerConnection<
    PU = Record<string, unknown>, 
    PR = Record<string, unknown>,
    PM extends PacketMap = PacketMap,
    EM extends EventMap = Record<string, never>,
>{
    token: string
    publicState!: PU
    privateState!: PR
    ws?: WebSocket

    packetEvents: EventEmitter<ServerPacketEventMap<PM>> = new EventEmitter()
    serverEvents: EventEmitter<ServerEventMap> = new EventEmitter()
    customEvents: EventEmitter<EM> = new EventEmitter()

    constructor(){
        this.token = generateId()
        this.publicState = {} as PU
        this.privateState = {} as PR
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
        if(typeof this.ws === "undefined") return
        console.log(`WS set for ${this.token}`)
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