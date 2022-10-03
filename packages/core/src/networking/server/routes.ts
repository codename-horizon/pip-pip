import { PacketManagerSerializerMap } from "../packets/manager"
import express, { Express, Router as createRouter, Request, Response, NextFunction } from "express"
import cors from "cors"
import createHttpError from "http-errors"
import { Server } from "."
import { handle404Error, handleError } from "../../lib/express"

export function initializeRoutes<
    T extends PacketManagerSerializerMap,
    R extends Record<string, any> = Record<string, any>,
    P extends Record<string, any> = Record<string, any>,
>(server: Server<T, R, P>){
    server.app.use(cors())

    const router = createRouter()

    router.get("/", (req, res) => {
        res.json({
            name: "horizon-engine",
            version: "0.0.1",
        })
    })

    server.start = () => new Promise<void>((resolve) => {
        server.app.use(handle404Error)
        server.app.use(handleError)
        server.server.listen(server.options.port, () => {
            resolve()
        })
    })
}