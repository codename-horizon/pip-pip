import { Client, PIXIGraphics, radianDifference } from "@pip-pip/core/src/client"
import { PipPipGame } from "@pip-pip/game"
import * as PIXI from "pixi.js"
import ship1 from "../assets/ship-1.png"

export type PlayerGraphic = {
    id: string,
    object: PIXI.DisplayObject,
    inStage: false,
    x: number, y: number,
    rotation: number,
}

export type BulletGrapic = {
    id: string,
    object: PIXI.DisplayObject,
    x: number, y: number,
    rotation: number,
}

// set this before the loader
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST
const ship = PIXI.Texture.from(ship1)

export class PipPipGameRenderer{
    client!: Client
    graphics = new PIXIGraphics()
    smoothing = {
        playerMovement: 10,
        playerAim: 5,
        bulletMovement: 4,
        bulletRotation: 4,
    }
    players: Record<string, PlayerGraphic> = {}
    bullets: Record<string, BulletGrapic> = {}
    game!: PipPipGame

    playersContainer = new PIXI.Container()

    fps = 60

    constructor(){
        
    }

    setup(){
        this.graphics.app.stage.addChild(this.playersContainer)
    }

    setGame(game: PipPipGame){
        this.game = game
    }

    setClient(client: Client){
        this.client = client
    }

    render(deltaMs: number){
        const now = Date.now()
        const gameDeltaMs = now - this.game.physics.lastUpdate
        const gameDeltaTime = gameDeltaMs / (1000 / this.game.physics.options.baseTps)
        const deltaTime = deltaMs / (1000 / this.fps)
        
        const playerMovementSmoothing = Math.pow(1 / this.smoothing.playerMovement, deltaTime)
        const playerAimSmoothing = Math.pow(1 / this.smoothing.playerAim, deltaTime)
        const bulletMovementSmoothing = Math.pow(1 / this.smoothing.bulletMovement, deltaTime)
        const bulletRotationSmoothing = Math.pow(1 / this.smoothing.bulletRotation, deltaTime)


        //// PLAYERS
        // check what players are new
        for(const gamePlayerId in this.game.players){
            if(!(gamePlayerId in this.players)){
                // create new player
                const object = new PIXI.Sprite(ship)
                const palyer = this.game.players[gamePlayerId]
                object.scale.set(palyer.physics.mass / 100 * 2)
                object.interactive = false
                object.anchor.set(0.5)
                this.players[gamePlayerId] = {
                    id: gamePlayerId,
                    object,
                    inStage: false,
                    x: palyer.physics.position.x,
                    y: palyer.physics.position.y,
                    rotation: palyer.aimRotation,
                }
                this.playersContainer.addChild(object)
            }
        }
        // check what players were removed
        for(const playerId in this.players){
            const gamePlayer = this.game.players[playerId]
            const graphicPlayer = this.players[playerId]
            if(typeof gamePlayer === "undefined"){
                this.playersContainer.removeChild(graphicPlayer.object)
                delete this.players[playerId]
            }
        }
        // update players
        for(const playerId in this.players){
            const gamePlayer = this.game.players[playerId]
            const graphicPlayer = this.players[playerId]
            const tx = gamePlayer.physics.position.x + gamePlayer.physics.velocity.x * gameDeltaTime
            const ty = gamePlayer.physics.position.y + gamePlayer.physics.velocity.y * gameDeltaTime
            
            graphicPlayer.x += (tx - graphicPlayer.x) * playerMovementSmoothing
            graphicPlayer.y += (ty - graphicPlayer.y) * playerMovementSmoothing

            graphicPlayer.object.position.x = graphicPlayer.x
            graphicPlayer.object.position.y = graphicPlayer.y

            graphicPlayer.rotation += radianDifference(graphicPlayer.rotation, gamePlayer.aimRotation + Math.PI / 2) * playerAimSmoothing

            graphicPlayer.object.rotation = graphicPlayer.rotation

            if(playerId === this.client.connectionId){
                this.playersContainer.position.x = this.graphics.app.view.width / 2 - graphicPlayer.x
                this.playersContainer.position.y = this.graphics.app.view.height / 2 - graphicPlayer.y
            }
        }

        
        /// BULLETs
        // create bullets
        for(const gameBulletId in this.game.bullets){
            if(!(gameBulletId in this.bullets)){
                const object = new PIXI.Sprite(ship)
                const bullet = this.game.bullets[gameBulletId]
                object.scale.set(0.5)
                object.interactive = false
                object.anchor.set(0.5)
                this.bullets[gameBulletId] = {
                    id: gameBulletId,
                    object,
                    x: bullet.physics.position.x,
                    y: bullet.physics.position.y,
                    rotation: bullet.rotation,
                }
                this.playersContainer.addChild(object)
            }
        }
        // delete bullets
        for(const graphicBulletId in this.bullets){
            if(!(graphicBulletId in this.game.bullets)){
                this.playersContainer.removeChild(this.bullets[graphicBulletId].object)
                delete this.bullets[graphicBulletId]
            }
        }
        // update bullets
        for(const bulletId in this.bullets){
            const gameBullet = this.game.bullets[bulletId]
            const graphicBullet = this.bullets[bulletId]

            graphicBullet.x += (gameBullet.physics.position.x - graphicBullet.x) * bulletMovementSmoothing
            graphicBullet.y += (gameBullet.physics.position.y - graphicBullet.y) * bulletMovementSmoothing
            graphicBullet.rotation += radianDifference(gameBullet.rotation, graphicBullet.rotation) * bulletRotationSmoothing

            graphicBullet.object.position.x = graphicBullet.x
            graphicBullet.object.position.y = graphicBullet.y
        }

        this.graphics.app.render()
    }
}