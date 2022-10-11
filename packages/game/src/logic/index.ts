import { EventEmitter } from "@pip-pip/core/src/common/events"
import { PointPhysicsWorld } from "@pip-pip/core/src/physics"
import { radianDifference } from "@pip-pip/core/src/math"

import { Bullet } from "./bullet"
import { PipPlayer } from "./player"
import { Ship } from "./ship"
import { GameMap } from "./map"


export type PipPipGameEventMap = {
    addPlayer: { player: PipPlayer },
    removePlayer: { player: PipPlayer },
    playerIdleChange: { player: PipPlayer },

    playerSetShip: { player: PipPlayer, ship: Ship },
    playerRemoveShip: { player: PipPlayer, ship: Ship },

    setHost: { player: PipPlayer },
    removeHost: undefined,

    settingsChange: undefined,
    phaseChange: undefined,

    addBullet: { bullet: Bullet },
    removeBullet: { bullet: Bullet },
    addShip: { ship: Ship },
    removeShip: { ship: Ship },
    playerReloadStart: { player: PipPlayer },
    playerReloadEnd: { player: PipPlayer },
}

export type PipPipGameOptions = {
    shootAiBullets: boolean,
    calculateAi: boolean,
    assignHost: boolean,
    triggerPhases: boolean
}

export enum PipPipGameMode {
    DEATHMATCH,
    RACING,
}

export enum PipPipGamePhase {
    SETUP,
    COUNTDOWN,
    MATCH,
    RESULTS,
}

export type PipPipGameSettings = {
    mode: PipPipGameMode,
    useTeams: boolean,
    maxDeaths: 0 | number, // 0 for infinite respawn
    maxKills: 0 | number, // 0 for infinite kills
    friendlyFire: boolean,
}

export class PipPipGame{
    readonly tps = 20
    readonly deltaMs = 1000 / this.tps
    readonly maxTeams = 4

    options: PipPipGameOptions = {
        shootAiBullets: false,
        calculateAi: true,
        assignHost: false,
        triggerPhases: false,
    }

    events: EventEmitter<PipPipGameEventMap> = new EventEmitter()
    physics: PointPhysicsWorld = new PointPhysicsWorld()

    players: Record<string, PipPlayer> = {}
    bullets: Record<string, Bullet> = {}
    ships: Record<string, Ship> = {}

    host?: PipPlayer

    tickNumber = 0
    lastTick = Date.now()

    phase: PipPipGamePhase = PipPipGamePhase.SETUP
    countdown = 0

    map?: GameMap

    settings: PipPipGameSettings = {
        mode: PipPipGameMode.DEATHMATCH,
        useTeams: false,
        maxDeaths: 0,
        maxKills: 25,
        friendlyFire: false,
    }

    constructor(options: Partial<PipPipGameOptions> = {}){
        this.options = {
            ...this.options,
            ...options,
        }
        this.physics.options.baseTps = this.tps
    }

    setSettings(settings: Partial<PipPipGameSettings> = {}){
        if(this.phase !== PipPipGamePhase.SETUP) return
        let changed = false
        for(const _key in settings){
            const key = _key as keyof PipPipGameSettings
            if(this.settings[key] !== settings[key]){
                changed = true
                const s = this.settings as any // TODO: Fix type
                if(key in s) s[key] = settings[key]
            }
        }
        if(changed){
            this.events.emit("settingsChange")
        }
    }

    createPlayer(id: string){
        return new PipPlayer(this, id)
    }

    destroy(){
        this.players = {}
        this.bullets = {}
        this.ships = {}
        this.events.destroy()
        this.physics.destroy()
    }

    setPhase(phase: PipPipGamePhase){
        this.phase = phase
        this.events.emit("phaseChange")
    }

    get playerCount(){ return Object.keys(this.players).length }
    
    setHost(player: PipPlayer){
        this.host = player
        this.events.emit("setHost", { player })
    }

    setHostIfNeeded(){
        if(this.options.assignHost === true){
            if(this.playerCount === 0){
                this.removeHost()
            } else{
                const players = Object.values(this.players)
                this.setHost(players[0])
            }
        }
    }

    removeHost(){
        if(typeof this.host !== "undefined"){
            this.host = undefined
            this.events.emit("removeHost")
        }
    }

    update(){
        this.tickNumber++
        this.lastTick = Date.now()
        if(this.phase === PipPipGamePhase.SETUP){
            // do nothing
            return
        }

        if(this.phase === PipPipGamePhase.COUNTDOWN){
            this.countdown--
            if(this.countdown <= 0){
                this.countdown = 0
                if(this.options.triggerPhases){
                    this.setPhase(PipPipGamePhase.MATCH)
                }
            }
        }
        
        this.updatePhysics()
    }

    updatePhysics(){
        // update players
        for(const player of Object.values(this.players)){
            player.ship.update()
        }

        for(const player of Object.values(this.players)){

            const mag = Math.max(0, Math.min(1, player.inputs.movementAmount))
            if(mag > 0){
                player.ship.physics.velocity.x += Math.cos(player.inputs.movementAngle) * player.ship.stats.movement.acceleration.normal
                player.ship.physics.velocity.y += Math.sin(player.inputs.movementAngle) * player.ship.stats.movement.acceleration.normal
            }
        }
        
        this.physics.update(this.deltaMs)

        for(const player of Object.values(this.players)){
            player.trackPositionState()
        }
    }
}