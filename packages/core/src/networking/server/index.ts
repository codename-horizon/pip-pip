import http from "http"

import express, { Express, Request, Response, NextFunction } from "express"
import { WebSocket, WebSocketServer } from "ws"
import { initializeServerErrorRoutes, initializeServerRouter, startServer } from "./routes"

import { SERVER_DEFAULT_BASE_ROUTE } from "../../lib/constants"
import { EventEmitter } from "../events"
import { internalPacketMap, InternalPacketMap, PacketManager, PacketMap } from "../packets"
import { ServerPacketEventMap } from "../packets/events"
import { initializeSocketListeners } from "./sockets"
import { Connection, ConnectionData, ConnectionId } from "./connection"

export type ServerEvents = {
    beforeStart: undefined,
    start: undefined,
}

export type ServerOptions = {
    baseRoute: string,
    port: number,
}

export type ServerTypes = {
    ConnectionData: ConnectionData,
    PacketMap: PacketMap,
}

export class Server<T extends ServerTypes>{
    options: ServerOptions

    app: Express
    server: http.Server
    wss: WebSocketServer

    connections: Record<ConnectionId, Connection<T["ConnectionData"]>> = {}

    serverEvents: EventEmitter<ServerEvents> = new EventEmitter("Server")
    packetEvents: EventEmitter<ServerPacketEventMap<T["PacketMap"] & InternalPacketMap>> = new EventEmitter("ServerPacket")

    packetManager!: PacketManager<T["PacketMap"] & InternalPacketMap>

    constructor(options: Partial<ServerOptions>){
        this.options = {
            baseRoute: SERVER_DEFAULT_BASE_ROUTE,
            port: 3000,
            ...options,
        }

        // Setup servers
        this.app = express()
        this.server = http.createServer(this.app)
        this.wss = new WebSocketServer({ server: this.server })

        initializeServerRouter(this)
        initializeSocketListeners(this)
    }

    setPacketMap(packetMap: T["PacketMap"]){
        this.packetManager = new PacketManager({ ...packetMap, ...internalPacketMap })
    }

    authMiddleware(req: Request, res: Response, next: NextFunction){
        next()
    }

    async start(){
        this.serverEvents.emit("beforeStart")
        // Add error handler before starting server
        initializeServerErrorRoutes(this)

        // Start server
        startServer(this)
        this.serverEvents.emit("start")
    }
}