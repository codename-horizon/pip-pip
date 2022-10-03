import { ClientPacketManagerEventMap, PacketManager, PacketManagerSerializerMap } from "../packets/manager"
import { Axios, AxiosInstance } from "axios"
import { WebSocket as NodeWebSocket } from "ws"
import { EventEmitter, ServerSerializerMap, SERVER_DEFAULT_BASE_ROUTE, SERVER_HEADER_KEY } from "../../common"
import { initializeAxios } from "./axios"
import { ConnectionJSON } from "../api/types"
import { initializeWebSockets } from "./websockets"
import { ClientEventMap } from "./events"

export type ClientOptions = {
    authHeader: string,
    baseRoute: string,
    port: number,
    host: string,
    https: boolean,
    wss: boolean,
}

export class Client<T extends PacketManagerSerializerMap>{
    events: EventEmitter<ClientEventMap<T>> = new EventEmitter("Client")
    options: ClientOptions = {
        authHeader: SERVER_HEADER_KEY,
        baseRoute: SERVER_DEFAULT_BASE_ROUTE,

        port: 3000,
        host: "localhost",
        
        https: false,
        wss: false,
    }

    packets: {
        manager: PacketManager<T>,
        events: EventEmitter<ClientPacketManagerEventMap<T & ServerSerializerMap>>,
    }
    
    connectionId?: string
    connectionToken?: string
    websocketToken?: string

    constructor(packetManager: PacketManager<T>, options: Partial<ClientOptions> = {}){
        this.options = {
            ...this.options,
            ...options,
        }
        this.packets = {
            manager: packetManager,
            events: new EventEmitter("ClientPackets"),
        }

        initializeAxios(this)
        initializeWebSockets(this)
    }

    get hasIdAndTokens(){
        return typeof this.connectionId === "string" && typeof this.connectionToken === "string" && typeof this.websocketToken === "string"
    }
}

export interface Client<T extends PacketManagerSerializerMap>{
    // axios.ts
    api: AxiosInstance
    requestConnection: () => Promise<ConnectionJSON>
    verifyConnection: () => Promise<ConnectionJSON>

    // websockets.ts
    ws?: WebSocket | NodeWebSocket
    connectWebSocket: () => Promise<void>
    send: (data: string) => void
    connect: () => Promise<void>
}