import { Client, ClientTypes } from "."
import { WebSocket as NodeWebSocket } from "ws"

export function initializeSocketHandler<T extends ClientTypes>(client: Client<T>){
    client.isBrowser = () => typeof module === "undefined"
    client.connectSocket = () => new Promise((resolve, reject) => {
        const WebSocketClass = client.isBrowser() ? WebSocket : NodeWebSocket
        client.ws = new WebSocketClass(client.getUdpUrl())
        client.ws.onopen = () => {
            if(typeof client.token === "undefined"){
                client.closeSocket()
                reject()
                return
            }
            client.sendSocketData(client.token)
            client.packetEvents.once("connectionHandshake", () => {
                client.handleSocketOpen()
                resolve()
            })
        }
        client.ws.onerror = () => {
            client.handleSocketError()
            reject()
        }
        client.ws.onclose = () => client.handleSocketClose()
        client.ws.onmessage = (event: MessageEvent) => client.handleSocketMessage(event.data.toString())
    })

    client.sendSocketData = (data: string) => {
        if(typeof client.ws !== "undefined"){
            client.ws.send(data)
        }
    }

    client.closeSocket = () => {
        if(typeof client.ws !== "undefined"){
            client.ws.close()
        }
    }

    client.handleSocketOpen = () => {
        client.clientEvents.emit("socketOpen")
    }

    client.handleSocketMessage = (data: string) => {
        client.clientEvents.emit("socketMessage")
        try{
            const packetGroup = client.packetManager.decodeGroup(data)
            for(const packet of packetGroup){
                client.packetEvents.emit(packet.id, {
                    group: packetGroup,
                    value: packet.value as any,
                })
            }
        } catch(e){
            client.clientEvents.emit("packetError", { data })
        }
    }

    client.handleSocketError = () => {
        client.clientEvents.emit("socketError")
    }

    client.handleSocketClose = () => {
        client.clientEvents.emit("socketClose")
    }
}