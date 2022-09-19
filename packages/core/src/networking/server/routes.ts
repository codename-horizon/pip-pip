import { Server, ServerTypes } from "."
import cors from "cors"
import express, { Express, Router as createRouter, Request, Response, NextFunction } from "express"
import createHttpError from "http-errors"
import { handle404Error, handleError } from "../../lib/express"

export function initializeServerRouter<T extends ServerTypes>(server: Server<T>){
    server.app.use(cors)

    const router = createRouter()
    router.get("/", (req, res) => {
        res.json({
            name: "horizon-engine",
            version: "0.0.1",
        })
    })
    
    const authMiddleware = server.authMiddleware.bind(server)

    // authenticate user
    router.get("/auth", (req, res) => {
        // if(typeof req.headers.authorization !== "undefined"){
        //     const token = req.headers.authorization
        //     if(token in server.connections){
        //         res.json(server.getConnectionByToken(token))
        //         return
        //     } else{
        //         // Proceed with new connection
        //     }
        // }
        // const connection = server.createConnection()
        // server.serverEvents.emit("auth", { connection })
        // res.json(connection.toJSON())
    })

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