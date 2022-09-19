import { WebSocket } from "ws"
import { Server, ServerTypes } from "."

export function initializeSocketListeners<T extends ServerTypes>(server: Server<T>){
    server.wss.on("connection", (ws: WebSocket) => {
        // server.handleSocketConnected(ws)
        let reconciled = false

        ws.on("error", (err) => {
            // server.handleSocketError(ws, err)
        })

        ws.on("message", (rawData) => {
            const data: string = rawData.toString()
            // server.handleSocketMessage(ws, data)
            if(reconciled === true){
                reconciled = false
            } else{
                //
            }
        })

    })
}