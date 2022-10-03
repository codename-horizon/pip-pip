import { PacketManagerSerializerMap } from "../packets/manager"
import express, { Express, Router as createRouter, Request, Response, NextFunction } from "express"
import cors from "cors"
import bodyParser from "body-parser"
import createHttpError from "http-errors"
import { Server } from "."
import { asyncHandler, handle404Error, handleError } from "../../lib/express"
import { Connection } from "../connection"

export function initializeRoutes<
    T extends PacketManagerSerializerMap,
    R extends Record<string, any> = Record<string, any>,
    P extends Record<string, any> = Record<string, any>,
>(server: Server<T, R, P>){
    server.app.use(cors())
    server.app.use(bodyParser.json())

    const router = createRouter()

    server.routerAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
        const connection = server.getConnectionFromRequest(req)
        if(typeof connection === "undefined"){
            next(createHttpError(401, "Connection not authorized."))
        }
        next()
    }

    router.get("/", (req, res) => {
        res.json({
            message: "Welcome to Horizon Engine. ;)",
        })
    })

    // Create connection
    router.post("/connection", asyncHandler(async (req: Request, res: Response) => {
        const connection = new Connection(server)
        server.addConnection(connection)
        res.json(connection.toJson(true))
    }))

    // Get connection details
    router.get("/connection", server.routerAuthMiddleware, asyncHandler(async (req: Request, res: Response) => {
        const connection = server.getConnectionFromRequest(req)

        res.json(connection?.toJson())
    }))

    // Create lobby details
    router.get("/lobbies", server.routerAuthMiddleware, asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        if(typeof req.query.id !== "string") {
            next()
            return
        }

        const id = req.query.id

        if(!(id in server.lobbies)) throw createHttpError(400, "Lobby not found.")

        const lobby = server.lobbies[id]

        res.json(lobby.toJson())
    }))

    // Get available lobbies
    router.get("/lobbies", server.routerAuthMiddleware, asyncHandler(async (req: Request, res: Response) => {
        throw createHttpError(400, "Not yet implemented.")
    }))

    // Create lobby
    router.post("/lobbies", server.routerAuthMiddleware, asyncHandler(async (req: Request, res: Response) => {
        console.log(req.body)
        if(typeof req.body.type !== "string") throw createHttpError(422, "Lobby type not specified.")

        const type = req.body.type

        if(!(type in server.lobbyType)) throw createHttpError(400, "Lobby type not found.")

        const lobbyType = server.lobbyType[type]
        if(lobbyType.options.userCreatable === false) throw createHttpError(401, "Lobby cannot be created.")

        const lobby = server.createLobby(type)

        res.json(lobby.toJson())
    }))

    server.start = () => new Promise<void>((resolve) => {
        // TODO: Register debugging routes if enabled in options
        server.app.use(server.options.baseRoute, router)
        server.app.use(handle404Error)
        server.app.use(handleError)
        server.server.listen(server.options.port, () => {
            server.events.emit("start")
            resolve()
        })
    })
}