
import { defineComponent, onMounted, ref } from 'vue'
import { getRandomColor } from './utils'

import { KeyboardListener } from "@pip-pip/core/src/client/keyboard"
import { MouseListener } from "@pip-pip/core/src/client/mouse"
import { EventCollector } from '@pip-pip/core/src/common/events'
import { TILE_SIZE } from "@pip-pip/game/src/logic/constants"

const ZOOM_AMOUNT = 0.1

type Tile = [number, number]

type TileTypes = "walls"
type TileLayer<K extends TileTypes> = {
    type: K,
    color: string,
    tiles: Tile[],
}
type TileRecord = {
    [K in TileTypes]: TileLayer<K>
}
const tileTypes: TileTypes[] = ["walls"]

const toolTypes = ["walls", "points", "spawns"]

export default defineComponent({
    setup(props, ctx) {
        const keyboard = new KeyboardListener()
        const mouse = new MouseListener()
        const canvas = ref<HTMLCanvasElement>()
        const debug = ref({})

        const points: Record<string, Tile> = {}

        const tiles: TileRecord = {
            walls: {
                type: "walls",
                color: "blue",
                tiles: [
                    [0, 0], [2, 2],
                ]
            },
        }

        const centerTiles = () => {
            const allTiles = Object.values(tiles).reduce<Tile[]>((a, b) => a.concat(b.tiles), [])
            if(allTiles.length === 0) return
            let minX = Infinity
            let minY = Infinity
            let maxX = -Infinity
            let maxY = -Infinity
            for(const [x, y] of allTiles){
                if(x < minX) minX = x
                if(y < minY) minY = y
                if(x > maxX) maxX = x
                if(y > maxY) maxY = y
            }

            const centerX = Math.floor((minX + maxX) / 2) + 1
            const centerY = Math.floor((minY + maxY) / 2) + 1
            
            for(const tileset of Object.values(tiles)){
                for(const tileXY of tileset.tiles){
                    tileXY[0] -= centerX
                    tileXY[1] -= centerY
                }
            }

            console.log({centerX, centerY})
        }

        const getTileIndex = (type: TileTypes, x: number, y: number) => {
            return tiles[type].tiles.findIndex(([_x, _y]) => _x === x && _y === y)
        }

        const camera = ref({
            x: 0,
            y: 0,
            scale: 1,
        })

        function resetCameraView(){
            camera.value.x = window.innerWidth / 2
            camera.value.y = window.innerHeight / 2
            camera.value.scale = 1
        }

        const middleMouseCameraPos = {
            mouseX: 0, 
            mouseY: 0, 
            cameraX: 0, 
            cameraY: 0, 
        }

        onMounted(() => {
            if(typeof canvas.value === "undefined") throw new Error("Canvas not available!!!")
            mouse.setTarget(canvas.value)
            keyboard.setTarget(document.body)
            resetCameraView()

            // camera mechanics Dragging
            mouse.on("middleDragStart", (state) => {
                middleMouseCameraPos.mouseX = state.position.x
                middleMouseCameraPos.mouseY = state.position.y
                middleMouseCameraPos.cameraX = camera.value.x
                middleMouseCameraPos.cameraY = camera.value.y
            })

            mouse.on("middleUp", (state) => {
                if(state.middle.dragging === false){
                    resetCameraView()
                }
            })

            mouse.on("wheel", ({ y }) => {
                camera.value.scale *= 1 - Math.sign(y) * ZOOM_AMOUNT
            })

            mouse.on("move", (state) => {
                if(state.middle.dragging){
                    camera.value.x = middleMouseCameraPos.cameraX + state.position.x - middleMouseCameraPos.mouseX
                    camera.value.y = middleMouseCameraPos.cameraY + state.position.y - middleMouseCameraPos.mouseY
                }
            })
            
            function loop(){
                if(typeof canvas.value === "undefined") throw new Error("Canvas not available!!!")
                const context = canvas.value.getContext("2d")
                if(context === null) throw new Error("Canvas context not available!!!")
                requestAnimationFrame(loop)

                canvas.value.width = window.innerWidth
                canvas.value.height = window.innerHeight

                context.clearRect(0, 0, canvas.value.width, canvas.value.height)

                const ORIGIN_SIZE = 10
                const TILE_SIZE_SCALE = TILE_SIZE * camera.value.scale

                {
                    context.fillStyle = "red"
                    context.fillRect(
                        camera.value.x - ORIGIN_SIZE / 2,
                        camera.value.y - ORIGIN_SIZE / 2,
                        ORIGIN_SIZE,
                        ORIGIN_SIZE,
                    )
                }

                for(const tileSet of Object.values(tiles)){
                    context.fillStyle = tileSet.color
                    for(const [x, y] of tileSet.tiles){
                        const px = camera.value.x + x * TILE_SIZE_SCALE
                        const py = camera.value.y + y * TILE_SIZE_SCALE
                        context.fillRect(px, py, TILE_SIZE_SCALE, TILE_SIZE_SCALE)
                    }
                }

                {
                    context.fillStyle = "rgba(255, 0, 0, 0.2)"
                    const x = Math.floor((mouse.state.position.x - camera.value.x) / TILE_SIZE_SCALE)
                    const y = Math.floor((mouse.state.position.y - camera.value.y) / TILE_SIZE_SCALE)
                    const px = camera.value.x + x * TILE_SIZE_SCALE
                    const py = camera.value.y + y * TILE_SIZE_SCALE
                    context.fillRect(px, py, TILE_SIZE_SCALE, TILE_SIZE_SCALE)

                    if(mouse.state.left.down){
                        const tileIndex = getTileIndex("walls", x, y)
                        if(tileIndex === -1){
                            tiles.walls.tiles.push([x, y])
                        }
                    }
                    if(mouse.state.right.down){
                        const tileIndex = getTileIndex("walls", x, y)
                        if(tileIndex !== -1){
                            tiles.walls.tiles.splice(tileIndex, 1)
                        }
                    }
                }
            }

            loop()
        })

        return {
            canvas,
            camera,
            debug,
            centerTiles,
        }
    },
})