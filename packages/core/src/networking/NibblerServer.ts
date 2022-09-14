import http from "http"
import express, { Router as createRouter, Express } from "express"
import { handle404Error, handleError } from "../lib/express"
import { server as WebSocketServer } from "websocket"
import { NIBBLER_DEFAULT_BASE_ROUTE, NIBBLER_DEFAULT_PORT } from "../lib/constants"

export type NibblerServerOptions = {
    baseRoute: string,
    port: number,
}

export class NibblerServer{
    options: NibblerServerOptions

    app: Express
    wss: WebSocketServer
    server: http.Server

    constructor(options: Partial<NibblerServerOptions> = {}){
        this.options = {
            baseRoute: NIBBLER_DEFAULT_BASE_ROUTE,
            port: NIBBLER_DEFAULT_PORT,
            ...options
        }

        this.app = express()
        this.server = http.createServer(this.app)
        this.wss = new WebSocketServer({
            httpServer: this.server,
        })

        this.initializeRoutes()
    }

    initializeRoutes(){
        const router = createRouter()

        router.get("/", (req, res) => {
            res.json({
                name: "horizon-engine",
                version: "0.0.1",
            })
        })

        this.app.use(this.options.baseRoute, router)
    }

    async start(){
        // Add error handler before starting server
        this.app.use(handle404Error)
        this.app.use(handleError)

        // Start the server
        await (new Promise(resolve => {
            this.server.listen(this.options.port, () => resolve(null))
        }))
    }
}