import http from "http"

import { generateId, SERVER_DEFAULT_BASE_ROUTE, SERVER_HEADER_KEY } from "../../common"
import { EventEmitter } from "../../common/events"
import { PacketManager, PacketManagerSerializerMap, ServerPacketManagerEventMap } from "../packets/manager"
import { Packet } from "../packets/packet"
import { ServerSerializerMap } from "../packets/server"
import { Connection } from "../connection"
import { ServerEventMap } from "./events"
import { Lobby, LobbyInitializer, LobbyOptions, LobbyType } from "../lobby"
import { initializeRoutes } from "./routes"
import express, { Express, Router as createRouter, Request, Response, NextFunction } from "express"
import { WebSocketServer } from "ws"
import { initializeWebSockets } from "./websockets"
import { initializeConnectionMethods } from "./connection"
import { initializeLobbyMethods } from "./lobby"

export type ServerOptions = {
    authHeader: string,
    baseRoute: string,
    port: number,

    connectionIdleLifespan: number,
    lobbyIdleLifespan: number,
    verifyTimeLimit: number,

    maxConnections: number,
    maxLobbies: number,
}

export class Server<
    T extends PacketManagerSerializerMap,
    R extends Record<string, any> = Record<string, any>,
    P extends Record<string, any> = Record<string, any>,
>{
    options: ServerOptions = {
        authHeader: SERVER_HEADER_KEY,
        baseRoute: SERVER_DEFAULT_BASE_ROUTE,
        port: 3000,
        connectionIdleLifespan: 1000 * 60 * 5,
        lobbyIdleLifespan: 1000 * 60 * 5,
        verifyTimeLimit: 1000 * 15,
        maxConnections: 512,
        maxLobbies: 64,
    }

    events: EventEmitter<ServerEventMap<T, R, P>> = new EventEmitter("Server")

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

    constructor(packetManager: PacketManager<T>, options: Partial<ServerOptions> = {}){
        this.options = {
            ...this.options,
            ...options,
        }

        this.packets = {
            manager: packetManager,
            events: new EventEmitter("ServerPackets"),
        }

        this.app = express()
        this.server = http.createServer(this.app)
        this.wss = new WebSocketServer({ server: this.server })

        initializeRoutes(this)
        initializeWebSockets(this)
        initializeConnectionMethods(this)
        initializeLobbyMethods(this)
    }
}

export interface Server<
    T extends PacketManagerSerializerMap,
    R extends Record<string, any> = Record<string, any>,
    P extends Record<string, any> = Record<string, any>,
>{
    // routes.ts
    routerAuthMiddleware: (req: Request, res: Response, next: NextFunction) => void
    start: () => Promise<void>

    // websockets.ts

    // connection.ts
    getConnectionFromRequest: (req: Request) => Connection<T, R, P> | undefined
    getConnectionByConnectionToken: (connectionToken: string) => Connection<T, R, P> | undefined
    getConnectionByWebSocketToken: (websocketToken: string) => Connection<T, R, P> | undefined
    addConnection: (connection: Connection<T, R, P>) => void
    removeConnection: (connection: Connection<T, R, P>) => void
    broadcast: (data: string | ArrayBuffer) => void

    // lobby.ts
    registerLobby: (type: string, options: LobbyOptions, initializer: LobbyInitializer<T>) => void
    createLobby: <K extends keyof Server<T, R, P>["lobbyType"]>(type: K, id?: string) => void
}