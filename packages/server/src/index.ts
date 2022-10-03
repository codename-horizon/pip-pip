import { $uint8, ExtractSerializerMap, Packet, PacketManager, Server } from "@pip-pip/core"
import { Connection } from "@pip-pip/core/src/networking/server/connection"
import { LobbyOptions } from "@pip-pip/core/src/networking/server/lobby"

const packetManager = new PacketManager({
    shoot: new Packet({
        count: $uint8,
    }),
    dodge: new Packet({
        count: $uint8,
    })
})

console.log(packetManager.packets)

type GamePacketManagerSerializerMap = ExtractSerializerMap<typeof packetManager>

type GameConnectionLocals = {
    name: string,
}

type GameLobbyLocals = {
    players: string[],
}

const server = new Server<GamePacketManagerSerializerMap, GameConnectionLocals, GameLobbyLocals>(packetManager)

server.packets.events.on("shoot", () => {
    //
})

server.connections.test = new Connection(server)
server.connections.test.locals.name = "Mike"
const con = server.connections.test
console.log(con.locals.name)
console.log(con.latency)

const defaultLobbyOptions: LobbyOptions = {
    maxConnections: 8,
    maxInstances: 20,
    discoverable: false,
    userCreatable: false,
}

server.registerLobby("default", defaultLobbyOptions, ({lobby, server}) => {
    server.packets.events.on("shoot", () => {
        //
    })
})

server.createLobby("default")
console.log(server.lobbies)