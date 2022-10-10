import { RecursivePartial } from "@pip-pip/core/src/lib/types"
import { generateId } from "@pip-pip/core/src/lib/utils"
import { PointPhysicsObject } from "@pip-pip/core/src/physics"
import { PipPipGame } from "."
import { PipPlayer } from "./player"
import { decrease } from "./utils"

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
        accuracy: 0.95,
    },
    movement: {
        acceleration: {
            low: 2,
            normal: 3,
            high: 5,
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

export class Ship{
    static shipType = "ship"
    static shipName = "Ship"
    static shipTextureId = "ship"

    id: string

    physics = new PointPhysicsObject()

    player?: PipPlayer // allow for AI to control
    game: PipPipGame

    aimAngle = 0

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
        this.physics.airResistance = 0.1
        this.physics.collision.enabled = true
        this.physics.collision.channels = []
    }

    update(){
        this.timings.invincibility = decrease(this.timings.invincibility)
        this.timings.healthRegenerationHeal = decrease(this.timings.healthRegenerationHeal)
        this.timings.healthRegenerationRest = decrease(this.timings.healthRegenerationRest)
        this.timings.weaponReload = decrease(this.timings.weaponReload)
        this.timings.weaponRate = decrease(this.timings.weaponRate)
        this.timings.tacticalReload = decrease(this.timings.tacticalReload)
        this.timings.tacticalRate = decrease(this.timings.tacticalRate)

        // take input from player
        if(typeof this.player !== "undefined"){
            // set angle
        }
    }
}

export class BluShip extends Ship{
    static shipType = "blu"
    static shipName = "Blu"
    static shipTextureId = "ship-blu"

    stats = createShipStats({
        health: {
            capacity: createRange(120)
        },
    })
}

export class RedShip extends Ship{
    static shipType = "red"
    static shipName = "Red"
    static shipTextureId = "ship-red"

    stats = createShipStats({
        movement: {
            acceleration: createRange(5),
        },
    })
}

export const PIP_SHIPS: (typeof Ship)[] = [
    BluShip,
    RedShip,
]