import { EventEmitter } from "@pip-pip/core/src/common/events"
import { PointPhysicsWorld } from "@pip-pip/core/src/physics"
import { radianDifference } from "@pip-pip/core/src/math"

import { Bullet } from "./bullet"
import { Player } from "./player"


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
                                player.acceleration.angle = player.aimRotation
                                if(Math.abs(radianDifference(angle, player.aimRotation)) < Math.PI / 4){
                                    player.acceleration.magnitude = 0.5
                                }
                                if(Math.abs(radianDifference(angle, player.aimRotation)) < Math.PI / 8){
                                    player.acceleration.magnitude = 1
                                }
                            } else if(distance > 500){
                                // stay
                            } else{
                                // move back
                                player.acceleration.angle = -player.aimRotation
                                player.acceleration.magnitude = 1
                            }
                            if(Math.abs(radianDifference(angle, player.aimRotation)) < Math.PI / 16){
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