import { Server } from "."
import { PacketManagerSerializerMap } from "../packets/manager"
import { Connection } from "./connection"

export type LobbyInitializer<T extends PacketManagerSerializerMap> = (arg: {
    lobby: Lobby<T>,
    server: Server<T>,
}) => void

export type LobbyOptions = {
    maxInstances: number,
    maxConnections: number,
}

export type LobbyType<T extends PacketManagerSerializerMap> = {
    options: LobbyOptions,
    initializer: LobbyInitializer<T>,
}

export class Lobby<T extends PacketManagerSerializerMap>{
    server: Server<T>
    connections: Record<string, Connection<T>> = {}

    constructor(server: Server<T>){
        this.server = server
    }
}