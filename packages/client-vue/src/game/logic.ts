import { PointPhysicsObject } from "./physics"

export class GameEntity{
    physics?: PointPhysicsObject
}

export class Ship{
    physics: PointPhysicsObject

    constructor(){
        this.physics = new PointPhysicsObject()
    }
}

export class Player{
    id: string
    constructor(id: string){
        this.id = id
    }
}

export class PipPipGame{
    players: Player[] = []
    ships: Ship[] = []

    constructor(){

    }
}