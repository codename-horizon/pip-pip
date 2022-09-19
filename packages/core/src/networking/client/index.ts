import { AxiosInstance } from "axios"
import { WebSocket as NodeWebSocket } from "ws"

import { SERVER_DEFAULT_BASE_ROUTE } from "../../lib/constants"
import { EventEmitter } from "../events"
import { ClientPacketEventMap, internalPacketMap, InternalPacketMap, PacketManager, PacketMap } from "../packets"
import { ConnectionJSON } from "../server/connection"
import { initializeApi } from "./axios"

export type ClientOptions = {
    baseRoute: string,
    port: number,
    host: string,
    udpProtocol: string,
    tcpProtocol: string,
}

export type ClientEvents = {
    connect: undefined,
}

export type ClientTypes = {
    PacketMap: PacketMap,
    PublicConnectionData: Record<string, any>,
}

export class Client<T extends ClientTypes>{
    options: ClientOptions

    clientEvents: EventEmitter<ClientEvents> = new EventEmitter("Client")
    packetEvents: EventEmitter<ClientPacketEventMap<T["PacketMap"] & InternalPacketMap>> = new EventEmitter("ClientPacket")

    packetManager!: PacketManager<T["PacketMap"] & InternalPacketMap>

    ws?: WebSocket | NodeWebSocket
    api!: AxiosInstance

    constructor(options: Partial<ClientOptions>){
        this.options = {
            udpProtocol: "ws",
            tcpProtocol: "http",
            host: "localhost",
            port: 3000,
            baseRoute: SERVER_DEFAULT_BASE_ROUTE,
            ...options,
        }

        initializeApi(this)
    }

    setPacketMap(packetMap: T["PacketMap"]){
        this.packetManager = new PacketManager({ ...packetMap, ...internalPacketMap })
    }
}

export interface Client<T extends ClientTypes>{
    // API methods defined in ./axios.ts
    getTcpUrl: () => string
    getUdpUrl: () => string
    registerConnection: () => Promise<ConnectionJSON<T["PublicConnectionData"]>>
    getLobbies: () => Promise<void>
    getLobbyInfo: (id: string) => Promise<void>
    createLobby: (id?: string, type?: string) => Promise<void>
}