import { Server } from "@pip-pip/core"
import { pipPipPacketMap, PipPipPacketMap } from "./packets"

export type PipPipConnectionData = {
    public: {
        name: string,
    },
    private: {
        banned: false,
    },
}

export type ServerSettings = {
    ConnectionData: PipPipConnectionData,
    PacketMap: PipPipPacketMap,
}

export class PipPipServer extends Server<ServerSettings>{
    constructor(port = 3000){
        super({ port })

        this.setPacketMap(pipPipPacketMap)

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
    }
}