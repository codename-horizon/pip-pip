import { PacketManagerSerializerMap } from "../packets/manager"
import express, { Express, Router as createRouter, Request, Response, NextFunction } from "express"
import cors from "cors"
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