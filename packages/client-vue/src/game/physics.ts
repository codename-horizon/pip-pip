import { generateId } from "@pip-pip/core/src/common"

export class Vector2{
    _x = 0
    _y = 0
    // previous
    px = 0
    py = 0
    // delta
    dx = 0
    dy = 0

    constructor(x?: number, y?: number){
        if(typeof x === "number" && typeof y === "number"){
            this.set(x, y)
        }
    }

    get x(){ return this._x }
    get y(){ return this._y }

    set x(value: number){
        this.px = this._x
        this._x = value
        this.dx = this._x - this.px
    }

    set y(value: number){
        this.py = this._y
        this._y = value
        this.dy = this._y - this.py
    }

    set(x: number, y: number){
        this.x = x
        this.y = y
    }

    reset(){
        this._x = this._y = 0
        this.px = this.py = 0
        this.dx = this.dy = 0
    }
}

export class PointPhysicsObject{
    id = generateId()
    channel: number = 0
    position: Vector2 = new Vector2()
    velocity: Vector2 = new Vector2()

    world?: PointPhysicsWorld

    dead = false

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
}

export class PointPhysicsWorld{
    options: PointPhysicsWorldOptions

    objects: Record<string, PointPhysicsObject> = {}

    lastUpdate = Date.now()

    constructor(options: Partial<PointPhysicsWorldOptions> = {}){
        this.options = {
            baseTps: 20,
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
}