import { PointPhysicsObject, Vector2 } from "@pip-pip/core/src/physics"
import { PipPipGame } from "."

import { Ship } from "./ship"

export class PipPlayer{
    id: string
    
    ship?: Ship
    game: PipPipGame
    spectating?: PipPlayer | Ship | PointPhysicsObject | Vector2
    
    name = "Pilot" + Math.floor(Math.random() * 1000)
    idle = false
    ping = 0
    
    constructor(game: PipPipGame, id: string){
        this.game = game
        this.id = id
    }

    setIdle(idle: boolean){
        this.idle = idle
        this.game.events.emit("playerIdleChange", { player: this })
    }

    setShip(ship: Ship){
        if(typeof this.ship !== "undefined"){
            this.ship.removePlayer()
        }
        this.ship = ship
        this.ship.setPlayer(this)
        this.game.events.emit("playerSetShip", {
            player: this,
            ship,
        })
    }

    removeShip(){
        if(typeof this.ship !== "undefined"){
            this.ship.removePlayer()
            this.game.events.emit("playerRemoveShip", {
                player: this,
                ship: this.ship,
            })
        }
        this.ship = undefined
    }
}