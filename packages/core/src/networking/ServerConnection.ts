import { WebSocket } from "ws"
import { generateId } from "../lib/utils"
import { EventMap } from "../types/client"
import { PacketMap } from "../types/packets"
import { ServerEventMap, ServerPacketEventMap } from "../types/server"
import { HorizonEventEmitter } from "./Events"

export class ServerConnection<
    PublicState = Record<string, unknown>, 
    PrivateState = Record<string, unknown>,
    PM extends PacketMap = PacketMap,
    CustomEventMap extends EventMap = Record<string, never>,
>{
    token: string
    publicState!: PublicState
    privateState!: PrivateState
    ws?: WebSocket

    packetEvents: HorizonEventEmitter<ServerPacketEventMap<PM>> = new HorizonEventEmitter()
    serverEvents: HorizonEventEmitter<ServerEventMap> = new HorizonEventEmitter()
    customEvents: HorizonEventEmitter<CustomEventMap> = new HorizonEventEmitter()

    constructor(){
        this.token = generateId()
        this.publicState = {} as PublicState
        this.privateState = {} as PrivateState
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