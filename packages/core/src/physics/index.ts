import { generateId } from "../lib/utils"

const EXPONENTIAL_COEF = 0.9696969

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
    includeChannels?: number[],
    excludeChannels?: number[],
    includeObjects?: PointPhysicsObject[],
    excludeObjects?: PointPhysicsObject[],
}

export class PointPhysicsObject{
    id!: string
    
    position: Vector2 = new Vector2()
    velocity: Vector2 = new Vector2()

    collisionChannels: number[] = [0]
    collisionOptions: CollisionOptions = {}

    radius = 25
    mass = 100
    airResistance = 0.001

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

    lastTick = Date.now()
    lastLog = Date.now()

    timeScale = 1

    constructor(options: Partial<PointPhysicsWorldOptions> = {}){
        this.options = {
            baseTps: 20,
            logFrequency: 250,
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

    updateTick(){
        this.lastTick = Date.now()
    }

    update(deltaMs?: number){
        if(typeof deltaMs === "undefined"){
            deltaMs = Date.now() - this.lastTick
        }
        const baseMs = 1000 / this.options.baseTps
        const deltaCoef =  (Math.max(1, deltaMs) / baseMs) * this.timeScale
        this.updateTick()

        for(const id in this.objects){
            const object = this.objects[id]

            const airResistance = 1 - (object.airResistance * deltaCoef) / EXPONENTIAL_COEF

            object.velocity.qx *= airResistance
            object.velocity.qy *= airResistance

            object.position.qx += object.velocity.x * deltaCoef
            object.position.qy += object.velocity.y * deltaCoef
        }

        for(const id in this.objects){
            const object = this.objects[id]

            object.velocity.flush()
            object.position.flush()
        }

        if(Date.now() - this.lastLog > this.options.logFrequency){
            this.lastLog = Date.now()
            console.log(deltaMs, deltaCoef)
        }
    }
}