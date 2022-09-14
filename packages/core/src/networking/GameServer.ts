import http from "http"
import express, { Express } from "express"

export class GameServer{
    private app: Express
    private server: http.Server

    constructor(){
        this.app = express()
        this.server = http.createServer(this.app)
    }

    async start(){
        await (new Promise(resolve => {
            this.server.listen(3000, () => resolve(null))
        }))
    }
}