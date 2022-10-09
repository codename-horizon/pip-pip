import WebSocket, { RawData } from "ws"

import { PacketManagerSerializerMap, ServerPacketManagerEventMap } from "../packets/manager"
import { ServerSerializerMap } from "../packets/server"
import { getForceLatency } from "../../lib/server-env"
import { EventEmitter } from "../../common/events"
import { Connection } from "."
import { compress } from "../../lib/compression"

export function initializeWebSockets<
    T extends PacketManagerSerializerMap,
    R extends Record<string, any>,
    P extends Record<string, any>,
>(connection: Connection<T, R, P>){

    const handleSocketMessage = (data: RawData) => {
        connection.events.emit("socketMessage", { data })
    }

    const handleSocketClose = () => {
        connection.removeWebSocket()
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
        const send = async () => {
            if(typeof connection.ws !== "undefined"){
                if(connection.ws.readyState === connection.ws.OPEN){
                    const toSend = data instanceof ArrayBuffer ? new Uint8Array(await compress(data)) : data
                    connection.ws.send(toSend)
                }
            }
        }
        const latency = getForceLatency()
        if(latency === 0) send()
        else setTimeout(send, latency)
    }

    
    const pe = connection.packets.events as EventEmitter<ServerPacketManagerEventMap<ServerSerializerMap, R, P>>

    pe.on("ping", ({ data }) => {
        const { pong } = connection.server.packets.manager.serializers
        const code = new Uint8Array(pong.encode({
            time: data.time,
        }))
        connection.send(code)
    })

    connection.getPing = () => new Promise((resolve, reject) => {
        let completed = false

        const cancel = pe.once("pong", ({ data }) => {
            const ping = Date.now() - data.time
            completed = true
            clearTimeout(timeout)
            resolve(ping)
        })

        const timeout = setTimeout(() => {
            if(completed === false){
                cancel()
                resolve(connection.server.options.maxPing)
            }
        }, connection.server.options.maxPing)

        const code = connection.server.packets.manager.serializers.ping.encode({ time: Date.now() })
        const buffer = new Uint8Array(code).buffer
        connection.send(buffer)
    })
}