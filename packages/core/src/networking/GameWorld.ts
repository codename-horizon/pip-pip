import { GameServerConnection } from "./GameServerConnection"
import { GameStateData } from "./GameStateData"

export type GameWorldOptions = {
    maxConnections: number,
}

export class GameWorld<GameState = Record<string, GameStateData<unknown>>>{
    connections: GameServerConnection[] = []
    options: GameWorldOptions
    state!: GameState

    constructor(options: Partial<GameWorldOptions> = {}){
        this.options = {
            maxConnections: 32,
            ...options,
        }
        this.connections = []
    }

    setGameState(gameState: GameState){
        this.state = gameState
    }

    getSerializedState(){
        const serializedState = {} as Record<keyof GameState, string>
        for(const key in this.state){
            serializedState[key] = (this.state[key] as GameStateData<unknown>).getSerialized()
        }
        return serializedState
    }
}