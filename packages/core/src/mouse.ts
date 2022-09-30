import { EventEmitter } from "./events"

export type MouseState = {
    down: boolean,
    dragging: boolean,
    target: undefined | null | HTMLElement,
}

export type MouseListenerEventMap = {
    down: MouseState,
    up: MouseState,
    move: MouseState,
    dragStart: MouseState,
    dragEnd: MouseState,
    blur: undefined,
    focus: undefined,
}

export class MouseListener extends EventEmitter<MouseListenerEventMap>{
    id: string
    element!: HTMLElement
    state: MouseState = {
        down: false,
        dragging: false,
        target: null,
    }

    constructor(id = "Mouse"){
        super(id)
        this.id = id
    }

    downHandler(e: MouseEvent){
        if(e.target !== this.element) return
        this.setState(e.code, true)
        this.emit("down", {
            key: e.code,
        })
    }

    upHandler(e: MouseEvent){
        this.setState(e.code, false)
        this.emit("up", {
            key: e.code,
        })
    }

    setTarget(element: HTMLElement){
        this.off()
        this.element = element
        this.element.addEventListener("keydown", this.downHandler.bind(this))
        window.addEventListener("keyup", this.upHandler.bind(this))
    }

    off(){
        if(typeof this.element !== "undefined"){
            this.element.removeEventListener("keydown", this.downHandler.bind(this))
            window.removeEventListener("keyup", this.upHandler.bind(this))
        }
    }
}