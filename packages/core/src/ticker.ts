import { EventEmitter } from "./events"

export type TickerEventMap = {
    tick: { deltaMs: number },
    start: undefined,
    stop: undefined,
}

export class Ticker extends EventEmitter<TickerEventMap>{
    tps = 20
    useRequestAnimationFrame = false
    lastUpdate = Date.now()
    ticking = false
    tickInterval?: NodeJS.Timer

    constructor(tps = 20, tickerId = "Ticker"){
        super(tickerId)
        if(typeof tps === "number"){
            this.tps = tps
            if(tps === 60){
                this.useRequestAnimationFrame = true
            }
        }
    }

    setTps(tpsOrUseRaf: number | true){
        let restart = false
        if(this.ticking){
            restart = true
            this.stopTick()
        }
        
        if(typeof tpsOrUseRaf === "number"){
            this.tps = tpsOrUseRaf
            this.useRequestAnimationFrame = false
        } else if(typeof tpsOrUseRaf === "boolean"){
            this.useRequestAnimationFrame = tpsOrUseRaf
            if(tpsOrUseRaf){
                this.tps = 60
            }
        } else {
            throw Error("tpsOrRaf invalid")
        }
        
        if(restart){
            this.startTick()
        }
    }

    tick(){
        const now = Date.now()
        const deltaMs = now - this.lastUpdate
        this.emit("tick", { deltaMs })
        this.lastUpdate = now
    }

    startTick(){
        this.stopTick()
        this.lastUpdate = Date.now() - 1000 / this.tps
        this.ticking = true
        if(this.useRequestAnimationFrame && typeof requestAnimationFrame !== "undefined"){
            const loop = () => {
                if(this.ticking){
                    requestAnimationFrame(loop)
                    this.tick()
                }
            }
            loop()
        } else{
            this.tickInterval = setInterval(() => {
                this.tick()
            }, 1000 / this.tps)
        }
        this.emit("start")
    }

    stopTick(){
        if(this.ticking){
            if(typeof this.tickInterval !== "undefined"){
                clearInterval(this.tickInterval)
            }
            this.ticking = false
            this.emit("stop")
        }
    }
}