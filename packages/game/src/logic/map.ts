import { PointPhysicsRectWall } from "@pip-pip/core/src/physics"
import { PipPipGame } from "."
import { TILE_SIZE, SPAWN_DIAMETER } from "./constants"

export class PointRadius{
    x: number
    y: number
    radius: number
    constructor(x: number, y: number, radius: number){
        this.x = x
        this.y = y
        this.radius = radius
    }
}

export class PipGameMap{
    id: string
    rectWalls: PointPhysicsRectWall[] = []
    checkpoints: PointRadius[] = []
    spawns: PointRadius[] = []

    constructor(id: string){
        this.id = id
    }
}

export type JSONMapSource = {
    wallTiles: number[][],
    spawnTiles: number[][],
    wallSegments: number[][],
}

export class JSONPipGameMap extends PipGameMap{
    source: JSONMapSource
    constructor(id: string, source: JSONMapSource){
        super(id)
        this.source = source

        for(const [x, y] of this.source.spawnTiles){
            this.spawns.push(new PointRadius(
                x * TILE_SIZE,
                y * TILE_SIZE,
                SPAWN_DIAMETER / 2,
            ))
        }

        for(const [x, y] of this.source.wallTiles){
            const rectWall = new PointPhysicsRectWall()
            rectWall.center.x = x * TILE_SIZE
            rectWall.center.y = y * TILE_SIZE
            rectWall.width = TILE_SIZE
            rectWall.height = TILE_SIZE
            this.rectWalls.push(rectWall)
        }
    }
}