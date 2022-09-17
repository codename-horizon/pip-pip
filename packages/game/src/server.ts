import { Server, Connection, PacketManager } from "@pip-pip/core"
import { PipPipLobby } from "./lobby"
import { serverPackets } from "./packets"

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

export class PipPipServer  extends Server<PipPipConnection, typeof serverPackets>{
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

    }
}