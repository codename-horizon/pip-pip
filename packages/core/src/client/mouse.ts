import { EventEmitter } from "../common/events"

export type MousePosition = { x: number, y: number }

export type MouseButtonState = {
    down: boolean,
    dragging: boolean,
    target: undefined | null | HTMLElement | EventTarget,
}

export type MouseState = {
    left: MouseButtonState,
    middle: MouseButtonState,
    right: MouseButtonState,
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

    leftDown: MouseState,
    leftUp: MouseState,
    leftDragStart: MouseState,
    leftDragEnd: MouseState,

    middleDown: MouseState,
    middleUp: MouseState,
    middleDragStart: MouseState,
    middleDragEnd: MouseState,

    rightDown: MouseState,
    rightUp: MouseState,
    rightDragStart: MouseState,
    rightDragEnd: MouseState,

    wheel: {
        state: MouseState,
        x: number,
        y: number,
    },

    blur: undefined,
    focus: undefined,
}

export class MouseListener extends EventEmitter<MouseListenerEventMap>{
    id: string
    element!: HTMLElement
    state: MouseState = {
        left: {
            down: false,
            dragging: false,
            target: null,
        },
        middle: {
            down: false,
            dragging: false,
            target: null,
        },
        right: {
            down: false,
            dragging: false,
            target: null,
        },
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

    preventHandler(e: Event){
        e.preventDefault()
    }

    wheelHandler(e: WheelEvent){
        this.emit("wheel", {
            state: this.state,
            x: e.deltaX,
            y: e.deltaY,
        })
        this.preventHandler(e)
    }
    
    mouseHandler(e: MouseEvent){
        // Ignore inputs
        const t = e.target as HTMLElement
        if(t.tagName === "INPUT" || t.tagName === "TEXTAREA"){
            return
        }

        if(e.type === "mousedown"){
            if(e.button === 0){
                this.state.left.down = true
                this.state.left.dragging = false
                this.state.left.target = e.target
                this.emit("down", this.state)
                this.emit("leftDown", this.state)
            }
            if(e.button === 1){
                this.state.middle.down = true
                this.state.middle.dragging = false
                this.state.middle.target = e.target
                this.emit("down", this.state)
                this.emit("middleDown", this.state)
            }
            if(e.button === 2){
                this.state.right.down = true
                this.state.right.dragging = false
                this.state.right.target = e.target
                this.emit("down", this.state)
                this.emit("rightDown", this.state)
            }
        }
        
        if(e.type === "mousemove"){
            this.emit("move", this.state)
            if(this.state.left.down === true && this.state.left.dragging === false){
                this.state.left.dragging = true
                this.emit("dragStart", this.state)
                this.emit("leftDragStart", this.state)
            }
            if(this.state.middle.down === true && this.state.middle.dragging === false){
                this.state.middle.dragging = true
                this.emit("dragStart", this.state)
                this.emit("middleDragStart", this.state)
            }
            if(this.state.right.down === true && this.state.right.dragging === false){
                this.state.right.dragging = true
                this.emit("dragStart", this.state)
                this.emit("rightDragStart", this.state)
            }
        }

        if(e.type === "mouseup"){
            if(e.button === 0){
                this.state.left.down = false
                this.emit("up", this.state)
                this.emit("leftUp", this.state)
                if(this.state.left.dragging === true){
                    this.state.left.dragging = false
                    this.emit("dragEnd", this.state)
                    this.emit("leftDragEnd", this.state)
                }
            }
            if(e.button === 1){
                this.state.middle.down = false
                this.emit("up", this.state)
                this.emit("middleUp", this.state)
                if(this.state.middle.dragging === true){
                    this.state.middle.dragging = false
                    this.emit("dragEnd", this.state)
                    this.emit("middleDragEnd", this.state)
                }
            }
            if(e.button === 2){
                this.state.right.down = false
                this.emit("up", this.state)
                this.emit("rightUp", this.state)
                if(this.state.right.dragging === true){
                    this.state.right.dragging = false
                    this.emit("dragEnd", this.state)
                    this.emit("rightDragEnd", this.state)
                }
            }
        }

        const x = e.x
        const y = e.y

        this.state.position.previous.x = this.state.position.x
        this.state.position.previous.y = this.state.position.y

        this.state.position.x = x
        this.state.position.y = y

        this.preventHandler(e)
    }

    setTarget(element: HTMLElement){
        this.destroy()
        this.element = element
        this.element.addEventListener("mousedown", this.mouseHandler.bind(this))
        this.element.addEventListener("mousemove", this.mouseHandler.bind(this))
        this.element.addEventListener("contextmenu", this.preventHandler.bind(this))
        this.element.addEventListener("wheel", this.wheelHandler.bind(this))
        window.addEventListener("mouseup", this.mouseHandler.bind(this))
    }

    destroy(){
        super.destroy()
        if(typeof this.element !== "undefined"){
            this.element.removeEventListener("mousedown", this.mouseHandler.bind(this))
            this.element.removeEventListener("mousemove", this.mouseHandler.bind(this))
            this.element.removeEventListener("contextmenu", this.preventHandler.bind(this))
            this.element.removeEventListener("wheel", this.wheelHandler.bind(this))
            window.removeEventListener("mouseup", this.mouseHandler.bind(this))
        }
    }
}