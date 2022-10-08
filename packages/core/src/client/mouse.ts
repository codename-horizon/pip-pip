import { EventEmitter } from "../common/events"

export type MousePosition = { x: number, y: number }

export type MouseState = {
    down: boolean,
    dragging: boolean,
    target: undefined | null | HTMLElement | EventTarget,
    position: MousePosition & {
        previous: MousePosition,
    }
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
        position: {
            x: 0,
            y: 0,
            previous: {
                x: 0,
                y: 0,
            },
        },
    }

    constructor(id = "Mouse"){
        super(id)
        this.id = id
    }
    
    mouseHandler(e: MouseEvent){
        if(e.type === "mousedown"){
            this.state.down = true
            this.state.dragging = false
            this.state.target = e.target
        }

        if(e.type === "mousemove"){
            if(this.state.down){
                this.state.dragging = true
            }
        }
        
        if(e.type === "mouseup"){
            this.state.down = false
            this.state.dragging = false
        }

        const x = e.x
        const y = e.y

        this.state.position.previous.x = this.state.position.x
        this.state.position.previous.y = this.state.position.y

        this.state.position.x = x
        this.state.position.y = y
    }

    setTarget(element: HTMLElement){
        this.destroy()
        this.element = element
        this.element.addEventListener("mousedown", this.mouseHandler.bind(this))
        this.element.addEventListener("mousemove", this.mouseHandler.bind(this))
        window.addEventListener("mouseup", this.mouseHandler.bind(this))
    }

    destroy(){
        super.destroy()
        if(typeof this.element !== "undefined"){
            this.element.removeEventListener("mousedown", this.mouseHandler.bind(this))
            this.element.removeEventListener("mousemove", this.mouseHandler.bind(this))
            window.removeEventListener("mouseup", this.mouseHandler.bind(this))
        }
    }
}