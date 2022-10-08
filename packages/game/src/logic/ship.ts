import { RecursivePartial } from "@pip-pip/core/src/lib/types"
import { generateId } from "@pip-pip/core/src/lib/utils"
import { PointPhysicsObject } from "@pip-pip/core/src/physics"
import { PipPipGame } from "."
import { PipPlayer } from "./player"

export type ShipStats = {
    aim: {
        speed: number,
        accuracy: number,
    },
    movement: {
        acceleration: number,
        agility: number,
    },
    weapon: {
        capacity: number,
        rate: number,
        reloadDuration: number,
    },
    tactical: {
        capcity: number,
        rate: number,
        reloadDuration: number,
    },
    bullet: {
        speed: number,
        size: number,
        damage: {
            low: number,
            normal: number,
            high: number,
        },
    },
    defense: {
        low: number,
        normal: number,
        high: number
    },
}

export const DEFAULT_SHIP_STATS: ShipStats = {
    aim: {
        speed: 0.8,
        accuracy: 0.95,
    },
    movement: {
        acceleration: 3,
        agility: 0.6,
    },
    weapon: {
        capacity: 20,
        rate: 3,
        reloadDuration: 1000,
    },
    tactical: {
        capcity: 3,
        rate: 20,
        reloadDuration: 5000,
    },
    bullet: {
        speed: 20,
        size:  20,
        damage: {
            low: 8,
            normal: 10,
            high: 12,
        },
    },
    defense: {
        low: 0.8,
        normal: 1,
        high: 1.2,
    },
}

export const createShipStats = (stats: RecursivePartial<ShipStats> = {}): ShipStats => {
    const output = {} as ShipStats

    function applyChanges(
        target: Record<string, any>, 
        changes: Record<string, any> | undefined, 
        source: Record<string, any>){
        for(const key in source){
            if(typeof source[key] === "object"){
                target[key] = {}
                applyChanges(target[key], changes?.[key], source[key])
            } else{
                if(typeof changes === "undefined"){
                    target[key] = source[key]
                } else{
                    if(typeof changes[key] === "undefined"){
                        target[key] = source[key]
                    } else{
                        target[key] = changes[key]
                    }
                }
            }
        }
    }
    
    applyChanges(output, stats, DEFAULT_SHIP_STATS)

    return output
}

export class Ship{
    id = generateId()

    physics = new PointPhysicsObject()

    player?: PipPlayer
    game?: PipPipGame

    stats = DEFAULT_SHIP_STATS

    constructor(){
        this.setupPhysics()
    }

    setupPhysics(){
        this.physics.mass = 500
        this.physics.airResistance = 0.1
        this.physics.collision.enabled = true
        this.physics.collision.channels = []
    }

    setPlayer(player: PipPlayer){
        if(typeof this.player !== "undefined"){
            this.player.removeShip()
        }
        this.player = player
        this.player.setShip(this)
    }

    removePlayer(){
        if(typeof this.player !== "undefined"){
            this.player.removeShip()
        }
        this.player = undefined
    }

    setGame(game: PipPipGame){
        this.game = game
    }
    
    setId(id: string){
        this.id = id
        // update game ID if already added
    }
}