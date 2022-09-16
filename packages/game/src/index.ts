import { GameWorld, GameWorldOptions } from "@pip-pip/core"

export type LobbyWorldOptions = {
    test: boolean
} & Partial<GameWorldOptions>

export class LobbyWorld extends GameWorld{
    constructor(options: Partial<LobbyWorldOptions> = {}){
        super(options)
    }
}