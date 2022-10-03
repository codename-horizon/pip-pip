import http from "http"

import { generateId, SERVER_DEFAULT_BASE_ROUTE } from "../../common"
import { EventEmitter } from "../../common/events"
import { PacketManager, PacketManagerSerializerMap, ServerPacketManagerEventMap } from "../packets/manager"
import { Packet } from "../packets/packet"
import { ServerSerializerMap } from "../packets/server"
import { Connection } from "../connection"
import { ServerEventMap } from "./events"
import { Lobby, LobbyInitializer, LobbyOptions, LobbyType } from "../lobby"
import { initializeRoutes } from "./routes"
import express, { Express, Request, Response, NextFunction } from "express"
import { WebSocket, WebSocketServer } from "ws"
import { initializeSockets } from "./sockets"
import { initializeConnectionMethods } from "./connection"
import { initializeLobbyMethods } from "./lobby"

export type ServerOptions = {
    baseRoute: string,
    port: number,
    connectionIdleLifespan: number,
    lobbyIdleLifespan: number,
    maxConnections: number,
    maxLobbies: number,
}

export class Server<
    T extends PacketManagerSerializerMap,
    R extends Record<string, any> = Record<string, any>,
    P extends Record<string, any> = Record<string, any>,
>{
    options: ServerOptions = {
        baseRoute: SERVER_DEFAULT_BASE_ROUTE,
        port: 3000,
        connectionIdleLifespan: 1000 * 60 * 5,
        lobbyIdleLifespan: 1000 * 60 * 5,
        maxConnections: 512,
        maxLobbies: 64,
    }

    events: EventEmitter<ServerEventMap> = new EventEmitter()

    connections: Record<string, Connection<T, R, P>> = {}
    lobbies: Record<string, Lobby<T, R, P>> = {}

    lobbyType: Record<string, LobbyType<T, R, P>> = {}

    packets: {
        manager: PacketManager<T>,
        events: EventEmitter<ServerPacketManagerEventMap<T & ServerSerializerMap>>
    }

    app: Express
    server: http.Server
    wss: WebSocketServer

    constructor(packetManager: PacketManager<T>){
        this.packets = {
            manager: packetManager,
            events: new EventEmitter(),
        }

        this.app = express()
        this.server = http.createServer(this.app)
        this.wss = new WebSocketServer({ server: this.server })

        initializeRoutes(this)
        initializeSockets(this)
        initializeConnectionMethods(this)
        initializeLobbyMethods(this)
    }

    setOptions(options: Partial<ServerOptions> = {}){
        this.options = {
            ...this.options,
            ...options,
        }
    }
}

export interface Server<
    T extends PacketManagerSerializerMap,
    R extends Record<string, any> = Record<string, any>,
    P extends Record<string, any> = Record<string, any>,
>{
    start: () => Promise<void>

    // lobby.ts
    registerLobby: (type: string, options: LobbyOptions, initializer: LobbyInitializer<T>) => void
    createLobby: <K extends keyof Server<T, R, P>["lobbyType"]>(type: K, id?: string) => void
}