import { PointPhysicsObject, Vector2 } from "@pip-pip/core/src/physics"
import { PipPipGame } from "."

import { PIP_SHIPS, Ship } from "./ship"

export type PlayerInputs = {
    movementAngle: number,
    movementAmount: number,

    aimAngle: number,

    useWeapon: boolean,
    useTactical: boolean,
    doReload: boolean,
}

export class PipPlayer{
    id: string
    
    ship!: Ship
    shipIndex = 0

    game: PipPipGame
    spectating?: PipPlayer | Ship | PointPhysicsObject | Vector2

    name = "Pilot" + Math.floor(Math.random() * 1000)
    idle = false
    ping = 0

    team = 0
    kills = 0
    assists = 0
    deaths = 0

    checkpoint = 0

    inputs: PlayerInputs = {
        movementAngle: 0,
        movementAmount: 0,

        aimAngle: 0,

        useWeapon: false,
        useTactical: false,
        doReload: false,
    }

    constructor(game: PipPipGame, id: string){
        this.game = game
        this.id = id

        if(id in this.game.players) throw new Error("Player already in game.")
        this.game.players[id] = this
        this.game.events.emit("addPlayer", { player: this })
        this.game.setHostIfNeeded()
        this.setShip(0)
    }

    remove(){
        if(!(this.id in this.game.players)) return
        this.game.physics.removeObject(this.ship.physics)
        delete this.game.players[this.id]
        this.game.events.emit("removePlayer", { player: this })
        this.game.setHostIfNeeded()
    }

    resetScores(){
        this.kills = 0
        this.assists = 0
        this.deaths = 0
        this.checkpoint = 0
    }

    setIdle(idle: boolean){
        this.idle = idle
        this.game.events.emit("playerIdleChange", { player: this })
    }

    setShip(index: number){
        index = Math.max(0, Math.min(PIP_SHIPS.length, index))
        const PlayerShip = PIP_SHIPS[index]
        const ship = new PlayerShip(this.game, this.id)
        ship.setPlayer(this)

        this.shipIndex = index

        if(typeof this.ship !== "undefined"){
            this.game.physics.removeObject(this.ship.physics)
        }

        this.ship = ship
        this.game.physics.addObject(this.ship.physics)
        this.game.events.emit("playerSetShip", {
            player: this,
            ship,
        })
    }
}