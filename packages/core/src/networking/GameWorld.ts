import { GameServerConnection } from "./GameServerConnection"
import { GameStateData } from "./GameStateData"

export type GameWorldOptions = {
    maxConnections: number,
}

export type GameState = Record<string, GameStateData<any>>

export class GameWorld{
    connections: GameServerConnection[]
    options: GameWorldOptions
    state: GameState

    constructor(options: Partial<GameWorldOptions> = {}){
        this.options = {
            maxConnections: 16,
            ...options,
        }
        this.connections = []
        this.state = {}
    }
}