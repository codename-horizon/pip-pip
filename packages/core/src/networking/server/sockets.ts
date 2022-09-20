import { WebSocket } from "ws"
import { Server, ServerTypes } from "."
import { InternalPacketManager } from "../packets"
import { Connection } from "./connection"

export function initializeSocketListeners<T extends ServerTypes>(server: Server<T>){

    server.wss.on("connection", (ws: WebSocket) => {
        let registered = false
        let connection: Connection<T["ConnectionData"]>

        server.handleSocketOpen(ws)

        ws.on("error", (err) => {
            server.handleSocketError(ws, err)
        })

        ws.on("message", async (rawData) => {
            const data: string = rawData.toString()
            console.log(data, registered)
            if(registered === false){
                const tempConnection = await server.getConnectionByToken(data)
                if(typeof tempConnection !== "undefined"){
                    connection = tempConnection
                    registered = true
                    server.handleSocketRegister(ws, connection)
                }
            } else{
                console.log("registered na...")
                server.handleSocketMessage(data, ws, connection)
            }
        })

        ws.on("close", () => {
            server.handleSocketClose(ws, connection)
        })
    })
    
    server.handleSocketOpen = (ws: WebSocket) => {
        server.serverEvents.emit("socketOpen")
    }
    server.handleSocketRegister = (ws: WebSocket, connection: Connection<T["ConnectionData"]>) => {
        const pm = server.packetManager as InternalPacketManager
        ws.send(pm.group([
            pm.encode("connectionHandshake", connection.id)
        ]))
        server.endConnectionIdle(connection)
        server.serverEvents.emit("socketRegister")
    }
    server.handleSocketError = (ws: WebSocket) => {
        server.serverEvents.emit("socketError")
    }

    server.handleSocketMessage = (data: string, ws: WebSocket, connection?: Connection<T["ConnectionData"]>) => {
        server.serverEvents.emit("socketMessage", {
            data, ws, connection
        })
        try{
            const packetGroup = server.packetManager.decodeGroup(data)
            for(const packet of packetGroup){
                server.packetEvents.emit(packet.id, {
                    group: packetGroup,
                    ws,
                    value: packet.value as any,
                    connection,
                })
            }
        } catch(e){
            server.serverEvents.emit("packetError", { data, ws, connection })
        }
    }

    server.handleSocketClose =  (ws: WebSocket, connection?: Connection<T["ConnectionData"]>) => {
        if(typeof connection !== "undefined"){
            server.startConnectionIdle(connection)
        }
        server.serverEvents.emit("socketClose", {
            ws, connection
        })
    }
}