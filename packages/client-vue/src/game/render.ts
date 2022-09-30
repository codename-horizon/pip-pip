import { PIXIGraphics } from "@pip-pip/core/src/client"
import { PipPipGame } from "@pip-pip/game"
import * as PIXI from "pixi.js"
import ship1 from "../assets/ship-1.png"

export type PlayerGraphic = {
    id: string,
    object: PIXI.DisplayObject,
    inStage: false,
    x: number, y: number,
}

// set this before the loader
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST
const ship = PIXI.Texture.from(ship1)

export class PipPipGameRenderer{
    graphics = new PIXIGraphics()
    smoothing = {
        players: 10,
    }
    players: Record<string, PlayerGraphic> = {}
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

    render(deltaMs: number){
        const now = Date.now()
        const gameDeltaMs = now - this.game.physics.lastUpdate
        const gameDeltaTime = gameDeltaMs / (1000 / this.game.physics.options.baseTps)

        // check what players are new
        for(const gamePlayerId in this.game.players){
            if(!(gamePlayerId in this.players)){
                // create new player
                const object = new PIXI.Sprite(ship)
                const palyer = this.game.players[gamePlayerId]
                object.scale.set(palyer.physics.mass / 100 * 2)
                object.interactive = false
                object.anchor.set(0.5)
                object.cacheAsBitmap = false
                object.rotation = Math.random() * Math.PI * 2
                this.players[gamePlayerId] = {
                    id: gamePlayerId,
                    object,
                    inStage: false,
                    x: palyer.physics.position.x,
                    y: palyer.physics.position.y,
                }
                this.playersContainer.addChild(object)
            }
        }
        // check what players were removed
        // update players
        for(const playerId in this.players){
            const gamePlayer = this.game.players[playerId]
            const graphicPlayer = this.players[playerId]
            const tx = gamePlayer.physics.position.x + gamePlayer.physics.velocity.x * gameDeltaTime
            const ty = gamePlayer.physics.position.y + gamePlayer.physics.velocity.y * gameDeltaTime
            
            graphicPlayer.x += (tx - graphicPlayer.x) / this.smoothing.players
            graphicPlayer.y += (ty - graphicPlayer.y) / this.smoothing.players

            graphicPlayer.object.position.x = graphicPlayer.x
            graphicPlayer.object.position.y = graphicPlayer.y

            if(playerId === "single"){
                this.playersContainer.position.x = this.graphics.app.view.width / 2 - graphicPlayer.x
                this.playersContainer.position.y = this.graphics.app.view.height / 2 - graphicPlayer.y
            }
        }

        this.graphics.app.render()
    }
}