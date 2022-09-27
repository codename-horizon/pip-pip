import { PixiGraphicsRenderer, PixiGraphicsDrawable, PointPhysicsObject, PointPhysicsWorld, Ticker } from "@pip-pip/core/src/client"
import * as PIXI from "pixi.js"

export class Ship{
    physics: PointPhysicsObject
    graphics: PixiGraphicsDrawable<{
        smoothing: number,
    }, {
        sprite: PIXI.Sprite,
        container: PIXI.Container,
    }>
    
    texture!: PIXI.Texture

    constructor(){
        this.physics = new PointPhysicsObject()
        this.graphics = new PixiGraphicsDrawable()

        this.graphics.setDisplayObject(({objects}) => {
            objects.sprite = new PIXI.Sprite()
            objects.container = new PIXI.Container()
            objects.container.addChild(objects.sprite)
            return objects.container
        })

        this.graphics.setRenderCallback(({displayObject}) => {
            displayObject.position.x = this.physics.position.x
            displayObject.position.y = this.physics.position.y
        })
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
    graphics: PixiGraphicsRenderer = new PixiGraphicsRenderer()

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