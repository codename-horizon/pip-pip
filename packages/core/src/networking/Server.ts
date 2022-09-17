import http from "http"

import express, { Express, Router as createRouter, Request, Response, NextFunction } from "express"
import { WebSocket, WebSocketServer } from "ws"

import { handle404Error, handleError } from "../lib/express"
import { LobbyDiscoveryMode, SERVER_DEFAULT_BASE_ROUTE, SERVER_DEFAULT_PORT } from "../lib/constants"
import { ServerConnection } from "./ServerConnection"
import { ServerLobby } from "./ServerLobby"
import createHttpError from "http-errors"
import cors from "cors"
import { ServerEventMap, ServerOptions, ServerPacketEventMap } from "../types/server"
import { HorizonEventEmitter } from "./Events"
import { EventMap } from "../types/client"
import { PacketMap } from "../types/packets"
import { LibPacketManager } from "./Packets"

export class Server<
    ServerCon extends ServerConnection, 
    PM extends PacketMap,
    CustomEventMap extends EventMap = Record<string, never>,
>{
    options: ServerOptions

    app: Express
    wss: WebSocketServer
    server: http.Server

    serverConnectionClass!: new () => ServerCon
    packetManager!: LibPacketManager<PM>

    packetEvents: HorizonEventEmitter<ServerPacketEventMap<PM>> = new HorizonEventEmitter()
    serverEvents: HorizonEventEmitter<ServerEventMap<ServerCon>> = new HorizonEventEmitter()
    customEvents: HorizonEventEmitter<CustomEventMap> = new HorizonEventEmitter()

    connections: Record<string, ServerConnection> = {}

    lobbies: Record<string, ServerLobby> = {}
    lobbyTypes: Record<string, new () => ServerLobby> = {}

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

    setConnectionClass(serverConnectionClass: new () => ServerCon){
        this.serverConnectionClass = serverConnectionClass
    }

    setPacketDefinitions(packetMap: PM){
        this.packetManager = new LibPacketManager(packetMap)
    }

    setLobbyTypes(lobbyTypes: Record<string, new () => ServerLobby>){
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
            const connection = new this.serverConnectionClass()
            this.connections[connection.token] = connection
            this.serverEvents.emit("auth", { connection })
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
            this.serverEvents.emit("lobbyCreate", { lobby })
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

    handleSocketMessage(data: string, ws: WebSocket, connection: ServerCon){
        this.serverEvents.emit("socketMessage", { data, ws, connection })
        try{
            const packetGroup = this.packetManager.decodeGroup(data)
            for(const packet of packetGroup){
                this.packetEvents.emit(packet.id, {
                    group: packetGroup,
                    ws, connection,
                    value: packet.value as any,
                })
                connection.packetEvents.emit(packet.id, {
                    group: packetGroup,
                    ws, connection,
                    value: packet.value as any,
                })
            }
        } catch(e){
            console.log(`error with message ${data}`)
            console.warn(e)
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

        this.serverEvents.emit("start")

        // Handle web socket connections
        this.wss.on("connection", (ws: WebSocket) => {
            let connection: ServerCon
            let reconciled = false

            this.serverEvents.emit("socketConnect", { ws })

            ws.on("message", (data) => {
                if(reconciled === true){
                    this.handleSocketMessage(data.toString(), ws, connection)
                } else{
                    const token = data.toString()
                    if(token in this.connections){
                        connection = this.connections[token] as ServerCon
                        connection.setWebSocket(ws)
                        reconciled = true
                        this.serverEvents.emit("socketConnectionReconciled", { ws, connection })
                    } else{
                        ws.close()
                    }
                }
            })

            ws.on("close", () => {
                this.serverEvents.emit("socketClose")
            })
        })
    }
}