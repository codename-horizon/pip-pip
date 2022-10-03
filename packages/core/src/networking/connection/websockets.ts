import WebSocket, { RawData } from "ws"
import { Connection } from "."
import { PacketManagerSerializerMap } from "../packets/manager"

export function initializeWebSockets<
    T extends PacketManagerSerializerMap,
    R extends Record<string, any> = Record<string, any>,
    P extends Record<string, any> = Record<string, any>,
>(connection: Connection<T, R, P>){

    const handleSocketMessage = (data: RawData) => {
        connection.events.emit("socketMessage", { data })
    }

    const handleSocketClose = () => {
        connection.events.emit("socketClose")
    }

    
    connection.setWebSocket = (ws: WebSocket) => {
        connection.ws = ws
        connection.ws.on("message", handleSocketMessage)
        connection.ws.on("close", handleSocketClose)
        connection.stopIdle() // Emits statusChange 
    }

    connection.removeWebSocket = () => {
        if(typeof connection.ws !== "undefined"){
            connection.ws.off("message", handleSocketMessage)
            connection.ws.off("close", handleSocketClose)
            connection.ws.close()
        }
        connection.events.emit("statusChange", { status: connection.status })
        connection.startIdle() // Emits status
    }

    connection.send = (data: string | ArrayBuffer) => {
        if(typeof connection.ws !== "undefined"){
            connection.ws.send(data)
        }
    }
}