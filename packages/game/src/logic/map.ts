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

export const PIP_MAP_DEFAULT_BOUNDS = 1000

export type PipGameMapBounds = {
    min: {
        x: number, y: number,
    },
    max: {
        x: number, y: number,
    },
}

export class PipGameMap{
    id: string
    rectWalls: PointPhysicsRectWall[] = []
    checkpoints: PointRadius[] = []
    spawns: PointRadius[] = []

    bounds: PipGameMapBounds = {
        min: {
            x: -PIP_MAP_DEFAULT_BOUNDS,
            y: -PIP_MAP_DEFAULT_BOUNDS,
        },
        max: {
            x: PIP_MAP_DEFAULT_BOUNDS,
            y: PIP_MAP_DEFAULT_BOUNDS,
        },
    }

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

        let minX = Infinity
        let maxX = -Infinity
        let minY = Infinity
        let maxY = -Infinity

        const compare = (x: number, y: number) => {
            if(x < minX) minX = x
            if(x > maxX) maxX = x
            if(y < minY) minY = y
            if(y > maxY) maxY = y
        }

        for(const [x, y] of this.source.spawnTiles){
            this.spawns.push(new PointRadius(
                x * TILE_SIZE,
                y * TILE_SIZE,
                SPAWN_DIAMETER / 2,
            ))
            compare(x * TILE_SIZE, y * TILE_SIZE)
        }

        for(const [x, y] of this.source.wallTiles){
            const rectWall = new PointPhysicsRectWall()
            rectWall.center.x = x * TILE_SIZE
            rectWall.center.y = y * TILE_SIZE
            rectWall.width = TILE_SIZE
            rectWall.height = TILE_SIZE
            this.rectWalls.push(rectWall)
            compare(x * TILE_SIZE, y * TILE_SIZE)
        }

        this.bounds.min.x = minX - TILE_SIZE / 2
        this.bounds.max.x = maxX + TILE_SIZE / 2
        this.bounds.min.y = minY - TILE_SIZE / 2
        this.bounds.max.y = maxY + TILE_SIZE / 2

        console.log(this.bounds)
    }
}