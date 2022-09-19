import http from "http"

import express, { Express, Request, Response, NextFunction } from "express"
import { WebSocket, WebSocketServer } from "ws"
import { initializeServerErrorRoutes, initializeServerRouter, startServer } from "./routes"

import { SERVER_DEFAULT_BASE_ROUTE } from "../../lib/constants"
import { EventEmitter } from "../events"
import { internalPacketMap, InternalPacketMap, PacketManager, PacketMap } from "../packets"
import { ServerPacketEventMap } from "../packets/events"
import { initializeSocketListeners } from "./sockets"
import { Connection, ConnectionData, ConnectionId, ConnectionJSON, ConnectionToken, initializeConnectionHandlers } from "./connection"
import { RequiredOnly } from "../../lib/types"
import createHttpError from "http-errors"

export type ServerEvents<T extends ServerTypes> = {
    beforeStart: undefined,
    start: undefined,

    registerConnection: { connection: Connection<T["ConnectionData"]> },
    destroyConnection: { connection: Connection<T["ConnectionData"]> },
    connectionIdleStart: { connection: Connection<T["ConnectionData"]> },
    connectionIdleEnd: { connection: Connection<T["ConnectionData"]> },
}

export type ServerOptions<T extends ServerTypes> = {
    baseRoute: string,
    port: number,
    connectionIdleLifespan: number,

    connectionDataFactory: () => T["ConnectionData"],
}

export type ServerTypes = {
    ConnectionData: ConnectionData,
    PacketMap: PacketMap,
}

export class Server<T extends ServerTypes>{
    options: ServerOptions<T>

    app: Express
    server: http.Server
    wss: WebSocketServer

    connections: Record<ConnectionId, Connection<T["ConnectionData"]>> = {}

    serverEvents: EventEmitter<ServerEvents<T>> = new EventEmitter("Server")
    packetEvents: EventEmitter<ServerPacketEventMap<T["PacketMap"] & InternalPacketMap>> = new EventEmitter("ServerPacket")

    packetManager!: PacketManager<T["PacketMap"] & InternalPacketMap>

    constructor(options: RequiredOnly<ServerOptions<T>, "connectionDataFactory">){
        this.options = {
            baseRoute: SERVER_DEFAULT_BASE_ROUTE,
            port: 3000,
            connectionIdleLifespan: 5000,
            ...options,
        }

        // Setup servers
        this.app = express()
        this.server = http.createServer(this.app)
        this.wss = new WebSocketServer({ server: this.server })

        initializeServerRouter(this)
        initializeSocketListeners(this)
        initializeConnectionHandlers(this)
    }

    setPacketMap(packetMap: T["PacketMap"]){
        this.packetManager = new PacketManager({ ...packetMap, ...internalPacketMap })
    }

    async getConnectionFromRequest(req: Request){
        if(typeof req.headers.authorization !== "undefined"){
            const token = req.headers.authorization
            const connection = await this.getConnectionByToken(token)
            if(typeof connection !== "undefined"){
                return connection
            }
        }
    }

    async authMiddleware(req: Request, res: Response, next: NextFunction){
        const connection = await this.getConnectionFromRequest(req)
        if(typeof connection === "undefined"){
            throw createHttpError(401, "Connection unavailable.")
        }
        next()
    }

    async start(){
        this.serverEvents.emit("beforeStart")
        // Add error handler before starting server
        initializeServerErrorRoutes(this)

        // Start server
        await startServer(this)
        this.serverEvents.emit("start")
    }
}

export interface Server<T extends ServerTypes>{
    handleSocketMessage: (data: string, ws: WebSocket, connection: Connection<T["ConnectionData"]>) => void

    // Connection methods defined in ./connection.ts
    createConnection: () => Promise<Connection<T["ConnectionData"]>>
    registerConnection: (connection: Connection<T["ConnectionData"]>) => void
    getConnectionByToken: (token: ConnectionToken) => Promise<Connection<T["ConnectionData"]> | undefined>
    destroyConnection: (connection: Connection<T["ConnectionData"]>) => void

    startConnectionIdle: (connection: Connection<T["ConnectionData"]>) => void
    endConnectionIdle: (connection: Connection<T["ConnectionData"]>) => void

    getConnectionJSON: (connection: Connection<T["ConnectionData"]>) => ConnectionJSON<T["ConnectionData"]["public"]>
}