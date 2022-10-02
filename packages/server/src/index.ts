import { $uint8, Packet, PacketManager, Server } from "@pip-pip/core"
import { LobbyOptions } from "@pip-pip/core/src/networking/server/lobby"

const packetManager = new PacketManager({
    shoot: new Packet(0, {
        count: $uint8,
    })
})

const server = new Server(packetManager)

server.packets.events.on("shoot", () => {
    //
})


const defaultLobbyOptions: LobbyOptions = {
    maxConnections: 8,
    maxInstances: 20,
}

server.registerLobby("default", defaultLobbyOptions, ({lobby, server}) => {
    server.packets.events.on("shoot", () => {
        //
    })
})