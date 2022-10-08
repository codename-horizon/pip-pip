import { PointPhysicsObject, Vector2 } from "@pip-pip/core/src/physics"
import { PipPipGame } from "."

import { Ship } from "./ship"

export class PipPlayer{
    id: string
    ping = 0

    ship?: Ship
    game?: PipPipGame
    spectating?: PipPlayer | Ship | PointPhysicsObject | Vector2

    constructor(id: string){
        this.id = id
    }

    setShip(ship: Ship){
        if(typeof this.ship !== "undefined"){
            this.ship.removePlayer()
        }
        this.ship = ship
        this.ship.setPlayer(this)
    }

    removeShip(){
        if(typeof this.ship !== "undefined"){
            this.ship.removePlayer()
        }
        this.ship = undefined
    }

    setGame(game: PipPipGame){
        this.game = game
    }
}