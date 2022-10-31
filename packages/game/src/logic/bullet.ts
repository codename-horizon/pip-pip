import { PointPhysicsObject, Vector2 } from "@pip-pip/core/src/physics"
import { generateId } from "@pip-pip/core/src/lib/utils"

import { PipPlayer } from "./player"
import { PipPipGame } from "."
import { tickDown } from "./utils"

export type BulletParams = {
    position: Vector2, 
    velocity: Vector2,
    owner?: PipPlayer,

    speed: number,
    radius: number,
    rotation: number,
}

export const BULLET_DEFAULT_LIFESPAN = 20 * 8 // eight seconds

export class Bullet{
    dead = true

    id = "bullet" + generateId(4)
    physics: PointPhysicsObject = new PointPhysicsObject()
    lifespan = BULLET_DEFAULT_LIFESPAN

    owner?: PipPlayer

    speed = 40
    radius = 20
    rotation = 0

    pool: BulletPool

    constructor(pool: BulletPool){
        this.pool = pool
        this.physics.mass = 1
        this.physics.radius = this.radius
        this.physics.airResistance = 0
        this.physics.collision.channels = [1]
        this.physics.collision.excludeChannels = [1]
    }

    set(params: BulletParams){
        this.physics.position.x = params.position.x
        this.physics.position.y = params.position.y
        this.physics.velocity.x = params.velocity.x
        this.physics.velocity.y = params.velocity.y
        this.owner = params.owner
        this.lifespan = BULLET_DEFAULT_LIFESPAN
        this.dead = false
        this.pool.game.physics.addObject(this.physics)
        this.pool.game.events.emit("addBullet", { bullet: this })
    }

    unset(){
        this.pool.game.events.emit("removeBullet", { bullet: this })
        this.dead = true
        this.lifespan = 0
        this.owner = undefined
        this.physics.position.x = 0
        this.physics.position.y = 0
        this.physics.velocity.x = 0
        this.physics.velocity.y = 0
        this.pool.game.physics.removeObject(this.physics)
    }

    setTrajectory(angle: number, speed?: number){
        const s = typeof speed === "undefined" ? this.speed : speed
        this.physics.velocity.x = Math.cos(angle) * s
        this.physics.velocity.y = Math.sin(angle) * s
        this.rotation = angle
    }

    update(){
        this.lifespan = tickDown(this.lifespan, 1)
    }
}

export class BulletPool {
    game: PipPipGame

    bullets: Record<string, Bullet> = {}

    constructor(game: PipPipGame){
        this.game = game
    }

    getAll(){
        return Object.values(this.bullets)
    }

    getActive(){
        return Object.values(this.bullets).filter(bullet => bullet.dead === false)
    }

    log(){
        console.log(`BulletPool(${this.getActive().length}/${this.getAll().length})`)
    }

    new(params: BulletParams){
        let outputBullet: Bullet
        const reusableBullet = this.getAll().find(bullet => bullet.dead === true)

        if(typeof reusableBullet === "undefined"){
            const bullet = new Bullet(this)
            this.bullets[bullet.id] = bullet
            outputBullet = bullet
        } else{
            outputBullet = reusableBullet
        }
        
        outputBullet.set(params)
        this.log()
        return outputBullet
    }

    unset(bullet: Bullet){
        if(!(bullet.id in this.bullets)) return
        if(bullet.dead === false){
            bullet.unset()
            this.log()
        }
    }

    destroy(){
        for(const id in this.bullets){
            const bullet = this.bullets[id]
            this.unset(bullet)
            delete this.bullets[id]
        }
    }
}