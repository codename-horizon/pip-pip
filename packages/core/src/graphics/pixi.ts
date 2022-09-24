import * as PIXI from "pixi.js"
import { Viewport as PIXIViewport } from "pixi-viewport"

export class PixiGraphics{
    app!: PIXI.Application
    viewport!: PIXIViewport
    container!: HTMLDivElement

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
}