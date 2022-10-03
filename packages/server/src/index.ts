import { $uint8, ExtractSerializerMap, Packet, PacketManager, Server } from "@pip-pip/core"
import { Client } from "@pip-pip/core/src/common"
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
})

const wait = (n = 1000) => new Promise(resolve => setTimeout(resolve, n))

async function run(){
    console.clear()
    await server.start()
    console.log("server running")

    const client = new Client(packetManager)
    await client.connect()

    const lobby = await client.createLobby("default")
    console.log(lobby)

    const join = await client.joinLobby(lobby.lobbyId)
    console.log(join)

    await wait()
    client.ws?.close()
    await wait()
    await client.connect()
    await wait()
    const leave = await client.leaveLobby()

    console.log(leave)

    await wait()
    await client.joinLobby(lobby.lobbyId)
    await client.leaveLobby()
    await wait(5000)
    client.ws?.close()
}

server.events.on("socketReady", ({ connection }) => {
    connection.send(new Uint32Array([69]).buffer)
})

const logConnections = () => {
    console.log("logConnections", Object.keys(server.connections))
}

server.events.on("addConnection", logConnections)
server.events.on("removeConnection", logConnections)

const logLobbies = () => {
    console.log("logLobbies", Object.keys(server.lobbies))
}

server.events.on("removeLobby", logLobbies)
server.events.on("createLobby", logLobbies)

run()
