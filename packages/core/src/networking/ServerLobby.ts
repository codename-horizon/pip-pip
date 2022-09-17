import { LobbyDiscoveryMode } from "../lib/constants"
import { generateId } from "../lib/utils"
import { EventMap } from "../types/client"
import { ServerEventMap, ServerPacketEventMap } from "../types/server"
import { ServerConnection } from "./ServerConnection"
import { EventEmitter } from "./Events"
import { PacketMap } from "../types/packets"

export class ServerLobby<
    PM extends PacketMap = PacketMap,
    EM extends EventMap = Record<string, never>,
>{
    id: string
    locked = false
    birth: Date
    maxConnections = 32
    discoveryMode: LobbyDiscoveryMode = LobbyDiscoveryMode.PRIVATE
    
    connections: ServerConnection[] = []
    
    packetEvents: EventEmitter<ServerPacketEventMap<PM>> = new EventEmitter()
    serverEvents: EventEmitter<ServerEventMap> = new EventEmitter()
    customEvents: EventEmitter<EM> = new EventEmitter()

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