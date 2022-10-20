import { PointPhysicsRectWall, PointPhysicsSegmentWall } from "@pip-pip/core/src/physics"
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

export type PipGameTile = {
    x: number, y: number,
    texture: string,
}

export class PipGameMap{
    id: string
    rectWalls: PointPhysicsRectWall[] = []
    segWalls: PointPhysicsSegmentWall[] = []
    checkpoints: PointRadius[] = []
    spawns: PointRadius[] = []
    tiles: PipGameTile[] = []

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
    wallSegmentTiles: number[][],
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
            const inSegmentWalls = this.source.wallSegmentTiles.find(t => t[0] === x && t[1] === y)
            this.tiles.push({
                x: x * TILE_SIZE,
                y: y * TILE_SIZE,
                texture: inSegmentWalls ? "tile_default" : "tile_hidden",
            })
            compare(x * TILE_SIZE, y * TILE_SIZE)
        }

        for(const [sx, sy, ex, ey] of this.source.wallSegments){
            const segWall = new PointPhysicsSegmentWall(undefined, 
                sx * TILE_SIZE, 
                sy * TILE_SIZE, 
                ex * TILE_SIZE, 
                ey * TILE_SIZE,
            )
            segWall.radius = TILE_SIZE / 2
            this.segWalls.push(segWall)
        }

        this.bounds.min.x = minX - TILE_SIZE / 2
        this.bounds.max.x = maxX + TILE_SIZE / 2
        this.bounds.min.y = minY - TILE_SIZE / 2
        this.bounds.max.y = maxY + TILE_SIZE / 2
    }
}