import { PIXIGraphics } from "@pip-pip/core/src/client"
import { PipPipGame } from "@pip-pip/game"
import * as PIXI from "pixi.js"
import ship1 from "../assets/ship-1.png"

export type PlayerGraphic = {
    id: string,
    object: PIXI.DisplayObject,
    inStage: false,
}

// set this before the loader
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST
const ship = PIXI.Texture.from(ship1)

export class PipPipGameRenderer{
    graphics = new PIXIGraphics()
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
        const deltaTime = (1000 / deltaMs) / this.fps

        // check what players are new
        for(const gamePlayerId in this.game.players){
            if(!(gamePlayerId in this.players)){
                // create new player
                const object = new PIXI.Sprite(ship)
                object.scale.set(2)
                object.interactive = false
                object.anchor.set(0.5)
                object.cacheAsBitmap = false
                object.rotation = Math.random() * Math.PI * 2
                this.players[gamePlayerId] = {
                    id: gamePlayerId,
                    object,
                    inStage: false,
                }
                this.playersContainer.addChild(object)
            }
        }
        // check what players were removed
        // update players
        for(const playerId in this.players){
            const gamePlayer = this.game.players[playerId]
            const graphicPlayer = this.players[playerId]
            graphicPlayer.object.position.x = gamePlayer.physics.position.x
            graphicPlayer.object.position.y = gamePlayer.physics.position.y

            if(playerId === "single"){
                this.playersContainer.position.x = this.graphics.app.view.width / 2 - gamePlayer.physics.position.x
                this.playersContainer.position.y = this.graphics.app.view.height / 2 - gamePlayer.physics.position.y
            }
        }

        this.graphics.app.render()
    }
}