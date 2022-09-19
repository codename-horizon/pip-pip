/* REMINDER: BROWSER-SAFE */
import { WebSocket as NodeWebSocket } from "ws"
import { SERVER_DEFAULT_BASE_ROUTE } from "../lib/constants"
import axios, { AxiosInstance } from "axios"
import { ConnectionManagerEventMap, ConnectionOptions, EventMap } from "../types/client"
import { InternalPacketManager } from "./Packets"
import { EventEmitter } from "./Events"
import { ClientPacketEventMap, InternalBasePacketManager, InternalClientPacketEventEmitter, PacketMap } from "../types/packets"
import { Server } from "./Server"

export class ConnectionManager<
    PM extends PacketMap = PacketMap,
    EM extends EventMap = Record<string, never>,
>{
    options: ConnectionOptions
    ws?: WebSocket | NodeWebSocket
    api!: AxiosInstance

    token?: string
    isConnected = false
    isReconciled = false
    loading = false

    get isAuthenticated(){
        return typeof this.token === "string"
    }

    packetManager!: InternalPacketManager<PM>
    packetEvents: EventEmitter<ClientPacketEventMap<PM>> = new EventEmitter("CONNECTION_MANAGER_PACKET_EVENTS")
    managerEvents: EventEmitter<ConnectionManagerEventMap> = new EventEmitter("CONNECTION_MANAGER_EVENTS")
    customEvents: EventEmitter<EM> = new EventEmitter("CONNECTION_MANAGER_CUSTOM_EVENTS")

    constructor(options: Partial<ConnectionOptions> = {}){
        this.options = {
            tcpProtocol: "http",
            udpProtocol: "ws",
            host: "localhost",
            port: 3000,
            baseRoute: SERVER_DEFAULT_BASE_ROUTE,
            ...options,
        }

        this.initializeApi()
        this.managerEvents.emit("authStateChange")

        const pe = this.packetEvents as InternalClientPacketEventEmitter
        pe.on("connectionReconcile", () => {
            if(this.isReconciled === false){
                this.isReconciled = true
                this.managerEvents.emit("socketReconciled")
                this.managerEvents.emit("socketReady")
            }
        })
    }

    setPacketDefinitions(packetMap: PM){
        this.packetManager = new InternalPacketManager(packetMap)
    }

    setLoading(state: boolean){
        this.loading = state
        this.managerEvents.emit("loading", this.loading)
    }

    initializeApi(){
        this.api = axios.create({
            baseURL: this.tcpUrl,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json; charset=utf-8",
            },
        })

        this.api.interceptors.request.use((config) => {
            const token = this.token

            if(
                typeof config.headers !== "undefined" &&
                typeof token === "string" &&
                token?.length > 0
            ){
                config.headers.authorization = token
            }

            return config
        })
    }

    setToken(token: string){
        // save to storage and pick up again later
        this.token = token
    }

    get isBrowser(){
        return typeof module === "undefined"
    }

    get udpUrl(){
        return [
            this.options.udpProtocol, "://", this.options.host, ":", this.options.port,
        ].join("")
    }

    get tcpUrl(){
        return [
            this.options.tcpProtocol, "://", this.options.host, ":", this.options.port, this.options.baseRoute,
        ].join("")
    }

    async authenticate(){
        this.setLoading(true)
        this.managerEvents.emit("beforeAuth")
        const { data } = await this.api.get("/auth")
        this.setToken(data.token)
        this.managerEvents.emit("authenticate")
        this.setLoading(false)
        this.managerEvents.emit("authStateChange")
        return data
    }

    async getLobbies(){
        this.setLoading(true)
        const { data } = await this.api.get("/lobbies")
        this.setLoading(false)
        return data
    }

    async getLobbyInfo(id: string){
        this.setLoading(true)
        const { data } = await this.api.get("/lobbies/info", {
            params: { id },
        })
        this.setLoading(false)
        return data
    }

    async createLobby(type = "default"){
        this.setLoading(true)
        const { data } = await this.api.get("/lobbies/create", {
            params: { type },
        })
        this.setLoading(false)
        return data
    }

    async connect(){
        if(this.isConnected) return
        this.setLoading(true)
        this.managerEvents.emit("socketConnecting")
        await new Promise<void>(resolve => {
            if(this.isBrowser){
                this.ws = new WebSocket(this.udpUrl)
                this.ws.onclose = () => this.socketCloseHandler()
                this.ws.onmessage = (event) => {
                    this.socketMessageHandler(String(event.data))
                }
                this.ws.onopen = () => {
                    resolve()
                    this.socketConnectedHandler()
                }
            } else{
                this.ws = new NodeWebSocket(this.udpUrl)
                this.ws.onclose = () => this.socketCloseHandler()
                this.ws.onmessage = (event) => {
                    this.socketMessageHandler(String(event.data))
                }
                this.ws.onopen = () => {
                    resolve()
                    this.socketConnectedHandler()
                }
            }
        })
        this.setLoading(false)
    }

    sendPacket(encodedMessages: string | string[]){
        if(typeof this.packetManager === "undefined") return
        if(typeof encodedMessages === "string") encodedMessages = [encodedMessages]
        const message = this.packetManager.group(encodedMessages)
        this.socketSendMessage(message)
    }

    socketSendMessage(data: string){
        if(typeof this.ws === "undefined") return
        if(this.ws.readyState !== this.ws.OPEN) return
        if(this.isBrowser){
            this.ws.send(data)
        } else{
            this.ws.send(data)
        }
    }

    socketConnectedHandler(){
        this.managerEvents.emit("socketConnected")
        this.isConnected = true
        this.isReconciled = false
        if(typeof this.token === "string"){
            this.managerEvents.emit("socketReconciling", true)
            this.socketSendMessage(this.token)
        } else{
            this.ws?.close()
        }
    }

    waitForReconciled(){
        return new Promise<void>((resolve, reject) => {
            if(this.isReconciled) return resolve
            const timeout = setTimeout(() => {
                reject(new Error("Connection recon took too long..."))
            }, 30000)
            this.managerEvents.once("socketReconciled", () => {
                resolve()
                clearTimeout(timeout)
            })
        })
    }
        
    socketMessageHandler(data: string){
        this.managerEvents.emit("socketMessage", { data })
        if(typeof this.packetManager === "undefined") return 
        try{
            const packetGroup = this.packetManager.decodeGroup(data)
            for(const packet of packetGroup){
                this.packetEvents.emit(packet.id, {
                    group: packetGroup,
                    value: packet.value as any,
                })
            }
        } catch(e){
            console.warn(`could not parse message [${data}]`)
            console.warn(e)
        }
    }

    socketCloseHandler(){
        this.isConnected = false
        this.isReconciled = false
        this.managerEvents.emit("authStateChange")
        this.managerEvents.emit("logout")
        this.managerEvents.emit("socketClose")
    }

    getPing(){
        return new Promise<number>((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("Ping took longer than 1000ms"))
            }, 1000)
            
            const pm = this.packetManager as InternalBasePacketManager
            const pe = this.packetEvents as InternalClientPacketEventEmitter

            this.sendPacket([
                pm.encode("ping", Date.now())
            ])

            pe.once("ping", ({ value }) => {
                clearTimeout(timeout)
                resolve(Date.now() - value)
            })
        })
    }
}