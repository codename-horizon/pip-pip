import { generateId, State, StateSchema } from "@pip-pip/core/src/common"
import { PickRecord, TypeOrFactoryType } from "@pip-pip/core/src/lib/types"

export type Vector2 = { x: 0, y: 0 }

export type PlayerData = {
    name: string,
    angle: number,
    position: Vector2,
    velocity: Vector2,
}

export class StateEater<
    T extends StateSchema = StateSchema, 
    K extends keyof PickRecord<T> = keyof PickRecord<T>, 
    V extends T[K] = T[K],
    S extends keyof V = keyof V,
    U extends V[S] = V[S]
>{
    eaterId: string
    eaterProp: K
    eaterState: State<T>
    eaterInitialState: U

    constructor(state: State<T>, prop: K, id: string, initialState: U){
        this.eaterId = id
        this.eaterProp = prop
        this.eaterState = state
        this.eaterInitialState = initialState

        this.eaterState.setRecord(prop, this.eaterId, initialState)
    }

    getState(): U{
        return this.eaterState.get(this.eaterProp)[this.eaterId]
    }

    setState(valueOrFactory: TypeOrFactoryType<U>){
        this.eaterState.setRecord(this.eaterProp, this.eaterId, valueOrFactory)
    }
    
    remove(){
        this.eaterState.deleteRecord(this.eaterProp, this.eaterId)
    }
}

export class Player extends StateEater<WorldSchema>{
    constructor(id: string, state: State<WorldSchema>){
        super(state, "players", id, {
            name: "Player",
            angle: 0,
            position: { x: 0, y: 0 },
            velocity: { x: 0, y: 0 },
        })
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
        this.state.events.on("change", console.log)
    }

    addNewPlayer(){
        const player = new Player(generateId(), this.state)
        this.players.push(player)
    }
}