import { EventEmitter } from "@pip-pip/core/src/common/events"
import { PointPhysicsWorld } from "@pip-pip/core/src/physics"
import { radianDifference } from "@pip-pip/core/src/math"

import { Bullet } from "./bullet"
import { PipPlayer } from "./player"
import { PipShip } from "./ship"
import { PipGameMap } from "./map"
import { PipMapType, PIP_MAPS } from "../maps"


export type PipPipGameEventMap = {
    addPlayer: { player: PipPlayer },
    removePlayer: { player: PipPlayer },
    playerIdleChange: { player: PipPlayer },

    playerSetShip: { player: PipPlayer, ship: PipShip },
    playerRemoveShip: { player: PipPlayer, ship: PipShip },
    playerSpawned: { player: PipPlayer },
    playerScoreChanged: { player: PipPlayer },

    setHost: { player: PipPlayer },
    removeHost: undefined,

    settingsChange: undefined,
    phaseChange: undefined,

    setMap: { mapIndex: number, mapType: PipMapType},

    addBullet: { bullet: Bullet },
    removeBullet: { bullet: Bullet },
    addShip: { ship: PipShip },
    removeShip: { ship: PipShip },
    playerReloadStart: { player: PipPlayer },
    playerReloadEnd: { player: PipPlayer },
}

export type PipPipGameOptions = {
    shootAiBullets: boolean,
    calculateAi: boolean,
    assignHost: boolean,
    triggerPhases: boolean
    triggerSpawns: boolean,
    setScores: boolean,
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
        triggerSpawns: false,
        setScores: false,
    }

    events: EventEmitter<PipPipGameEventMap> = new EventEmitter()
    physics: PointPhysicsWorld = new PointPhysicsWorld()

    players: Record<string, PipPlayer> = {}
    bullets: Record<string, Bullet> = {}
    ships: Record<string, PipShip> = {}

    host?: PipPlayer

    tickNumber = 0
    lastTick = Date.now()

    phase: PipPipGamePhase = PipPipGamePhase.SETUP
    countdown = 0

    mapIndex!:number
    mapType!: PipMapType
    map!: PipGameMap

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
        this.setMap()
    }

    setMap(index = 0){
        index = Math.max(0, Math.min(index, PIP_MAPS.length - 1))
        if(this.mapIndex === index) return
        if(typeof this.map !== "undefined"){
            // remove the current map
            for(const rectWall of this.map.rectWalls){
                this.physics.removeRectWall(rectWall)
            }
            for(const segWall of this.map.segWalls){
                this.physics.removeSegWall(segWall)
            }
        }

        const mapType = PIP_MAPS[index]
        const map = mapType.createMap()

        // Add walls
        for(const rectWall of map.rectWalls){
            this.physics.addRectWall(rectWall)
        }

        for(const segWall of map.segWalls){
            this.physics.addSegWall(segWall)
        }

        this.despawnPlayers()
        this.map = map
        this.mapIndex = index
        this.mapType = mapType

        this.events.emit("setMap", { mapIndex: index, mapType })
    }

    setSettings(settings: Partial<PipPipGameSettings> = {}){
        if(this.phase !== PipPipGamePhase.SETUP) return
        let changed = false
        for(const _key in settings){
            const key = _key as keyof PipPipGameSettings
            if(this.settings[key] !== settings[key]){
                changed = true
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    startMatch(){
        this.countdown = this.tps * 6 // 6 second count down
        this.setPhase(PipPipGamePhase.COUNTDOWN)
        if(this.options.triggerSpawns === true){
            const players = Object.values(this.players)
            for(const player of players){
                player.setSpawned(false)
                this.spawnPlayer(player)
            }
        }
        if(this.options.setScores){
            const players = Object.values(this.players)
            for(const player of players){
                player.resetScores()
            }
        }
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
            // despawn all players
            this.despawnPlayers()
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
        
        if(this.phase === PipPipGamePhase.MATCH){
            //
        }
        
        if(this.phase !== PipPipGamePhase.SETUP){
            this.updatePhysics()
        }
    }

    despawnPlayers() {
        if(this.options.triggerSpawns){
            const players = Object.values(this.players)
            for(const player of players){
                if(player.spawned === true){
                    player.setSpawned(false)
                }
            }
        }
    }

    spawnPlayer(player: PipPlayer, x?: number, y?: number){
        let finalX: number
        let finalY: number
        if(typeof x === "number" && typeof y === "number"){
            finalX = x
            finalY = y
        } else{
            if(player.canSpawn === false) return
            if(this.map.spawns.length === 0) return
            const index = Math.floor(Math.random() * this.map.spawns.length)
            const spawn = this.map.spawns[index]
            const angle = Math.random() * Math.PI * 2
            finalX = Math.round(spawn.x + Math.cos(angle) * spawn.radius)
            finalY = Math.round(spawn.y + Math.sin(angle) * spawn.radius)
        }
        player.ship.physics.position.x = finalX
        player.ship.physics.position.y = finalY
        player.ship.physics.velocity.x = 0
        player.ship.physics.velocity.y = 0

        player.setSpawned(true)
    }

    addPlayerMidGame(player: PipPlayer){
        if(this.phase === PipPipGamePhase.SETUP) return
        this.spawnPlayer(player)
    }

    updatePhysics(){
        // update players
        for(const player of Object.values(this.players)){
            player.update()
        }

        if(this.phase === PipPipGamePhase.MATCH){
            for(const player of Object.values(this.players)){
                // accelerate players
                const vel = Math.sqrt(
                    player.ship.physics.velocity.x * player.ship.physics.velocity.x +
                    player.ship.physics.velocity.y * player.ship.physics.velocity.y
                )
                const playerMovementInput = Math.max(0, Math.min(1, player.inputs.movementAmount)) 
                const playerAccelerationInput = player.ship.stats.movement.acceleration.normal * playerMovementInput
                const playerSpeedLimitTip = Math.max(0, (vel + playerAccelerationInput) - player.ship.stats.movement.speed.normal / (1 - player.ship.physics.airResistance))
                const playerCappedAccelerationInput = playerAccelerationInput - playerSpeedLimitTip
                
                if(playerCappedAccelerationInput > 0){
                    const angleDiff = radianDifference(player.inputs.movementAngle, player.inputs.aimRotation)
                    const angleEffect = (angleDiff / Math.PI) * (Math.PI / 6) * (1 - player.ship.stats.movement.agility)
                    const agilityModifier = Math.pow(player.ship.stats.movement.agility + (1 - Math.abs(angleDiff) / Math.PI) * (1 - player.ship.stats.movement.agility), 2)
                    const agilityAcceleration = playerCappedAccelerationInput * agilityModifier
                    player.ship.physics.velocity.x += Math.cos(player.inputs.movementAngle + angleEffect) * agilityAcceleration
                    player.ship.physics.velocity.y += Math.sin(player.inputs.movementAngle + angleEffect) * agilityAcceleration
                }
            }
        }

        // Run physics
        this.physics.update(this.deltaMs)
        
        // Enforce map bounds
        const R = -0.5
        for(const player of Object.values(this.players)){
            if(player.ship.physics.position.x < this.map.bounds.min.x){
                player.ship.physics.position.x = this.map.bounds.min.x
                player.ship.physics.velocity.x *= R
            }
            if(player.ship.physics.position.y < this.map.bounds.min.y){
                player.ship.physics.position.y = this.map.bounds.min.y
                player.ship.physics.velocity.y *= R
            }
            if(player.ship.physics.position.x > this.map.bounds.max.x){
                player.ship.physics.position.x = this.map.bounds.max.x
                player.ship.physics.velocity.x *= R
            }
            if(player.ship.physics.position.y > this.map.bounds.max.y){
                player.ship.physics.position.y = this.map.bounds.max.y
                player.ship.physics.velocity.y *= R
            }
        }

        for(const player of Object.values(this.players)){
            player.trackPositionState()
        }
    }
}