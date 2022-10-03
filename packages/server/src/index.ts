import { $uint8, ExtractSerializerMap, Packet, PacketManager, Server } from "@pip-pip/core"
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

const server = new Server<GamePacketManagerSerializerMap, GameConnectionLocals, GameLobbyLocals>(packetManager)

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
server.start().then(() => {
    console.log("nice")
})