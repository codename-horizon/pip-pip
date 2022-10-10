import { PipPipGame } from "@pip-pip/game/src/logic"
import { PipPlayer } from "@pip-pip/game/src/logic/player"
import { PIP_SHIPS } from "@pip-pip/game/src/logic/ship"
import * as PIXI from "pixi.js"
import { GameContext } from "."
import { assetLoader } from "./assets"

export class PlayerGraphic {
    id: string
    player: PipPlayer

    container: PIXI.Container = new PIXI.Container()
    
    shipContainer: PIXI.Container = new PIXI.Container()
    shipSprite?: PIXI.Sprite

    constructor(player: PipPlayer){
        this.id = player.id
        this.player = player

        this.container.addChild(this.shipContainer)
    }

    updateShip(){
        if(typeof this.shipSprite !== "undefined"){
            this.shipContainer.removeChild(this.shipSprite)
        }
        const PlayerShip = PIP_SHIPS[this.player.shipIndex]
        const texture = assetLoader.get(PlayerShip.shipTextureId)
        this.shipSprite = new PIXI.Sprite(texture)
        this.shipSprite.anchor.set(0.5)
        this.shipSprite.position.set(0)
        this.shipSprite.scale.set(2)
        this.shipContainer.addChild(this.shipSprite)
    }
}

export class PipPipRenderer{
    app: PIXI.Application
    game: PipPipGame

    viewportContainer = new PIXI.Container()
    playersContainer = new PIXI.Container()

    players: Record<string, PlayerGraphic> = {}

    container?: HTMLDivElement

    constructor(game: PipPipGame){
        this.app = new PIXI.Application({ resizeTo: window })
        this.app.ticker.stop()

        this.app.stage.addChild(this.viewportContainer)
        this.viewportContainer.addChild(this.playersContainer)

        this.game = game

        this.game.events.on("addPlayer", ({ player }) => {
            const graphic = new PlayerGraphic(player)
            this.players[player.id] = graphic
            this.playersContainer.addChild(graphic.container)
        })

        this.game.events.on("playerSetShip", ({ player }) => {
            this.players[player.id]?.updateShip()
        })

        this.game.events.on("removePlayer", ({ player }) => {
            if(player.id in this.players){
                const graphic = this.players[player.id]
                delete this.players[player.id]
                this.playersContainer.removeChild(graphic.container)
            }
        })
    }

    mount(container: HTMLDivElement){
        this.container = container
        this.container.appendChild(this.app.view)
    }

    render(context: GameContext, deltaMs: number, deltaTime: number){
        const players = Object.values(this.players)
        for(const graphic of players){
            graphic.container.position.x = graphic.player.ship.physics.position.x
            graphic.container.position.y = graphic.player.ship.physics.position.y
        }

        this.app.render()
    }
}