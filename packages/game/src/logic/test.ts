import { PointPhysicsObject, PointPhysicsWorld } from "@pip-pip/core/src/client"
import * as PIXI from "pixi.js"

export class Ship{
    physics: PointPhysicsObject
    
    texture!: PIXI.Texture

    constructor(){
        this.physics = new PointPhysicsObject()
    }
}

export class Player{
    id: string

    physics: PointPhysicsObject = new PointPhysicsObject()

    constructor(id: string){
        this.id = id
        this.physics.collision.enabled = true
    }
}

export class PipPipGame{
    players: Record<string, Player> = {}

    physics: PointPhysicsWorld = new PointPhysicsWorld()

    gameMode = 0
    isWaitingLobby = true

    constructor(){
        //
    }

    setGameMode(mode: number){
        if(this.isWaitingLobby){
            this.gameMode = mode
        } else{
            throw new Error("Not in waiting lobby")
        }
    }

    addPlayer(player: Player){
        this.players[player.id] = player
        this.physics.addObject(player.physics)
    }

    removePlayer(player: Player){
        delete this.players[player.id]
        player.physics.destroy()
    }
}