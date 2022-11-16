import { EventEmitter } from "../common/events"

export type KeyboardListenerEvent = {
    key: string,
}

export type KeyboardListenerEventMap = {
    down: KeyboardListenerEvent,
    up: KeyboardListenerEvent,
    blur: undefined,
    focus: undefined,
}

export class KeyboardListener extends EventEmitter<KeyboardListenerEventMap>{
    id: string
    element!: HTMLElement
    state: Record<string, boolean> = {}

    constructor(id = "Keyboard"){
        super(id)
        this.id = id
    }

    downHandler(e: KeyboardEvent){
        if(e.target !== this.element) return
        this.setState(e.code, true)
        this.emit("down", {
            key: e.code,
        })
        e.preventDefault()
    }

    upHandler(e: KeyboardEvent){
        this.setState(e.code, false)
        this.emit("up", {
            key: e.code,
        })
        e.preventDefault()
    }

    setState(id: string, state: boolean){
        this.state[id] = state
    }

    setTarget(element: HTMLElement){
        this.destroy()
        this.element = element
        this.element.addEventListener("keydown", this.downHandler.bind(this))
        window.addEventListener("keyup", this.upHandler.bind(this))
    }

    destroy(){
        super.destroy()
        if(typeof this.element !== "undefined"){
            this.element.removeEventListener("keydown", this.downHandler.bind(this))
            window.removeEventListener("keyup", this.upHandler.bind(this))
        }
    }
}