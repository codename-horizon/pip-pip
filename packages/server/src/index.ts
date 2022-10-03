import { $uint8, ExtractSerializerMap, Packet, PacketManager, Server } from "@pip-pip/core"
import { Client } from "@pip-pip/core/src/common"
import { Connection } from "@pip-pip/core/src/networking/connection"
import { LobbyOptions } from "@pip-pip/core/src/networking/lobby"
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
    verifyTimeLimit: 5000,
})

const defaultLobbyOptions: LobbyOptions = {
    maxConnections: 8,
    maxInstances: 20,
    discoverable: false,
    userCreatable: false,
}

server.registerLobby("default", defaultLobbyOptions, ({lobby, server}) => {
    // new lobby created!
    console.log(lobby)
})

const wait = (n = 1000) => new Promise(resolve => setTimeout(resolve, n))

async function run(){
    console.clear()
    await server.start()
    console.log("server running")

    const client = new Client(packetManager)
    await client.connect()
}

server.events.on("socketReady", ({ connection }) => {
    connection.send(new Uint32Array([69]).buffer)
})

const logConnections = () => {
    console.log(Object.keys(server.connections))
}

server.events.on("addConnection", logConnections)
server.events.on("removeConnection", logConnections)

run()
