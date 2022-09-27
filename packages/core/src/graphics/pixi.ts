import * as PIXI from "pixi.js"
import { Viewport as PIXIViewport } from "pixi-viewport"
import { generateId } from "../common"

export type PixiGraphicRenderCallback<
    T extends Record<string, unknown> = Record<string, unknown>,
    K extends Record<string, PIXI.DisplayObject> = Record<string, PIXI.DisplayObject>> = (params: {
    deltaMs: number, 
    state: T,
    objects: K,
    displayObject: PIXI.DisplayObject,
}) => void

export class PixiGraphicsDrawable<
    T extends Record<string, unknown> = Record<string, unknown>,
    K extends Record<string, PIXI.DisplayObject> = Record<string, PIXI.DisplayObject>>{
    id: string = generateId()
    state: T = {} as T
    objects: K = {} as K
    displayObject!: PIXI.DisplayObject

    renderer?: PixiGraphicsRenderer

    renderCallback!: PixiGraphicRenderCallback<T, K>

    constructor(){
        //
    }

    setDisplayObject(callback: (params: {state: T, objects: K}) => PIXI.DisplayObject){
        this.displayObject = callback({
            state: this.state,
            objects: this.objects,
        })
    }

    setRenderCallback(callback: PixiGraphicRenderCallback<T, K>){
        this.renderCallback = callback
    }

    setRenderer(grapihcs: PixiGraphicsRenderer){
        this.renderer = grapihcs
    }
}

export class PixiGraphicsRenderer{
    app!: PIXI.Application
    viewport!: PIXIViewport
    container!: HTMLDivElement

    drawables: Record<string, PixiGraphicsDrawable> = {}

    constructor(){
        //
    }

    setContainer(container: HTMLDivElement){
        if(typeof container === "undefined") throw Error("canvas is undefined")
        this.container = container
        this.app = new PIXI.Application({ resizeTo: window })
        this.app.ticker.stop()
        this.viewport = new PIXIViewport()
        this.app.stage.addChild(this.viewport)

        this.container.appendChild(this.app.view)
    }

    addDrawable(graphic: PixiGraphicsDrawable){
        if(graphic.id in this.drawables){
            this.removeDrawable(this.drawables[graphic.id])
        }
        this.drawables[graphic.id] = graphic
        this.app.stage.addChild(graphic.displayObject)
    }

    removeDrawable(graphic: PixiGraphicsDrawable) {
        if(graphic.id in this.drawables){
            this.app.stage.removeChild(graphic.displayObject)
            delete this.drawables[graphic.id]
        }
    }
}