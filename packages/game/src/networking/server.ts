import { PacketType, Server } from "@pip-pip/core"
import { ConnectionStatus } from "@pip-pip/core/src/networking/server/connection"
import { PipPipGame, Player } from "../logic/test"
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
                score: 0,
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

        // Game logic
        const game = new PipPipGame()
        const TPS = 10

        let serverTick = 0
        let playerDCs: string[] = []

        const logConnections = () => console.log(Object.values(this.connections).map(con => [con.id, con.status].join(":")))

        this.serverEvents.on("connectionStatusChange", logConnections)
        this.serverEvents.on("registerConnection", logConnections)
        this.serverEvents.on("destroyConnection", logConnections)

        this.serverEvents.on("socketRegister", ({ ws, connection }) => {
            const player = new Player(connection.id)
            game.addPlayer(player)
        })

        this.packetEvents.on("playerPosition", ({ connection, value }) => {
            if(typeof connection === "undefined") return
            const player = game.players[connection.id]
            const [x, y, vx, vy, a] = value

            const dx = x - player.physics.position.x
            const dy = y - player.physics.position.y
            const dist = Math.sqrt(dx*dx + dy*dy)

            if(dist < 100){
                player.physics.position.x = x
                player.physics.position.y = y
                player.physics.velocity.x = vx
                player.physics.velocity.y = vy
            }
        })

        this.serverEvents.on("destroyConnection", ({ connection }) => {
            if(connection.id in game.players){
                const p = game.players[connection.id]
                game.removePlayer(p)
                playerDCs.push(connection.id)
            }
        })

        setInterval(() => {
            game.physics.update()

            const playerPositions: PacketType<PipPipPacketMap["playerPositions"]> = []

            for(const playerId in game.players){
                const player = game.players[playerId]
                playerPositions.push([
                    playerId, 
                    player.physics.position.x,
                    player.physics.position.y,
                    player.physics.velocity.x,
                    player.physics.velocity.y,
                    0,
                ])
            }

            const playerPositionsPacket = this.packetManager.encode("playerPositions", playerPositions)

            for(const connectionId in this.connections){
                const connection = this.connections[connectionId]
                if(connection.status === ConnectionStatus.IDLE) continue
                if(typeof connection.ws === undefined) continue

                const group = [
                    playerPositionsPacket,
                    this.packetManager.encode("gameTick", serverTick),
                ]

                if(playerDCs.length){
                    playerDCs.forEach(id => group.push(
                        this.packetManager.encode("playerDisconnect", id)
                    ))
                    playerDCs = []
                }

                connection.ws?.send(this.packetManager.group(group))  
            }

            serverTick++
        }, 1000 / TPS)
    }
}