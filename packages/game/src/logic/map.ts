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

export class GameMap{
    checkpoints: PointRadius[] = []
    spawns: PointRadius[] = []
}

export type JSONMapSource = {
    wallTiles: number[][],
    spawnTiles: number[][],
}

export class JSONGameMap extends GameMap{
    source: JSONMapSource
    constructor(source: JSONMapSource){
        super()
        this.source = source

        for(const [x, y] of this.source.spawnTiles){
            this.spawns.push(new PointRadius(
                x * TILE_SIZE,
                y * TILE_SIZE,
                SPAWN_DIAMETER / 2,
            ))
        }
    }
}