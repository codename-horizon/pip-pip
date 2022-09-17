import { WebSocket } from "ws"
import { generateId } from "../lib/utils"
import { HorizonEventMap, PacketDefinitions } from "../types/client"
import { ServerEventMap, ServerPacketEventMap } from "../types/server"
import { HorizonEventEmitter } from "./Events"

export class Connection<
    PublicState = Record<string, unknown>, 
    PrivateState = Record<string, unknown>,
    PacketDefs extends PacketDefinitions = PacketDefinitions,
    CustomEventMap extends HorizonEventMap = Record<string, never>,
>{
    token: string
    publicState!: PublicState
    privateState!: PrivateState
    ws?: WebSocket

    packetEvents: HorizonEventEmitter<ServerPacketEventMap<PacketDefs>> = new HorizonEventEmitter()
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

    toJSON(){
        return {
            token: this.token,
            state: this.publicState,
        }
    }
}