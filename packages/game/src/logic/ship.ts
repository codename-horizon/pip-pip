import { RecursivePartial } from "@pip-pip/core/src/lib/types"
import { radianDifference } from "@pip-pip/core/src/math"
import { PointPhysicsObject } from "@pip-pip/core/src/physics"
import { PipPipGame } from "."
import { SHIP_DAIMETER } from "./constants"
import { PipPlayer } from "./player"
import { tickDown } from "./utils"

export type StatRange = {
    low: number,
    normal: number,
    high: number,
}

export type ShipStats = {
    aim: {
        speed: number,
        accuracy: number,
    },
    movement: {
        acceleration: StatRange,
        speed: StatRange,
        agility: number,
    },
    weapon: {
        capacity: number,
        rate: number,
        reload: {
            ticks: StatRange,
        },
    },
    tactical: {
        capcity: number,
        rate: number,
        damage: StatRange,
        reload: {
            ticks: StatRange,
        },
    },
    bullet: {
        velocity: number,
        radius: number,
        damage: StatRange,
    },
    defense: StatRange,
    health: {
        capacity: StatRange,
        regeneration: {
            amount: StatRange,
            ticks: {
                rest: number,
                heal: number,
            },
        },
    },
}

export function createRange(normal: number, effect = 0.2): StatRange{
    return {
        low: normal * (1 - effect),
        normal,
        high: normal * (1 + effect),
    }
}

export const DEFAULT_SHIP_STATS: ShipStats = {
    aim: {
        speed: 0.8,
        accuracy: 0.75,
    },
    movement: {
        acceleration: {
            low: 3,
            normal: 4,
            high: 6,
        },
        speed: {
            low: 25,
            normal: 30,
            high: 35,
        },
        agility: 0.6,
    },
    weapon: {
        capacity: 20,
        rate: 3,
        reload: {
            ticks: createRange(20),
        },
    },
    tactical: {
        capcity: 3,
        rate: 20,
        damage: createRange(40),
        reload: {
            ticks: createRange(20 * 5),
        },
    },
    bullet: {
        velocity: 20,
        radius:  20,
        damage: createRange(10),
    },
    defense: {
        low: 0.8,
        normal: 1,
        high: 1.2,
    },
    health: {
        capacity: createRange(100),
        regeneration: {
            amount: createRange(10),
            ticks: {
                rest: 20 * 5,
                heal: 5,
            },
        },
    },
}

export const createShipStats = (stats: RecursivePartial<ShipStats> = {}): ShipStats => {
    const output = {} as ShipStats

    type T = Record<string, unknown>
    type K = T | undefined

    function applyChanges(
        target: T, 
        changes: K, 
        source: T){
        for(const key in source){
            if(typeof source[key] === "object"){
                target[key] = {}
                applyChanges(target[key] as T, changes?.[key] as K, source[key] as T)
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

export type ShipTimings = {
    weaponReload: number,
    weaponRate: number,
    tacticalReload: number,
    tacticalRate: number,
    healthRegenerationRest: number,
    healthRegenerationHeal: number,
    invincibility: number,
}

export type ShipCapacities = {
    weapon: number,
    tactical: number,
    health: number,
}

export class PipShip{
    static shipType = "ship"
    static shipName = "Ship"
    static shipTextureId = "ship"

    id: string

    physics = new PointPhysicsObject()

    player?: PipPlayer // allow for AI to control
    game: PipPipGame

    rotation = 0
    targetRotation = 0

    stats = DEFAULT_SHIP_STATS

    timings: ShipTimings = {
        invincibility: 0,

        healthRegenerationHeal: 0,
        healthRegenerationRest: 0,

        weaponReload: 0,
        weaponRate: 0,

        tacticalReload: 0,
        tacticalRate: 0,
    }

    capacities: ShipCapacities = {
        health: 0,
        tactical: 0,
        weapon: 0,
    }

    constructor(game: PipPipGame, id: string){
        this.id = id
        this.game = game

        // Reload and heal
        this.capacities.health = this.stats.health.capacity.normal
        this.capacities.tactical = this.stats.tactical.capcity
        this.capacities.weapon = this.stats.weapon.capacity

        this.setupPhysics()
    }

    setPlayer(player: PipPlayer){
        this.player = player
    }

    setupPhysics(){
        this.physics.mass = 500
        this.physics.radius = SHIP_DAIMETER / 2
        this.physics.airResistance = 0.05
        this.physics.collision.enabled = true
        this.physics.collision.channels = []
    }

    get maxHealth(){
        return this.stats.health.capacity.normal
    }

    get isDead(){
        if(this.capacities.health === 0) return true
        return false
    }

    get isReloading(){
        if(this.timings.weaponReload !== 0) return true
        return false
    }

    get canReload(){
        if(this.isReloading) return false
        return true
    }

    get canUseWeapon(){
        if(this.capacities.tactical === 0) return false
        if(this.timings.weaponRate !== 0) return false
        return true
    }

    update(){
        this.timings.invincibility = tickDown(this.timings.invincibility)
        this.timings.healthRegenerationHeal = tickDown(this.timings.healthRegenerationHeal)
        this.timings.healthRegenerationRest = tickDown(this.timings.healthRegenerationRest)
        this.timings.weaponReload = tickDown(this.timings.weaponReload)
        this.timings.weaponRate = tickDown(this.timings.weaponRate)
        this.timings.tacticalReload = tickDown(this.timings.tacticalReload)
        this.timings.tacticalRate = tickDown(this.timings.tacticalRate)

        // take input from player
        if(typeof this.player !== "undefined"){
            // set angle
            this.targetRotation = this.player.inputs.aimRotation
        }

        this.rotation += radianDifference(this.rotation, this.targetRotation) / (1 + 8 * (1 - this.stats.aim.accuracy))
    }
}

