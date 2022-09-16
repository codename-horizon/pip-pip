/* REMINDER: BROWSER-SAFE */
import { WebSocket as NodeWebSocket } from "ws"
import { SERVER_DEFAULT_BASE_ROUTE } from "../lib/constants"
import axios, { AxiosInstance } from "axios"
import { ConnectionOptions } from "../types/client"

export class ConnectionManager{
    options: ConnectionOptions
    ws?: WebSocket | NodeWebSocket
    api!: AxiosInstance

    token?: string
    connected = false
    reconciled = false

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
        if(this.connected) return
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
        this.connected = true
        this.reconciled = false
        if(typeof this.token === "string"){
            this.socketSendMessage(this.token)
        }
    }
        
    socketMessageHandler(data: string){
        console.log(data)
    }

    socketCloseHandler(){
        console.log("Closed conection!")
        this.connected = false
        this.reconciled = false
    }
}