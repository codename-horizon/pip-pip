import { EventEmitter, generateId, SERVER_DEFAULT_MAX_PING, PointPhysicsObject, PointPhysicsWorld, radianDifference } from "@pip-pip/core/src/common"
import * as PIXI from "pixi.js"

export class Ship{
    aim = 0.8

    agility = 0.75
    acceleration = 3
    
    reloadDuration = 1200
    shootInterval = 3
    bullet = {
        count: 20,
        speed: 20,
        size: 20,
    }

    constructor(){
        //
    }
}

export class Bullet{
    id: string
    physics: PointPhysicsObject = new PointPhysicsObject()
    lifespan = 5000

    owner?: Player

    speed = 40
    radius = 20
    rotation = 0

    constructor(id: string = generateId()){
        this.id = id
        this.physics.setId(id)
        this.physics.mass = 1
        this.physics.radius = this.radius
        this.physics.airResistance = 0
        this.physics.collision.channels = [1]
        this.physics.collision.excludeChannels = [1]
    }

    setOwner(player: Player){
        this.owner = player
        this.physics.collision.excludeObjects = [player.physics]
    }
    
    setPosition(x: number, y: number){
        this.physics.position.x = x
        this.physics.position.y = y
    }

    setTrajectory(angle: number, speed?: number){
        const s = typeof speed === "undefined" ? this.speed : speed
        this.physics.velocity.x = Math.cos(angle) * s
        this.physics.velocity.y = Math.sin(angle) * s
        this.rotation = angle
    }
}

export class Player{
    id: string

    ai = false

    physics: PointPhysicsObject = new PointPhysicsObject()

    ship?: Ship

    debugMagModifier = 0

    targetRotation = 0
    aimRotation = 0

    reloadTimeLeft = 0
    ammo = 0

    lastShotTick = -100

    inputShooting = false
    inputReloading = false

    acceleration = {
        angle: 0,
        magnitude: 0,
    }

    ping = SERVER_DEFAULT_MAX_PING

    constructor(id: string){
        this.id = id
        this.physics.mass = 500
        this.physics.collision.enabled = true
        this.physics.collision.channels = []
    }

    reload(){
        if(this.canReload === true && typeof this.ship !== "undefined"){
            this.reloadTimeLeft = this.ship.reloadDuration
        }
    }

    get canReload(){
        if(typeof this.ship === "undefined") return false
        if(this.ammo >= this.ship.bullet.count) return false
        if(this.isReloading) return false
        return true
    }

    get isReadyToShoot(){
        if(this.isReloading) return false
        if(this.ammo === 0) return false
        return true
    }

    get isReloading(){
        if(this.reloadTimeLeft === 0) return false
        return true
    }
}

export type PipPipGameEventMap = {
    addPlayer: { player: Player },
    removePlayer: { player: Player },
    addBullet: { bullet: Bullet },
    removeBullet: { bullet: Bullet },
    playerReloadStart: { player: Player },
    playerReloadEnd: { player: Player },
}

export type PipPipGameOptions = {
    shootAiBullets: boolean,
    calculateAi: boolean,
}

export class PipPipGame{
    options: PipPipGameOptions = {
        shootAiBullets: false,
        calculateAi: true,
    }

    events: EventEmitter<PipPipGameEventMap> = new EventEmitter()

    players: Record<string, Player> = {}
    bullets: Record<string, Bullet> = {}

    physics: PointPhysicsWorld = new PointPhysicsWorld()

    gameMode = 0
    isWaitingLobby = true

    tickNumber = 0

    readonly tps = 20
    readonly deltaMs = 1000 / this.tps

    constructor(options: Partial<PipPipGameOptions> = {}){
        this.options = {
            ...this.options,
            ...options,
        }
        this.physics.options.baseTps = this.tps
    }

    setGameMode(mode: number){
        if(this.isWaitingLobby){
            this.gameMode = mode
        } else{
            throw new Error("Not in waiting lobby")
        }
    }

    addPlayer(player: Player){
        this.players[player.id] = player
        this.physics.addObject(player.physics)
        this.events.emit("addPlayer", { player })
    }

    removePlayer(player: Player){
        delete this.players[player.id]
        player.physics.destroy()
        this.events.emit("removePlayer", { player })
    }

    addBullet(bullet: Bullet){
        this.bullets[bullet.id] = bullet
        this.physics.addObject(bullet.physics)
        this.events.emit("addBullet", { bullet })
    }

    removeBullet(bullet: Bullet){
        delete this.bullets[bullet.id]
        bullet.physics.destroy()
        this.events.emit("removeBullet", { bullet })
    }

    triggerPlayerReload(player: Player){
        if(player.canReload){
            player.reload()
            this.events.emit("playerReloadStart", { player })
        }
    }

    getNearestPlayerTo(player: Player, ai?: boolean){
        const output: {
            dx: number, dy: number,
            distance: number, player: Player,
        } = {
            dx: 0, dy: 0,
            distance: Infinity,
            player,
        }
        const players = Object.values(this.players)
        for(const otherPlayer of players){
            if(otherPlayer === player) continue
            if(typeof ai !== "undefined" && otherPlayer.ai !== ai) continue
            const dx = otherPlayer.physics.position.x - player.physics.position.x
            const dy = otherPlayer.physics.position.y - player.physics.position.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if(dist < output.distance){
                output.distance = dist
                output.dx = dx
                output.dy = dy
                output.player = player
            }
        }
        if(output.distance === Infinity) return
        return output
    }

    update(){
        const players = Object.values(this.players)

        for(const player of players){
            if(typeof player.ship !== "undefined"){

                // handle AI
                if(player.ai === true && this.options.calculateAi){
                    // point and move towards nearest non AI
                    const nearest = this.getNearestPlayerTo(player, false)
                    if(typeof nearest !== "undefined"){
                        const { distance, dx, dy } = nearest
                        const angle = Math.atan2(dy, dx)
                        if(distance < 200){
                            player.targetRotation = angle
                            player.acceleration.magnitude = 0
                            if(distance > 100){
                                // move forward if facing player
                                if(Math.abs(radianDifference(angle, player.aimRotation)) < Math.PI / 4){
                                    player.acceleration.angle = player.aimRotation
                                    player.acceleration.magnitude = 1
                                }
                            } else if(distance > 500){
                                // stay
                            } else{
                                // move back
                                player.acceleration.angle = -player.aimRotation
                                player.acceleration.magnitude = 1
                            }
                            if(Math.abs(radianDifference(angle, player.aimRotation)) < Math.PI / 8){
                                player.inputShooting = true
                                player.inputReloading = false
                            }
                        } else{
                            player.acceleration.magnitude = 0
                            player.inputShooting = false
                            player.inputReloading = true
                        }
                    }
                }

                // trigger reload
                if(player.inputReloading === true){
                    this.triggerPlayerReload(player)
                }

                // shooting
                if(player.inputShooting === true){
                    if(player.ammo === 0){
                        this.triggerPlayerReload(player)
                    } else if(player.isReadyToShoot){
                        if(player.ai === false || (player.ai === true && this.options.shootAiBullets)){
                            if(this.tickNumber >= player.lastShotTick + player.ship.shootInterval){
                                // shoot
                                const bullet = new Bullet()
                                bullet.setOwner(player)
                                const offset = player.physics.radius / 4
                                const x = player.physics.position.x + Math.cos(player.aimRotation) * offset
                                const y = player.physics.position.y + Math.sin(player.aimRotation) * offset
                                bullet.setPosition(x, y)
                                bullet.setTrajectory(player.aimRotation)
                                this.addBullet(bullet)
                                player.ammo--
                                player.lastShotTick = this.tickNumber
                            }
                        }
                    }
                }

                // reload player
                if(player.reloadTimeLeft > 0){
                    player.reloadTimeLeft -= this.deltaMs
                    if(player.reloadTimeLeft <= 0){
                        player.reloadTimeLeft = 0
                        player.ammo = player.ship.bullet.count
                        this.events.emit("playerReloadEnd", { player })
                    }
                }

                // make aim move
                player.aimRotation += radianDifference(player.aimRotation, player.targetRotation) / (3 + 9 * (1 - player.ship.aim))
                
                // accelerate players
                if(player.acceleration.magnitude > 0){
                    const inputMag = Math.min(1, Math.max(0, Math.abs(player.acceleration.magnitude)))
                    const angleDiff = radianDifference(player.acceleration.angle, player.aimRotation)
                    const magModifier = Math.pow(player.ship.agility + (1 - Math.abs(angleDiff) / Math.PI) * (1 - player.ship.agility), 2)
                    player.debugMagModifier = magModifier
                    const mag = player.ship.acceleration * inputMag * magModifier
                    const x = Math.cos(player.acceleration.angle) * mag
                    const y = Math.sin(player.acceleration.angle) * mag
                    player.physics.velocity.qx += x
                    player.physics.velocity.qy += y
                }
            }
        }

        const bullets = Object.values(this.bullets)

        for(const bullet of bullets){
            // collision checks
        }

        this.physics.update(this.deltaMs)

        for(const bullet of bullets){
            // kill bullet
            bullet.lifespan -= this.deltaMs
            if(bullet.lifespan <= 0){
                this.removeBullet(bullet)
            } 
        }

        this.tickNumber++
    }
}