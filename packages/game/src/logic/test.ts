import { PointPhysicsObject, PointPhysicsWorld, radianDifference } from "@pip-pip/core/src/client"
import * as PIXI from "pixi.js"

export class Ship{
    aim = 0.8

    agility = 0.6
    acceleration = 5
    
    reloadDuration = 2000
    bulletCount = 20
    bulletSpeed = 30
    bulletSize = 10

    constructor(){
        //
    }
}

export class Player{
    id: string

    physics: PointPhysicsObject = new PointPhysicsObject()

    ship?: Ship

    targetRotation = 0
    aimRotation = 0

    acceleration = {
        angle: 0,
        magnitude: 0,
    }

    constructor(id: string){
        this.id = id
        this.physics.collision.enabled = true
    }
}

export class PipPipGame{
    players: Record<string, Player> = {}

    physics: PointPhysicsWorld = new PointPhysicsWorld()

    gameMode = 0
    isWaitingLobby = true

    readonly tps = 20
    readonly deltaMs = 1000 / this.tps

    constructor(){
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
    }

    removePlayer(player: Player){
        delete this.players[player.id]
        player.physics.destroy()
    }

    update(){
        const players = Object.values(this.players)

        for(const player of players){
            if(typeof player.ship !== "undefined"){
                // Make aim move
                player.aimRotation += radianDifference(player.aimRotation, player.targetRotation) / (3 + 9 * (1 - player.ship.aim))
                
                // accelerate players
                if(player.acceleration.magnitude > 0){
                    const angleDiff = radianDifference(player.acceleration.angle, player.aimRotation)
                    const magModifier = Math.pow(player.ship.agility + (1 - Math.abs(angleDiff) / Math.PI) * (1 - player.ship.agility), 4)
                    const mag = player.ship.acceleration * player.acceleration.magnitude * magModifier
                    const x = Math.cos(player.acceleration.angle) * mag
                    const y = Math.sin(player.acceleration.angle) * mag
                    player.physics.velocity.qx += x
                    player.physics.velocity.qy += y
                }
            }
        }

        this.physics.update(this.deltaMs)
    }
}