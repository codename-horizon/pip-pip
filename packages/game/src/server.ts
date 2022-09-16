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

export class PipPipServer extends Server<PipPipConnection, PacketManager<typeof serverPackets>>{
    constructor(port = 3000){
        super({ port })
        this.setPacketManager(new PacketManager(serverPackets))
        this.setConnectionClass(PipPipConnection)
        this.setLobbyTypes({
            default: PipPipLobby,
        })
    }
}