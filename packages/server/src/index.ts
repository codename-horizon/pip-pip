import { $uint8, ExtractSerializerMap, Packet, PacketManager, Server } from "@pip-pip/core"
import { $varstring, Client, EventCollector, EventEmitter, generateId } from "@pip-pip/core/src/common"
import { Connection } from "@pip-pip/core/src/networking/connection"
import { LobbyTypeOptions } from "@pip-pip/core/src/networking/lobby"
import { packetManager } from "@pip-pip/game/src/networking/packets"

type GamePacketManagerSerializerMap = ExtractSerializerMap<typeof packetManager>

type GameConnectionLocals = {
    name: string,
}

type GameLobbyLocals = {
    players: string[],
}

const server = new Server<GamePacketManagerSerializerMap, GameConnectionLocals, GameLobbyLocals>(packetManager, {
    connectionIdleLifespan: 5000,
    lobbyIdleLifespan: 5000,
    verifyTimeLimit: 5000,
})

const defaultLobbyOptions: LobbyTypeOptions = {
    maxConnections: 8,
    maxInstances: 20,
    userCreatable: true,
}

server.registerLobby("default", defaultLobbyOptions, ({lobby, server}) => {
    // new lobby created!
    // console.log(lobby)
    lobby.events.on("addConnection", ({ connection }) => {
        console.log("someone connected!")
    })
})

async function run(){
    await server.start()

    const artLines = [
        "---------------- WELCOME TO ----------------",
        "██████╗░██╗██████╗░░░░░░░██████╗░██╗██████╗░",
        "██╔══██╗██║██╔══██╗░░░░░░██╔══██╗██║██╔══██╗",
        "██████╔╝██║██████╔╝█████╗██████╔╝██║██████╔╝",
        "██╔═══╝░██║██╔═══╝░╚════╝██╔═══╝░██║██╔═══╝░",
        "██║░░░░░██║██║░░░░░░░░░░░██║░░░░░██║██║░░░░░",
        "╚═╝░░░░░╚═╝╚═╝░░░░░░░░░░░╚═╝░░░░░╚═╝╚═╝░░░░░",
        `---------- http://localhost:${server.options.port} -----------`,
    ]

    console.log(artLines.join("\n"))

    const conLobWatch = new EventCollector(server.events, ["addConnection", "createConnection", "createLobby", "removeConnection", "removeLobby"])
    conLobWatch.on("collect", ({ event }) => {
        console.log({
            connections: Object.keys(server.connections),
            lobbies: Object.keys(server.lobbies),
        })
        conLobWatch.flush()
    })
}

run()
