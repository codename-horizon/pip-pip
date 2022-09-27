import { Server, ServerTypes } from "."
import express, { Express, Router as createRouter, Request, Response, NextFunction } from "express"
import createHttpError from "http-errors"
import cors from "cors"
import { asyncHandler, handle404Error, handleError } from "../../lib/express"
import { Connection } from "./connection"

export function initializeServerRouter<T extends ServerTypes>(server: Server<T>){
    server.app.use(cors())

    const router = createRouter()

    router.get("/", (req, res) => {
        res.json({
            name: "horizon-engine",
            version: "0.0.1",
        })
    })
    
    const authMiddleware = asyncHandler(server.authMiddleware.bind(server))

    // register connection
    router.get("/register", asyncHandler(async (req, res) => {
        const respond = (con: Connection<T["ConnectionData"]>) => {
            res.json({
                token: con.token,
                ...server.getConnectionJSON(con),
            })
        }
        // Check if connection exists
        const conFromReq = await server.getConnectionFromRequest(req)
        if(typeof conFromReq !== "undefined"){
            respond(conFromReq)
            return
        }
        // Create new connection
        const connection = await server.createConnection()
        respond(connection)
    }))

    server.app.use(server.options.baseRoute, router)
}

export function initializeServerErrorRoutes<T extends ServerTypes>(server: Server<T>){
    server.app.use(handle404Error)
    server.app.use(handleError)
}

export function startServer<T extends ServerTypes>(server: Server<T>){
    // TODO: Add error handler for server starts
    return new Promise<void>((resolve) => {
        server.server.listen(server.options.port, () => {
            resolve()
        })
    })
}