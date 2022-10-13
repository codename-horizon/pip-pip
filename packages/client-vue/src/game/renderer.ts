import { radianDifference } from "@pip-pip/core/src/math"
import { PipPipGame } from "@pip-pip/game/src/logic"
import { PipPlayer } from "@pip-pip/game/src/logic/player"
import * as PIXI from "pixi.js"
import { GameContext } from "."
import { assetLoader } from "./assets"
import { client } from "./client"

import { CRTFilter, GlitchFilter, PixelateFilter, BulgePinchFilter } from 'pixi-filters'
import { DisplacementFilter } from "@pixi/filter-displacement"
import { Point } from "pixi.js"
import { SHIP_DAIMETER, TILE_SIZE } from "@pip-pip/game/src/logic/constants"
import { PointPhysicsRectWall } from "@pip-pip/core/src/physics"

const SMOOTHING = {
    CAMERA_MOVEMENT: 5,
    CLIENT_PLAYER_MOVEMENT: 1,
    PLAYER_MOVEMENT: 2,
    PLAYER_ROTATION: 1,
    MAX_PLAYER_DISTANCE: 250,
}

export const STAR_BG = {
    COUNT: 200,
    MIN_Z: 5,
    MAX_Z: 10,
    MAX_SCALE: 1,
    MIN_SCALE: 0.25,
    EFFECT: 1,
}

export class StarGraphic {
    sprite: PIXI.Sprite
    z = 0

    constructor(sprite: PIXI.Sprite){
        this.sprite = sprite
        sprite.anchor.set(0.5)
        this.setRandomZ()
    }

    setRandomZ(){
        const z = STAR_BG.MIN_Z + Math.random() * (STAR_BG.MAX_Z - STAR_BG.MIN_Z)
        this.setZ(z)
    }

    get zRatio(){
        return (this.z - STAR_BG.MIN_Z) / (STAR_BG.MAX_Z - STAR_BG.MIN_Z)
    }

    setZ(n: number){
        this.z = n
        const scale = STAR_BG.MIN_SCALE + (1 - this.zRatio) * (STAR_BG.MAX_SCALE - STAR_BG.MIN_SCALE)
        this.sprite.scale.set(scale)
        this.sprite.rotation = Math.random() * Math.PI
    }
}

export class RectWallGraphic { 
    id: string
    rectWall: PointPhysicsRectWall
    sprite: PIXI.Sprite

    constructor(rectWall: PointPhysicsRectWall, texture = "tile_default"){
        this.id = rectWall.id
        this.rectWall = rectWall

        const spriteTexture = assetLoader.get(texture)
        this.sprite = new PIXI.Sprite(spriteTexture)
        this.sprite.anchor.set(0.5)
        this.sprite.width = TILE_SIZE
        this.sprite.height = TILE_SIZE
        this.sprite.position.x = rectWall.center.x
        this.sprite.position.y = rectWall.center.y
    }
}

export class PlayerGraphic {
    id: string
    player: PipPlayer

    container: PIXI.Container = new PIXI.Container()
    
    shipContainer: PIXI.Container = new PIXI.Container()
    shipSprite?: PIXI.Sprite

    constructor(player: PipPlayer){
        this.id = player.id
        this.player = player

        this.container.addChild(this.shipContainer)
    }

    updateShip(){
        if(typeof this.shipSprite !== "undefined"){
            this.shipContainer.removeChild(this.shipSprite)
        }
        const texture = assetLoader.get(this.player.shipType.texture)
        this.shipSprite = new PIXI.Sprite(texture)
        this.shipSprite.anchor.set(0.5)
        this.shipSprite.position.set(0)
        this.shipSprite.rotation = Math.PI / 2
        this.shipSprite.width = SHIP_DAIMETER
        this.shipSprite.height = SHIP_DAIMETER
        this.shipContainer.addChild(this.shipSprite)
    }
}

export class PipPipRenderer{
    app: PIXI.Application
    game: PipPipGame

    stars: StarGraphic[] = []
    starsContainer = new PIXI.Container()

    viewportContainer = new PIXI.Container()
    playersContainer = new PIXI.Container()

    mapBackgroundContainer = new PIXI.Container()
    mapForegroundContainer = new PIXI.Container()

    players: Record<string, PlayerGraphic> = {}
    rectWalls: RectWallGraphic[] = []

    container?: HTMLDivElement

    crtFilter = new CRTFilter()
    glitchFilter = new GlitchFilter()
    pixelateFilter = new PixelateFilter()
    buldgePinchFilter = new BulgePinchFilter()
    
    displacementSprite: PIXI.Sprite
    displacementFilter: DisplacementFilter

    camera = {
        position: {
            x: 0, y: 0,
        },
        target: {
            x: 0, y: 0,
        },
        scale: 1,
    }

    constructor(game: PipPipGame){
        this.app = new PIXI.Application({ resizeTo: window, backgroundColor: 0x150E12 })
        this.app.ticker.stop()

        this.app.stage.addChild(this.viewportContainer)
        
        this.viewportContainer.addChild(this.starsContainer)
        this.viewportContainer.addChild(this.mapBackgroundContainer)
        this.viewportContainer.addChild(this.playersContainer)
        this.viewportContainer.addChild(this.mapForegroundContainer)

        this.crtFilter.enabled = true
        this.crtFilter.curvature = 100
        this.glitchFilter.enabled = true
        this.glitchFilter.resolution = 5
        this.glitchFilter.offset = 25
        this.glitchFilter.slices = 10
        this.glitchFilter.red = new Point(5, 5)
        this.glitchFilter.blue = new Point(2, 1)
        this.glitchFilter.green = new Point(-1, -4)
        this.pixelateFilter.enabled = true
        this.buldgePinchFilter.enabled = true
        this.buldgePinchFilter.strength = 0.05
        this.buldgePinchFilter.center = new Point(
            0.5, 
            0.5,
        )

        const displacementTexture = assetLoader.get("displacement_map")
        this.displacementSprite = new PIXI.Sprite(displacementTexture)
        this.displacementSprite.anchor.set(0.5)
        this.displacementFilter = new DisplacementFilter(this.displacementSprite)
        this.displacementFilter.enabled = true
        this.app.stage.addChild(this.displacementSprite)

        this.app.stage.filters = [
            // this.crtFilter,
            // this.glitchFilter,
            // this.pixelateFilter,
            this.buldgePinchFilter,
            // this.displacementFilter,
        ]

        // initialize stars
        for(let i = 0; i < STAR_BG.COUNT; i++){
            const starTexture = assetLoader.get("star_1")
            if(typeof starTexture === "undefined") continue
            const star = new PIXI.Sprite(starTexture)
            const graphic = new StarGraphic(star)

            const angle = Math.random() * Math.PI * 2
            const mag = Math.random() * this.getViewportRadius()
            star.position.x = Math.cos(angle) * mag
            star.position.y = Math.sin(angle) * mag

            this.starsContainer.addChild(star)
            this.stars.push(graphic)
        }

        this.game = game

        this.game.events.on("addPlayer", ({ player }) => {
            const graphic = new PlayerGraphic(player)
            this.players[player.id] = graphic
            this.playersContainer.addChild(graphic.container)
        })

        this.game.events.on("playerSetShip", ({ player }) => {
            this.players[player.id]?.updateShip()
        })

        this.game.events.on("removePlayer", ({ player }) => {
            if(player.id in this.players){
                const graphic = this.players[player.id]
                delete this.players[player.id]
                this.playersContainer.removeChild(graphic.container)
            }
        })

        this.updateMapGraphics()
        this.game.events.on("setMap", () => {
            this.updateMapGraphics()
        })
    }

    updateMapGraphics(){
        for(const graphic of this.rectWalls){
            this.mapBackgroundContainer.removeChild(graphic.sprite)
        }

        this.rectWalls = []

        for(const rectWall of this.game.map.rectWalls){
            const graphic = new RectWallGraphic(rectWall)
            this.mapBackgroundContainer.addChild(graphic.sprite)

            this.rectWalls.push(graphic)
        }
    }

    getViewportRadius(){
        return Math.sqrt(this.app.view.width * this.app.view.width + this.app.view.height * this.app.view.height) / 2
    }

    mount(container: HTMLDivElement){
        this.container = container
        this.container.appendChild(this.app.view)
    }

    render(context: GameContext, deltaMs: number){
        const deltaTime = deltaMs / this.game.deltaMs
        const timeDiff = Date.now() - this.game.lastTick
        const lerp = timeDiff / this.game.deltaMs

        // camera
        const cameraSmoothing = deltaTime / SMOOTHING.CAMERA_MOVEMENT

        // update players
        const players = Object.values(this.players)
        const playerRotationSmoothing = deltaTime / SMOOTHING.PLAYER_ROTATION
        const playerMovementSmoothing = deltaTime / SMOOTHING.PLAYER_MOVEMENT
        const clientPlayerMovementSmoothing = deltaTime / SMOOTHING.CLIENT_PLAYER_MOVEMENT
        for(const graphic of players){
            const isClient = graphic.player.id === client.connectionId
            const movementSmoothing = isClient ? clientPlayerMovementSmoothing : playerMovementSmoothing

            const tx = graphic.player.ship.physics.position.x + graphic.player.ship.physics.velocity.x * lerp
            const ty = graphic.player.ship.physics.position.y + graphic.player.ship.physics.velocity.y * lerp
            
            const dx = tx - graphic.container.position.x
            const dy = ty - graphic.container.position.y

            if(dx * dx + dy + dy > SMOOTHING.MAX_PLAYER_DISTANCE * SMOOTHING.MAX_PLAYER_DISTANCE){
                graphic.container.position.x = tx
                graphic.container.position.y = ty
            } else{
                graphic.container.position.x += dx * movementSmoothing
                graphic.container.position.y += dy * movementSmoothing
            }


            graphic.container.rotation += radianDifference(graphic.container.rotation, graphic.player.ship.rotation) * playerRotationSmoothing

            if(isClient && typeof graphic.player.spectating === "undefined"){
                this.camera.target.x = tx
                this.camera.target.y = ty
            }
        }

        // Compute camera
        const cameraDeltaX = (this.camera.target.x - this.camera.position.x) * cameraSmoothing
        const cameraDeltaY = (this.camera.target.y - this.camera.position.y) * cameraSmoothing
        this.camera.position.x += cameraDeltaX
        this.camera.position.y += cameraDeltaY
        
        // Compute the filters
        this.buldgePinchFilter.radius = this.getViewportRadius()
        this.displacementSprite.position.x = this.app.view.width / 2
        this.displacementSprite.position.y = this.app.view.height / 2
        // set displacement scale

        // Center viewport
        this.viewportContainer.position.x = this.app.view.width / 2 - this.camera.position.x
        this.viewportContainer.position.y = this.app.view.height / 2 - this.camera.position.y

        // Compute stars
        const starMaxDist = this.getViewportRadius()
        for(const star of this.stars){
            star.sprite.position.x += cameraDeltaX * star.zRatio * star.zRatio * STAR_BG.EFFECT
            star.sprite.position.y += cameraDeltaY * star.zRatio * star.zRatio * STAR_BG.EFFECT

            const dx = this.camera.position.x - star.sprite.position.x
            const dy = this.camera.position.y - star.sprite.position.y
            const dist2 = dx * dx + dy * dy
            if(dist2 > starMaxDist * starMaxDist){
                const angle = Math.random() * Math.PI * 2
                star.sprite.position.x = this.camera.position.x + Math.cos(angle) * starMaxDist
                star.sprite.position.y = this.camera.position.y + Math.sin(angle) * starMaxDist
                star.setRandomZ()
            }
        }

        this.app.render()
    }
}