import { PointPhysicsObject, Vector2 } from "@pip-pip/core/src/physics"
import { PipPipGame } from "."

import { PIP_SHIPS, Ship } from "./ship"

export type PlayerInputs = {
    movementAngle: number,
    movementAmount: number,

    aimRotation: number,

    useWeapon: boolean,
    useTactical: boolean,
    doReload: boolean,
}

export type PlayerPositionState = {
    positionX: number,
    positionY: number,
    velocityX: number,
    velocityY: number,
}

export const MAX_PLAYER_POSITION_STATES = 8

export class PipPlayer{
    id: string
    
    ship!: Ship
    shipIndex!: number

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

        aimRotation: 0,

        useWeapon: false,
        useTactical: false,
        doReload: false,
    }

    positionStates: PlayerPositionState[] = []

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
        if(this.shipIndex === index) return
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

    getPositionState(): PlayerPositionState{
        return {
            positionX: this.ship.physics.position.x,
            positionY: this.ship.physics.position.y,
            velocityX: this.ship.physics.velocity.x,
            velocityY: this.ship.physics.velocity.y,
        }
    }

    trackPositionState(){
        const state = this.getPositionState()

        if(this.positionStates.length >= MAX_PLAYER_POSITION_STATES){
            this.positionStates.pop()
        }
        this.positionStates.unshift(state)
    }

    getLastPositionState(index: number){
        if(this.positionStates.length === 0){
            return this.getPositionState()
        }
        index = Math.max(0, Math.min(index, this.positionStates.length - 1))
        const fromIndex = Math.floor(index)
        const toIndex = Math.ceil(index)
        const from = this.positionStates[fromIndex]
        const to = this.positionStates[toIndex]
        if(fromIndex === toIndex) return this.positionStates[fromIndex]
        const dist = index - fromIndex
        return {
            positionX: from.positionX + (to.positionX - from.positionX) * dist,
            positionY: from.positionY + (to.positionY - from.positionY) * dist,
            velocityX: from.velocityX + (to.velocityX - from.velocityX) * dist,
            velocityY: from.velocityY + (to.velocityY - from.velocityY) * dist,
        }
    }
}