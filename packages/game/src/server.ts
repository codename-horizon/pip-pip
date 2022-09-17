import { Server, ServerConnection } from "@pip-pip/core"
import { PipPipLobby } from "./lobby"
import { serverPackets } from "./packets"

export type PipPipConnectionPublicState = {
    name: string,
}

export type PipPipConnectionPrivateState = {
    hidden: false,
}

export type PipPipServerPackets = typeof serverPackets

export class PipPipConnection extends ServerConnection<
    PipPipConnectionPublicState, PipPipConnectionPrivateState, 
    PipPipServerPackets
>{
    constructor(){
        super()
        this.publicState = {
            name: "Player",
        }
    }
}

export class PipPipServer  extends Server<PipPipConnection, PipPipServerPackets>{
    constructor(port = 3000){
        super({ port })

        this.setPacketDefinitions(serverPackets)
        this.setConnectionClass(PipPipConnection)
        this.setLobbyTypes({
            default: PipPipLobby,
        })
        
        this.serverEvents.on("start", () => {
            console.log("server started!")
        })

        this.packetEvents.on("heartbeat", ({value}) => {
            console.log(value)
        })
    }
}