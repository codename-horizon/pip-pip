import { Client } from "."
import { PacketManagerSerializerMap } from "../packets/manager"
import { RawData, WebSocket as NodeWebSocket } from "ws"

export function initializeWebSockets<T extends PacketManagerSerializerMap>(client: Client<T>){
    const isBrowser = typeof window !== "undefined"
    const getWsUrl = () => [
        client.options.wss ? "wss" : "ws",
        "://", client.options.host, ":",
        client.options.port,
    ].join("")

    client.send = (data: string | ArrayBuffer) => {
        if(typeof client.ws === "undefined") return
        client.ws.send(data)
    }

    client.connectWebSocket = () => new Promise((resolve, reject) => {
        if(typeof client.websocketToken === "undefined") reject(new Error("Client token not set."))
        let verified = false

        const openHandler = () => {
            client.send(client.websocketToken as string)
        }

        const closeHandler = () => {
            if(verified){
                client.events.emit("socketClose")
            } else{
                reject()
            }
        }

        const messageHandler = (data: string | ArrayBuffer) => {
            client.events.emit("socketMessage", { data, verified })
            if(verified === true){
                if(data instanceof ArrayBuffer){
                    try{
                        const packets = client.packets.manager.decode(data)
                        for(const key in packets){
                            const values = packets[key] || []
                            for(const value of values){
                                client.packets.events.emit(key, {
                                    data: value, packets,
                                } as any)
                            }
                        }
                        client.events.emit("packetMessage", { packets })
                    } catch(e){
                        console.warn(e)
                    }
                }
            } else{
                if(typeof data === "string"){
                    const connectionId = data
                    if(connectionId === client.connectionId){
                        verified = true
                        client.events.emit("socketReady")
                        resolve()
                    }
                }
            }
        }

        if(isBrowser){
            const ws = new WebSocket(getWsUrl())
            ws.binaryType = "arraybuffer"
            ws.addEventListener("open", openHandler)
            ws.addEventListener("close", closeHandler)
            ws.addEventListener("message", (data) => {
                messageHandler(data instanceof ArrayBuffer ? data : data.toString())
            })
            client.ws = ws
        } else{
            const ws = new NodeWebSocket(getWsUrl())
            ws.binaryType = "arraybuffer"
            ws.on("open", openHandler)
            ws.on("close", closeHandler)
            ws.on("message", (data: RawData) => {
                messageHandler(data instanceof ArrayBuffer ? data : data.toString())
            })
            client.ws = ws
        }
    })

    client.connect = async () => {
        try{
            if(client.hasIdAndTokens){
                await client.verifyConnection()
            } else{
                await client.requestConnection()
            }
        } catch(e){
            await client.requestConnection()
        }
        await client.connectWebSocket()
    }
}