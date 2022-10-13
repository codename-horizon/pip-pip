import { generateId } from "../lib/utils"
import { normalizeToPositiveRadians, radianDifference, radiansToDegree } from "../math"

export class Vector2{
    _x = 0
    _y = 0
    // previous
    // px = 0
    // py = 0
    // delta
    // dx = 0
    // dy = 0
    // queue
    _qx = 0
    _qy = 0

    constructor(x?: number, y?: number){
        if(typeof x === "number" && typeof y === "number"){
            this.set(x, y)
        }
    }

    get x(){ return this._x }
    set x(value: number){
        // this.px = this._x
        this._x = this._qx = value
        // this.dx = this._x - this.px
    }

    get y(){ return this._y }
    set y(value: number){
        // this.py = this._y
        this._y = this._qy = value
        // this.dy = this._y - this.py
    }

    get qx(){ return this._qx }
    set qx(value: number){ this._qx = value }

    get qy(){ return this._qy }
    set qy(value: number){ this._qy = value }

    set(x: number, y: number){
        this.x = x
        this.y = y
    }

    queue(x: number, y: number){
        this.qx = x
        this.qy = y
    }

    flush(){
        this.set(this.qx, this.qy)
    }

    reset(){
        this._x = this._y = 0
        // this.px = this.py = 0
        // this.dx = this.dy = 0
    }
}

export type CollisionOptions = {
    enabled: boolean,
    channels: number[],
    includeChannels: number[],
    excludeChannels: number[],
    includeObjects: PointPhysicsObject[],
    excludeObjects: PointPhysicsObject[],
}

export class PointPhysicsRectWall {
    id = generateId()
    center: Vector2 = new Vector2()
    width = 50
    height = 50
    constructor(id?: string){
        if(typeof id === "string"){
            this.id = id
        }
    }
}

export class PointPhysicsObject{
    id = generateId()
    
    position: Vector2 = new Vector2()
    velocity: Vector2 = new Vector2()
    
    collision: CollisionOptions = {
        enabled: true,
        channels: [],
        includeChannels: [],
        excludeChannels: [],
        includeObjects: [],
        excludeObjects: [],
    }

    radius = 25
    mass = 100
    airResistance = 0.1

    world?: PointPhysicsWorld

    dead = false

    constructor(id?: string){
        if(typeof id === "string"){
            this.id = id
        }
    }

    setId(id: string){
        this.id = id
        // Ensure ID change is safe
    }

    setWorld(world: PointPhysicsWorld){
        this.world = world
    }

    destroy(){
        if(this.dead === true) return
        if(typeof this.world === "undefined") return
        this.dead = true
        this.world.removeObject(this)
    }
}

export type PointPhysicsWorldOptions = {
    baseTps: number,
    logFrequency: number,
}

export class PointPhysicsWorld{
    options: PointPhysicsWorldOptions

    objects: Record<string, PointPhysicsObject> = {}
    rectWalls: Record<string, PointPhysicsRectWall> = {}

    lastLog = Date.now()

    timeScale = 1
    
    lastUpdate = Date.now()

    constructor(options: Partial<PointPhysicsWorldOptions> = {}){
        this.options = {
            baseTps: 20,
            logFrequency: 10000,
            ...options,
        }
    }

    destroy(){
        for(const id in this.objects){
            this.objects[id].destroy()
            delete this.objects[id]
        }
        for(const id in this.rectWalls){
            delete this.rectWalls[id]
        }
    }

    addObject(object: PointPhysicsObject){
        if(object.id in this.objects){
            const conflict = this.objects[object.id]
            if(object !== conflict){
                conflict.destroy()
            }
        }
        this.objects[object.id] = object
        object.setWorld(this)
    }

    removeObject(object: PointPhysicsObject){
        if(object.id in this.objects){
            delete this.objects[object.id]
            object.destroy()
        }
    }

    addRectWall(rectWall: PointPhysicsRectWall){
        this.rectWalls[rectWall.id] = rectWall
    }

    removeRectWall(rectWall: PointPhysicsRectWall){
        if(rectWall.id in this.rectWalls){
            delete this.rectWalls[rectWall.id]
        }
    }

    update(deltaMs: number){
        this.lastUpdate = Date.now()
        
        const baseMs = 1000 / this.options.baseTps
        const deltaTime =  (Math.max(1, deltaMs) / baseMs) * this.timeScale
        const objects = Object.values(this.objects)
        const collidableObjects = Object.values(this.objects).filter(object => object.collision.enabled === true)

        // Apply air resistance
        for(const object of objects){
            const airResistance = Math.pow(1 - object.airResistance, deltaTime)

            object.velocity.qx *= airResistance
            object.velocity.qy *= airResistance
        }

        for(const a of collidableObjects){
            for(const b of collidableObjects){
                if(a.id === b.id) continue
                if(!a.collision.enabled) continue
                if(!b.collision.enabled) continue
                if(a.collision.channels.some(channel => b.collision.excludeChannels.includes(channel))) continue
                if(b.collision.channels.some(channel => a.collision.excludeChannels.includes(channel))) continue
                if(a.collision.excludeObjects.includes(b)) continue
                if(b.collision.excludeObjects.includes(a)) continue

                const vdx = (a.position.x + a.velocity.x - b.position.x + b.velocity.x)
                const vdy = (a.position.y + a.velocity.y - b.position.y + b.velocity.y)
                // const vdist = Math.sqrt(vdx * vdx + vdy * vdy)

                const dx = (a.position.x - b.position.x)
                const dy = (a.position.y - b.position.y)
                const dist = Math.sqrt(dx * dx + dy * dy)

                const diff = ((a.radius + b.radius) - dist) / dist
                const s1 = (1 / a.mass) / ((1 / a.mass) + (1 / b.mass))
                const s2 = 1 - s1
                const C = 0.5
                const P = C * deltaTime

                if(dist < a.radius + b.radius){
                    a.velocity.qx += vdx * s1 * diff * C
                    a.velocity.qy += vdy * s1 * diff * C

                    a.position.qx += vdx * s1 * diff * P
                    a.position.qy += vdy * s1 * diff * P

                    b.velocity.qx -= vdx * s2 * diff * C
                    b.velocity.qy -= vdy * s2 * diff * C
                    
                    b.position.qx -= vdx * s2 * diff * P
                    b.position.qy -= vdy * s2 * diff * P
                }
            }
        }

        // Collide with walls
        const collidableRectWalls = Object.values(this.rectWalls)
        for(const object of collidableObjects){
            for(const rectWall of collidableRectWalls){
                const dx = rectWall.center.x - object.position.x
                const dy = rectWall.center.y - object.position.y

                const outerCollidingX = Math.abs(dx) < object.radius + rectWall.width / 2
                const outerCollidingY = Math.abs(dy) < object.radius + rectWall.height / 2
                const innerCollidingX = Math.abs(dx) < object.radius
                const innerCollidingY = Math.abs(dy) < object.radius

                const R = 0.5
                if(outerCollidingX && outerCollidingY){
                    if(innerCollidingX || innerCollidingY){
                        // Colliding with flat size
                        if(innerCollidingY){
                            object.position.qx = rectWall.center.x - Math.sign(dx) * (rectWall.width / 2 + object.radius)
                            object.velocity.qx *= -R
                        } else{
                            object.position.qy = rectWall.center.y - Math.sign(dy) * (rectWall.height / 2 + object.radius)
                            object.velocity.qy *= -R
                        }
                    } else{
                        // Colliding with corner
                        const cornerX = rectWall.center.x - Math.sign(dx) * rectWall.width / 2
                        const cornerY = rectWall.center.y - Math.sign(dy) * rectWall.width / 2
                        const cdx = cornerX - object.position.x
                        const cdy = cornerY - object.position.y
                        const dist = Math.sqrt(cdx * cdx + cdy * cdx)

                        if(dist < object.radius){
                            const vel = Math.sqrt(
                                object.velocity.x * 
                                object.velocity.x +
                                object.velocity.y * 
                                object.velocity.y
                            )
                            const cornerAngle = normalizeToPositiveRadians(Math.atan2(Math.sign(dy), Math.sign(dx)) + Math.PI)
                            const minAngle = cornerAngle - Math.PI / 4
                            const maxAngle = cornerAngle + Math.PI / 4
                            const angle = Math.max(minAngle, Math.min(maxAngle, 
                                normalizeToPositiveRadians(Math.atan2(cdy, cdx) + Math.PI)
                            ))

                            console.log({
                                cornerAngle: radiansToDegree(cornerAngle).toFixed(2),
                                minAngle: radiansToDegree(minAngle).toFixed(2),
                                maxAngle: radiansToDegree(maxAngle).toFixed(2),
                                angle: radiansToDegree(angle).toFixed(2),
                            })
                            const velEntryAngle = Math.atan2(object.velocity.y, object.velocity.y) + Math.PI
                            const angleDiff = radianDifference(angle, velEntryAngle)
                            const velExitAngle = angle - radianDifference(angle, velEntryAngle)

                            const diff = (object.radius - dist) / dist
    
                            object.position.qx = cornerX + Math.cos(angle) * object.radius
                            object.position.qy = cornerY + Math.sin(angle) * object.radius
                            // object.velocity.qx = Math.cos(velExitAngle) * vel
                            // object.velocity.qy = Math.cos(velExitAngle) * vel
                            // object.velocity.qx -= cdx * diff * R
                            // object.velocity.qy -= cdx * diff * R
                        }
                    }
                }
            }
        }

        // Apply velocity to position
        for(const object of objects){
            object.position.qx += object.velocity.qx * deltaTime
            object.position.qy += object.velocity.qy * deltaTime
        }

        for(const object of objects){
            object.velocity.flush()
            object.position.flush()
        }

        if(Date.now() - this.lastLog > this.options.logFrequency){
            this.lastLog = Date.now()
            this.log()
        }
    }

    log(){
        //
    }
}