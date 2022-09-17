/* REMINDER: BROWSER-SAFE */
import { WebSocket as NodeWebSocket } from "ws"
import { SERVER_DEFAULT_BASE_ROUTE } from "../lib/constants"
import axios, { AxiosInstance } from "axios"
import { ClientPacketEventMap, ConnectionOptions, DefaultClientPacketEventMap, Flatten, HorizonEventMap, PacketDefinitions } from "../types/client"
import { defaultClientPackets, PacketManager } from "./Packets"
import { HorizonEventEmitter } from "./Events"
import { ServerEventMap } from "../types/server"
import { testPacketKeyDuplicates } from "../lib/utils"

export class ConnectionManager<
    PacketDefs extends PacketDefinitions = PacketDefinitions,
    CustomEventMap extends HorizonEventMap = Record<string, never>,
>{
    options: ConnectionOptions
    ws?: WebSocket | NodeWebSocket
    api!: AxiosInstance

    token?: string
    isConnected = false
    isReconciled = false

    get isAuthenticated(){
        return typeof this.token === "string"
    }

    packetManager!: PacketManager<Flatten<PacketDefs & DefaultClientPacketEventMap>>
    packetEvents: HorizonEventEmitter<ClientPacketEventMap<PacketDefs>> = new HorizonEventEmitter()
    serverEvents: HorizonEventEmitter<ServerEventMap> = new HorizonEventEmitter()
    customEvents: HorizonEventEmitter<CustomEventMap> = new HorizonEventEmitter()

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
    }

    setPacketDefinitions(packetDefinitions: PacketDefs){
        testPacketKeyDuplicates(packetDefinitions, defaultClientPackets)
        this.packetManager = new PacketManager({
            ...packetDefinitions,
            ...defaultClientPackets,
        } as Flatten<PacketDefs & DefaultClientPacketEventMap>)
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
        const { data } = await this.api.get("/auth")
        this.setToken(data.token)
        return data
    }

    async getLobbies(){
        const { data } = await this.api.get("/lobbies")
        return data
    }

    async getLobbyInfo(id: string){
        const { data } = await this.api.get("/lobbies/info", {
            params: { id },
        })
        return data
    }

    async createLobby(type = "default"){
        const { data } = await this.api.get("/lobbies/create", {
            params: { type },
        })
        return data
    }

    connect(){
        console.log("Connecting...")
        if(this.isConnected) return
        return new Promise<void>(resolve => {
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
        console.log("Opened connection.")
        this.isConnected = true
        this.isReconciled = false
        if(typeof this.token === "string"){
            this.socketSendMessage(this.token)
        }
    }
        
    socketMessageHandler(data: string){
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
        console.log("Closed conection!")
        this.isConnected = false
        this.isReconciled = false
    }
}