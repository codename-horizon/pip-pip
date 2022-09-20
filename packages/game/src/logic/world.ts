import { generateId, State, StateRecordSubscriber } from "@pip-pip/core/src/common"

export type Vector2 = { x: 0, y: 0 }

export type PlayerData = {
    name: string,
    angle: number,
    position: Vector2,
    velocity: Vector2,
}

export class Player extends StateRecordSubscriber<WorldSchema>{
    constructor(id: string, state: State<WorldSchema>){
        super(state, "players", id, {
            name: "Player",
            angle: 0,
            position: { x: 0, y: 0 },
            velocity: { x: 0, y: 0 },
        })
    }

    update(){
        
    }
}



export type WorldSchema = {
    gameMode: string,
    mapId: string | null,
    players: Record<string, PlayerData>,
}

const getInitialWorldState = (): WorldSchema => ({
    gameMode: "lobby",
    mapId: null,
    players: {},
})

export class World{
    state: State<WorldSchema>

    players: Player[] = []

    constructor(){
        this.state = new State(getInitialWorldState())
        this.state.events.on("flush", console.log)
    }

    addNewPlayer(){
        const player = new Player(generateId(), this.state)
        this.players.push(player)
    }
}