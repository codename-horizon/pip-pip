import { PointPhysicsObject } from "@pip-pip/core/src/physics"

import { Ship } from "./ship"

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

    ping = 0

    constructor(id: string){
        this.id = id
        this.physics.mass = 500
        this.physics.airResistance = 0.1
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