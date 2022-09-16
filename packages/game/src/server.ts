import { Server, Connection } from "@pip-pip/core"
import { PipPipLobby } from "./lobby"

export type PipPipConnectionPublicState = {
    name: string,
}

export class PipPipConnection extends Connection<PipPipConnectionPublicState>{
    constructor(){
        super()
        this.publicState = {
            name: "Player",
        }
    }
}

export class PipPipServer extends Server<PipPipConnection>{
    constructor(port = 3000){
        super({ port })

        this.setConnectionClass(PipPipConnection)
        this.setLobbyTypes({
            default: PipPipLobby,
        })


    }
}