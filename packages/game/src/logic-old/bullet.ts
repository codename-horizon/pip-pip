import { PointPhysicsObject } from "@pip-pip/core/src/physics"
import { generateId } from "@pip-pip/core/src/lib/utils"

import { Player } from "./player"

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