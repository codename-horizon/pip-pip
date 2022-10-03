import { $uint8, ExtractSerializerMap, Packet, PacketManager, Server } from "@pip-pip/core"
import { Client } from "@pip-pip/core/src/common"
import { Connection } from "@pip-pip/core/src/networking/connection"
import { LobbyOptions } from "@pip-pip/core/src/networking/lobby"

const packetManager = new PacketManager({
    shoot: new Packet({
        count: $uint8,
    }),
    dodge: new Packet({
        count: $uint8,
    })
})

type GamePacketManagerSerializerMap = ExtractSerializerMap<typeof packetManager>

type GameConnectionLocals = {
    name: string,
}

type GameLobbyLocals = {
    players: string[],
}

const server = new Server<GamePacketManagerSerializerMap, GameConnectionLocals, GameLobbyLocals>(packetManager, {
    connectionIdleLifespan: 5000,
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

async function run(){
    console.clear()
    await server.start()
    console.log("server running")

    const client = new Client(packetManager)
    await client.requestConnection()

    console.log(client.connectionToken)
}

run()
