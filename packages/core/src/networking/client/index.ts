import { AxiosInstance } from "axios"
import { WebSocket as NodeWebSocket } from "ws"

import { SERVER_DEFAULT_BASE_ROUTE, SERVER_DEFAULT_HEADER_KEY, SERVER_DEFAULT_MAX_PING } from "../../lib/constants"
import { ClientPacketManagerEventMap, PacketManager, PacketManagerSerializerMap } from "../packets/manager"
import { ConnectionJSON, ConnectionLobbyJSON, LobbyJSON } from "../api/types"
import { ServerSerializerMap } from "../packets/server"
import { initializeWebSockets } from "./websockets"
import { EventEmitter } from "../../common/events"
import { initializeAxios } from "./axios"
import { ClientEventMap } from "./events"

export type ClientOptions = {
    authHeader: string,
    baseRoute: string,
    port: number,
    host: string,
    https: boolean,
    wss: boolean,
    maxPing: number,
}

export class Client<T extends PacketManagerSerializerMap>{
    events: EventEmitter<ClientEventMap<T>> = new EventEmitter("Client")
    options: ClientOptions = {
        authHeader: SERVER_DEFAULT_HEADER_KEY,
        baseRoute: SERVER_DEFAULT_BASE_ROUTE,

        port: 3000,
        host: "localhost",
        
        https: false,
        wss: false,

        maxPing: SERVER_DEFAULT_MAX_PING,
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

        this.setHost(this.options.host, this.options.port)
    }

    setHost(host: string, port?: number){
        this.options.host = host
        if(typeof port === "number") this.setPort(port)
        this.initializeApi()
    }

    setPort(port: number){
        this.options.port = port
    }

    get wsUrl(){
        return [
            this.options.wss ? "wss" : "ws",
            "://", this.options.host, ":",
            this.options.port,
        ].join("")
    }

    get httpUrl(){
        return [
            this.options.https ? "https" : "http",
            "://", this.options.host, ":",
            this.options.port, this.options.baseRoute,
        ].join("")
    }

    get hasIdAndTokens(){
        return typeof this.connectionId === "string" && typeof this.connectionToken === "string" && typeof this.websocketToken === "string"
    }

    get isReady(){
        return this.hasIdAndTokens &&
            typeof this.ws !== "undefined" &&
            this.ws.readyState === this.ws.OPEN
    }
}

export interface Client<T extends PacketManagerSerializerMap>{
    // axios.ts
    api: AxiosInstance
    initializeApi: () => void
    requestConnection: () => Promise<ConnectionJSON>
    verifyConnection: () => Promise<ConnectionJSON>

    createLobby: (type: string) => Promise<LobbyJSON>
    joinLobby: (id: string) => Promise<ConnectionLobbyJSON>
    getConnectedLobby: () => Promise<ConnectionLobbyJSON>
    leaveLobby: () => Promise<ConnectionLobbyJSON>

    // websockets.ts
    ws?: WebSocket | NodeWebSocket
    connectWebSocket: () => Promise<void>
    send: (data: string | ArrayBuffer) => void
    connect: () => Promise<void>
    getPing: () => Promise<number>
    disconnect: () => Promise<void>
}