import { LobbyDiscoveryMode } from "../lib/constants"
import { generateId } from "../lib/utils"
import { HorizonEventMap, PacketDefinitions } from "../types/client"
import { ServerEventMap, ServerPacketEventMap } from "../types/server"
import { ServerConnection } from "./ServerConnection"
import { HorizonEventEmitter } from "./Events"

export class ServerLobby<
    PacketDefs extends PacketDefinitions = PacketDefinitions,
    CustomEventMap extends HorizonEventMap = Record<string, never>,
>{
    id: string
    locked = false
    birth: Date
    maxConnections = 32
    discoveryMode: LobbyDiscoveryMode = LobbyDiscoveryMode.PRIVATE
    
    connections: ServerConnection[] = []
    
    packetEvents: HorizonEventEmitter<ServerPacketEventMap<PacketDefs>> = new HorizonEventEmitter()
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