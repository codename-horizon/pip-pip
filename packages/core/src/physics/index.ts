import { generateId } from "../lib/utils"

const MAX_DECIMALS = 2
const MD_Z = Math.pow(10, MAX_DECIMALS)

function trim(n: number){
    return Math.round(n * MD_Z) / MD_Z
}

export class Vector2{
    _x = 0
    _y = 0
    // previous
    px = 0
    py = 0
    // delta
    dx = 0
    dy = 0
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
        this.px = this._x
        this._x = this._qx = value
        this.dx = this._x - this.px
    }

    get y(){ return this._y }
    set y(value: number){
        this.py = this._y
        this._y = this._qy = value
        this.dy = this._y - this.py
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
        this.px = this.py = 0
        this.dx = this.dy = 0
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

export class PointPhysicsObject{
    id!: string
    
    position: Vector2 = new Vector2()
    velocity: Vector2 = new Vector2()
    
    smoothing = {
        position: new Vector2(),
        coefficient: 20,
    }
    
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
        if(typeof id !== "string"){
            this.id = generateId()
        }
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

    lastLog = Date.now()

    timeScale = 1

    constructor(options: Partial<PointPhysicsWorldOptions> = {}){
        this.options = {
            baseTps: 20,
            logFrequency: 10000,
            ...options,
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

    update(deltaMs: number){
        const baseMs = 1000 / this.options.baseTps
        const deltaTime =  (Math.max(1, deltaMs) / baseMs) * this.timeScale
        const objects = Object.values(this.objects)
        const collidable = Object.values(this.objects).filter(object => object.collision.enabled === true)

        for(const a of collidable){
            for(const b of collidable){
                if(a.id === b.id) continue
                if(!a.collision.enabled) continue
                if(!b.collision.enabled) continue

                const dx = (a.position.x - b.position.x)
                const dy = (a.position.y - b.position.y)
                const dist = Math.sqrt(dx * dx + dy * dy)
                const diff = ((a.radius + b.radius) - dist) / dist
                const s1 = (1 / a.mass) / ((1 / a.mass) + (1 / b.mass))
                const s2 = 1 - s1
                const C = 0.5
                const P = C * deltaTime

                if(dist < a.radius + b.radius){
                    a.velocity.qx += dx * s1 * diff * C
                    a.velocity.qy += dy * s1 * diff * C

                    a.position.qx += dx * s1 * diff * P
                    a.position.qy += dy * s1 * diff * P

                    b.velocity.qx -= dx * s2 * diff * C
                    b.velocity.qy -= dy * s2 * diff * C
                    
                    b.position.qx -= dx * s2 * diff * P
                    b.position.qy -= dy * s2 * diff * P
                }
            }
        }

        
        for(const object of objects){
            const airResistance = Math.pow(1 - object.airResistance, deltaTime)

            object.velocity.qx *= airResistance
            object.velocity.qy *= airResistance

            object.position.qx += object.velocity.x * deltaTime
            object.position.qy += object.velocity.y * deltaTime

            object.smoothing.position.qx += (object.position.x - object.smoothing.position.x) / (object.smoothing.coefficient * deltaTime)
            object.smoothing.position.qy += (object.position.y - object.smoothing.position.y) / (object.smoothing.coefficient * deltaTime)
        }

        for(const object of objects){
            object.velocity.flush()
            object.position.flush()
            object.smoothing.position.flush()
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