import { LobbyDiscoveryMode } from "../lib/constants"
import { generateId } from "../lib/utils"
import { EventMap } from "../types/client"
import { ServerEventMap, ServerPacketEventMap } from "../types/server"
import { ServerConnection } from "./ServerConnection"
import { HorizonEventEmitter } from "./Events"
import { PacketMap } from "../types/packets"

export class ServerLobby<
    PM extends PacketMap = PacketMap,
    CustomEventMap extends EventMap = Record<string, never>,
>{
    id: string
    locked = false
    birth: Date
    maxConnections = 32
    discoveryMode: LobbyDiscoveryMode = LobbyDiscoveryMode.PRIVATE
    
    connections: ServerConnection[] = []
    
    packetEvents: HorizonEventEmitter<ServerPacketEventMap<PM>> = new HorizonEventEmitter()
    serverEvents: HorizonEventEmitter<ServerEventMap> = new HorizonEventEmitter()
    customEvents: HorizonEventEmitter<CustomEventMap> = new HorizonEventEmitter()

    constructor(){
        this.id = generateId()
        this.birth = new Date()
    }

    toJSON(){
        return {
            id: this.id,
            locked: this.locked,
            birth: this.birth.toISOString(),
            maxConnections: this.maxConnections,
            discoveryMode: this.discoveryMode,
        }
    }
}