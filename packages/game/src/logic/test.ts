import { PixiGraphics, PointPhysicsObject, PointPhysicsWorld, Ticker } from "@pip-pip/core/src/client"
import * as PIXI from "pixi.js"

export interface GamePhysicsObject{
    physics: PointPhysicsObject
}

export type GameDrawableThing = PIXI.Sprite

export interface GameDrawable{
    getDrawable: () => GameDrawableThing
    render: (deltaMs: number, drawable: GameDrawableThing) => void,
}

export class Ship implements GameDrawable, GamePhysicsObject{
    physics: PointPhysicsObject

    constructor(){
        this.physics = new PointPhysicsObject()
    }

    getDrawable(){
        return new PIXI.Sprite()
    }

    render(){
        //
    }
}

export class Player{
    id: string

    physics: PointPhysicsObject = new PointPhysicsObject()

    constructor(id: string){
        this.id = id
    }
}

export class PipPipGame{
    players: Record<string, Player> = {}

    physics: PointPhysicsWorld = new PointPhysicsWorld()
    graphics: PixiGraphics = new PixiGraphics()

    gameMode = 0
    isWaitingLobby = true

    dataTicker = new Ticker(20)
    updateTicker = new Ticker(60)
    renderTicker = new Ticker(60)

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