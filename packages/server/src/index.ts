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

const wait = (n = 1000) => new Promise(resolve => setTimeout(resolve, n))



async function run(){
    console.clear()
    await server.start()
    console.log("server running")

    const client = new Client(packetManager)
    await client.connect()
    const collector = new EventCollector(client.events)

    let message = packetManager.serializers.name.encode({
        id: generateId(),
        name: generateId(),
        n: Math.random()
    })

    message = message.concat(packetManager.serializers.name.encode({
        id: "mike",
        name: "meg",
        n: 69,
    }))

    const encoded = new Uint8Array(message).buffer

    client.packets.events.on("name", ({ data }) => {
        console.log("Client", data)
        client.send(encoded)
    })

    server.packets.events.on("name", ({ ws, data, connection }) => {
        console.log("Server", data)
    })

    console.log(message, message.length)
    server.broadcast(encoded)

    setTimeout(() => {
        console.log(collector.filter("packetMessage"))
        collector.flush()
        console.log(collector.pool)
    }, 2000)
}

run()
