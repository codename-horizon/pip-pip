import { ClientPacketManagerEventMap, PacketManager, PacketManagerSerializerMap } from "../packets/manager"
import { Axios, AxiosInstance } from "axios"
import { WebSocket as NodeWebSocket } from "ws"
import { EventEmitter, ServerSerializerMap, SERVER_DEFAULT_BASE_ROUTE, SERVER_HEADER_KEY } from "../../common"
import { initializeAxios } from "./axios"
import { ConnectionJSON } from "../api/types"

export type ClientOptions = {
    authHeader: string,
    baseRoute: string,
    port: number,
    host: string,
    https: boolean,
    wss: boolean,
}

export class Client<T extends PacketManagerSerializerMap>{
    options: ClientOptions = {
        authHeader: SERVER_HEADER_KEY,
        baseRoute: SERVER_DEFAULT_BASE_ROUTE,

        port: 3000,
        host: "127.0.0.1",
        
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
    }
}

export interface Client<T extends PacketManagerSerializerMap>{
    // axios.ts
    api: AxiosInstance
    requestConnection: () => Promise<ConnectionJSON>
}