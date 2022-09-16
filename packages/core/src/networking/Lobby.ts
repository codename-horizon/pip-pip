import { LobbyDiscoveryMode } from "../lib/constants"
import { generateId } from "../lib/utils"
import { Connection } from "./Connection"

export class Lobby{
    id: string
    locked = false
    birth: Date
    maxConnections = 32
    discoveryMode: LobbyDiscoveryMode = LobbyDiscoveryMode.PRIVATE
    
    connections: Connection[] = []

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