import { Server, ServerConnection } from "@pip-pip/core"
import { PipPipLobby } from "./lobby"
import { pipPipPackets } from "./packets"
import { PipPipConnectionPrivateState, PipPipConnectionPublicState, PipPipPackets } from "./types"

export class PipPipConnection extends ServerConnection<
    PipPipConnectionPublicState, 
    PipPipConnectionPrivateState, 
    PipPipPackets
>{
    constructor(){
        super()
        this.publicState = {
            name: "Player",
        }
    }
}

export class PipPipServer  extends Server<PipPipConnection, PipPipPackets>{
    constructor(port = 3000){
        super({ port })

        this.setPacketDefinitions(pipPipPackets)
        this.setConnectionClass(PipPipConnection)
        this.setLobbyTypes({
            default: PipPipLobby,
        })
        
        this.serverEvents.on("start", () => {
            console.log("server started!")
        })
    }
}