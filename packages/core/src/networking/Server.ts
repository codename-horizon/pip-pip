import http from "http"

import express, { Express, Router as createRouter, Request, Response, NextFunction } from "express"
import { WebSocket, WebSocketServer } from "ws"

import { handle404Error, handleError } from "../lib/express"
import { LobbyDiscoveryMode, SERVER_DEFAULT_BASE_ROUTE, SERVER_DEFAULT_PORT } from "../lib/constants"
import { Connection } from "./Connection"
import { Lobby } from "./Lobby"
import createHttpError from "http-errors"
import cors from "cors"
import { ServerOptions } from "../types/server"
import { PacketManager } from "./Packets"

export class Server<
    ServerConnection extends Connection = Connection, 
    ServerPacketManager extends PacketManager = PacketManager,
>{
    options: ServerOptions

    app: Express
    wss: WebSocketServer
    server: http.Server

    ServerConnection: new () => Connection = Connection
    packetManager!: ServerPacketManager
    
    connections: Record<string, Connection> = {}


    lobbies: Record<string, Lobby> = {}
    lobbyTypes: Record<string, new () => Lobby> = {}

    constructor(options: Partial<ServerOptions> = {}){
        this.options = {
            baseRoute: SERVER_DEFAULT_BASE_ROUTE,
            port: SERVER_DEFAULT_PORT,
            maxLobbies: 64,
            maxConnections: 16 * 16,
            ...options
        }

        this.app = express()
        this.server = http.createServer(this.app)
        this.wss = new WebSocketServer({
            server: this.server,
        })

        this.initializeRoutes()
    }

    setConnectionClass(ServerConnection: new () => ServerConnection){
        this.ServerConnection = ServerConnection
    }

    setPacketManager(packetManager: ServerPacketManager){
        this.packetManager = packetManager
    }

    setLobbyTypes(lobbyTypes: Record<string, new () => Lobby>){
        this.lobbyTypes = lobbyTypes
    }

    get lobbyCount(){
        return Object.values(this.lobbies).length
    }

    authGuard(req: Request, res: Response, next: NextFunction){
        if(typeof req.headers.authorization === "undefined"){
            next(createHttpError(401, "Client not authorized"))
            return
        }

        const token = req.headers.authorization

        if(!(token in this.connections)){
            next(createHttpError(401, "Token invalid"))
            return
        }
        

        // const connection = this.connections[token]

        next()
    }

    initializeRoutes(){
        // Allow CORS
        this.app.use(cors())

        // Setup router
        const router = createRouter()

        router.get("/", (req, res) => {
            res.json({
                name: "horizon-engine",
                version: "0.0.1",
            })
        })

        // Assign "this" inside authGuard method
        const authGuard = this.authGuard.bind(this)

        // authenticate user
        router.get("/auth", (req, res) => {
            if(typeof req.headers.authorization !== "undefined"){
                const token = req.headers.authorization
                if(token in this.connections){
                    res.json(this.connections[token])
                    return
                } else{
                    // Proceed with new connection
                }
            }
            const connection = new this.ServerConnection()
            this.connections[connection.token] = connection
            res.json(connection.toJSON())
        })

        // list all public lobbies
        router.get("/lobbies", authGuard, (req, res) => {
            const lobbies = Object.values(this.lobbies)
                .filter(lobby => 
                    lobby.discoveryMode === LobbyDiscoveryMode.PUBLIC)
                .map(lobby => lobby.toJSON())
            res.json({ lobbies })
        })

        // create lobby
        router.get("/lobbies/create", authGuard, (req, res) => {
            const type = req.query.type
            if(typeof type !== "string") throw createHttpError(400, "type is not a string")
            if(!(type in this.lobbyTypes)) throw createHttpError(400, "lobby type doesnt exist")
            if(this.lobbyCount >= this.options.maxLobbies) throw createHttpError(400, "max lobbies reached")
            const Lobby = this.lobbyTypes[type]
            const lobby = new Lobby()
            this.lobbies[lobby.id] = lobby
            res.json(lobby.toJSON())
        })

        // get lobby info
        router.get("/lobbies/info", authGuard, (req, res) => {
            const id = req.query.id
            if(typeof id !== "string") throw createHttpError(400, "id is not a string")
            const lobby = this.lobbies[id]
            if(typeof lobby === "undefined") throw createHttpError(404, "lobby not found")
            res.json(lobby.toJSON())
        })

        this.app.use(this.options.baseRoute, router)
    }

    handleSocketMessage(data: string, ws: WebSocket, connection: ServerConnection){
        if(typeof this.packetManager === undefined){
            // do nothing
        } else{
            const message = this.packetManager.decodeGroup(data)
            console.log(message)
        }
    }

    async start(){
        // Add error handler before starting server
        this.app.use(handle404Error)
        this.app.use(handleError)

        // Start the server
        await (new Promise(resolve => {
            this.server.listen(this.options.port, () => resolve(null))
        }))

        // Handle web socket connections
        this.wss.on("connection", (ws: WebSocket) => {
            let connection: ServerConnection
            let reconciled = false

            ws.on("message", (data) => {
                if(reconciled === true){
                    this.handleSocketMessage(data.toString(), ws, connection)
                } else{
                    const token = data.toString()
                    if(token in this.connections){
                        connection = this.connections[token] as ServerConnection
                        connection.setWebSocket(ws)
                        reconciled = true
                    } else{
                        ws.close()
                    }
                }
            })
            
            ws.on("close", () => {
                console.log(Array.from(this.wss.clients).length)
            })
        })
    }
}