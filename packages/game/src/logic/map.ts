import { PipPipGame } from "."

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
    game: PipPipGame
    
    checkpoints: PointRadius[] = []
    spawns: PointRadius[] = []

    constructor(game: PipPipGame){
        this.game = game
    }

    setup(){
        //
    }

    update(){
        //
    }
}

export class FFAGameMode{
    
}