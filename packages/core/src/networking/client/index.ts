import { AxiosInstance } from "axios"
import { WebSocket as NodeWebSocket } from "ws"

import { CLIENT_DEFAULT_TOKEN_KEY, SERVER_DEFAULT_BASE_ROUTE } from "../../lib/constants"
import { EventEmitter } from "../../events"
import { ClientPacketEventMap, internalPacketMap, InternalPacketMap, PacketManager, PacketMap } from "../packets"
import { ConnectionJSON } from "../server/connection"
import { initializeApi as initializeApiHandler } from "./axios"
import { initializeSocketHandler } from "./sockets"
import { initializeTokenHandler } from "./token"

export type ClientOptions = {
    baseRoute: string,
    port: number,
    host: string,
    udpProtocol: string,
    tcpProtocol: string,
    tokenKey: string,
}

export enum ClientStatus {
    IDLE = 0,
    IDLE_REGISTERED = 1,
    IDLE_CONNECTED = 2,
    READY = 4,
} 

export type ClientEvents = {
    connect: undefined,
    statusChange: ClientStatus,
    tokenSet: undefined,
    tokenUnset: undefined,
    
    socketOpen: undefined,
    socketRegister: undefined,
    socketError: undefined,
    socketMessage: undefined,
    socketClose: undefined,
}

export type ClientTypes = {
    PacketMap: PacketMap,
    PublicConnectionData: Record<string, any>,
}

export class Client<T extends ClientTypes>{
    options: ClientOptions
    token?: string
    status: ClientStatus = ClientStatus.IDLE

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
            tokenKey: CLIENT_DEFAULT_TOKEN_KEY,
            ...options,
        }

        initializeTokenHandler(this)
        initializeApiHandler(this)
        initializeSocketHandler(this)

        this.syncToken()
    }

    setStatus(status: ClientStatus){
        this.status = status
        this.clientEvents.emit("statusChange", this.status)
    }

    setPacketMap(packetMap: T["PacketMap"]){
        this.packetManager = new PacketManager({ ...packetMap, ...internalPacketMap })
    }
}

export interface Client<T extends ClientTypes>{
    // Token methods defined in ./token.ts
    setToken: (token?: string) => void
    syncToken: () => void

    // API methods defined in ./axios.ts
    getTcpUrl: () => string
    getUdpUrl: () => string
    registerConnection: () => Promise<ConnectionJSON<T["PublicConnectionData"]>>
    getLobbies: () => Promise<void>
    getLobbyInfo: (id: string) => Promise<void>
    createLobby: (id?: string, type?: string) => Promise<void>

    // Socket methods defiend in ./sockets.ts
    isBrowser: () => boolean
    connectSocket: () => Promise<void>
    handleSocketOpen: () => void
    handleSocketMessage: (data: string) => void
    handleSocketError: () => void
    handleSocketClose: () => void
    sendSocketData: (data: string) => void
    closeSocket: () => void
}