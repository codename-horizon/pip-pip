import { EventEmitter } from "@pip-pip/core/src/common/events"
import { PointPhysicsWorld } from "@pip-pip/core/src/physics"
import { radianDifference } from "@pip-pip/core/src/math"

import { Bullet } from "./bullet"
import { PipPlayer } from "./player"
import { Ship } from "./ship"


export type PipPipGameEventMap = {
    addPlayer: { player: PipPlayer },
    removePlayer: { player: PipPlayer },
    playerIdleChange: { player: PipPlayer },

    playerSetShip: { player: PipPlayer, ship: Ship },
    playerRemoveShip: { player: PipPlayer, ship: Ship },

    setHost: { player: PipPlayer },
    removeHost: undefined,

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
}

export enum PipPipGameMode {
    PVP,
    RACING,
}

export enum PipPipGamePhase {
    SETUP,
    MATCH,
    RESULTS,
}

export type PipPipGameSettings = {
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
    }

    events: EventEmitter<PipPipGameEventMap> = new EventEmitter()
    physics: PointPhysicsWorld = new PointPhysicsWorld()

    players: Record<string, PipPlayer> = {}
    bullets: Record<string, Bullet> = {}
    ships: Record<string, Ship> = {}

    host?: PipPlayer

    tickNumber = 0

    mode: PipPipGameMode = PipPipGameMode.PVP
    phase: PipPipGamePhase = PipPipGamePhase.SETUP
    settings: PipPipGameSettings = {
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

    addPlayer(player: PipPlayer){
        if(player.id in this.players) throw new Error("Player already in game.")
        this.players[player.id] = player
        this.events.emit("addPlayer", { player })

        if(this.options.assignHost === true && this.playerCount === 1){
            this.setHost(player)
        }
    }

    removePlayer(player: PipPlayer){
        if(!(player.id in this.players)) return
        delete this.players[player.id]
        this.events.emit("removePlayer", { player })
        
        if(this.options.assignHost === true && this.host === player){
            if(this.playerCount > 0){
                const newHost = Object.values(this.players)[0]
                this.setHost(newHost)
            } else{
                this.removeHost()
            }
        }
    }
    
    setHost(player: PipPlayer){
        this.host = player
        this.events.emit("setHost", { player })
    }

    removeHost(){
        this.host = undefined
        this.events.emit("removeHost")
    }

    startMode(){
        //
    }
}