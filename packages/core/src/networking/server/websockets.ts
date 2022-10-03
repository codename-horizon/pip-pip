import { PacketManagerSerializerMap } from "../packets/manager"
import { Server } from "."
import { Connection } from "../connection"
import WebSocket, { RawData } from "ws"

export function initializeWebSockets<
    T extends PacketManagerSerializerMap,
    R extends Record<string, any> = Record<string, any>,
    P extends Record<string, any> = Record<string, any>,
>(server: Server<T, R, P>){
    server.wss.on("connection", (ws: WebSocket) => {
        const verifyTimeout = setTimeout(() => {
            ws.close()
        }, server.options.verifyTimeLimit) // 10 second verify timeout
        let verified = false
        let connection: Connection<T, R, P>

        server.events.emit("socketOpen", { ws })

        ws.on("error", (error) => {
            server.events.emit("socketError", { ws, error })
        })

        ws.on("message", (data: RawData) => {
            server.events.emit("socketMessage", { ws, data, connection })
            if(verified === true){
                //
            } else{
                // Handle handshake
                const websocketToken = data.toString()
                const targetConnection = server.getConnectionByWebSocketToken(websocketToken)
                if(typeof targetConnection === "undefined"){
                    ws.close()
                } else{
                    clearTimeout(verifyTimeout)
                    verified = true
                    connection = targetConnection
                    ws.send(connection.id) // Complete handhsake
                    connection.setWebSocket(ws)
                    server.events.emit("socketVerify", { ws, connection })
                }
            }
        })

        ws.on("close", () => {
            clearTimeout(verifyTimeout)
            if(verified && typeof connection !== "undefined"){
                server.events.emit("socketClose", { ws, connection })
            } else{
                server.events.emit("socketVerifyFail", { ws })
            }
        })

    })
}