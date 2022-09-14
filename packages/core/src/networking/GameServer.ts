import http from "http"
import express, { Express, Request, Response, NextFunction } from "express"
import { asyncHandler, handle404Error, handleError } from "../lib/express"

export type GameServerOptions = {
    baseRoute: "/horizon/"
}

export class GameServer{
    app: Express
    server: http.Server

    constructor(options: Partial<GameServerOptions> = {}){
        this.app = express()
        this.server = http.createServer(this.app)

        this.initializeRoutes()
    }

    initializeRoutes(){
        this.app.get("/", asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
            res.json({
                ok: true
            })
        }))
    }

    async start(){
        // Add error handler before starting server
        this.app.use(handle404Error)
        this.app.use(handleError)

        // Start the server
        await (new Promise(resolve => {
            this.server.listen(3000, () => resolve(null))
        }))
    }
}