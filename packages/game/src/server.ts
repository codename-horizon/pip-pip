import { Server } from "@pip-pip/core"
import { PublicConnectionData } from "./client"
import { pipPipPacketMap, PipPipPacketMap } from "./packets"

export type ConnectionData = {
    public: PublicConnectionData,
    private: {
        banned: false,
    },
}

export type ServerTypes = {
    ConnectionData: ConnectionData,
    PacketMap: PipPipPacketMap,
}

export class PipPipServer extends Server<ServerTypes>{
    constructor(port = 3000){
        const connectionDataFactory = (): ConnectionData => ({
            public: {
                name: "Player" + Math.floor(Math.random() * 1000),
            },
            private: {
                banned: false,
            },
        })

        super({ port, connectionDataFactory })

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

            console.log(artLines.join("\n"))
        })
    }
}