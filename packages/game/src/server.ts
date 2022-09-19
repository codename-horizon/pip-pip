import { Server, ServerConnection } from "@pip-pip/core"
import { PipPipLobby } from "./lobby"
import { PipPipPackets, pipPipPackets } from "./packets"
import { PipPipConnectionPrivateState, PipPipConnectionPublicState } from "./types"

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
            const artLines = [
                "---------------- WELCOME TO ----------------",
                "██████╗░██╗██████╗░░░░░░░██████╗░██╗██████╗░",
                "██╔══██╗██║██╔══██╗░░░░░░██╔══██╗██║██╔══██╗",
                "██████╔╝██║██████╔╝█████╗██████╔╝██║██████╔╝",
                "██╔═══╝░██║██╔═══╝░╚════╝██╔═══╝░██║██╔═══╝░",
                "██║░░░░░██║██║░░░░░░░░░░░██║░░░░░██║██║░░░░░",
                "╚═╝░░░░░╚═╝╚═╝░░░░░░░░░░░╚═╝░░░░░╚═╝╚═╝░░░░░",
                `---------- http://localhost:${this.options.port} -----------`,
            ]

            console.clear()
            console.log(artLines.join("\n"))
        })

        this.packetEvents.on("parrot", ({ value, connection }) => {
            connection.send(this.packetManager.group([
                this.packetManager.encode("parrot", value)
            ]))
        })
    }
}