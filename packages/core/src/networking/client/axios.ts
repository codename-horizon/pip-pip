import axios from "axios"
import { Client, ClientTypes } from "."
import { ConnectionJSON } from "../server/connection"

export function initializeApi<T extends ClientTypes>(client: Client<T>){
    client.getTcpUrl = () => [
        client.options.tcpProtocol, "://", 
        client.options.host, ":", client.options.port,
        client.options.baseRoute,
    ].join("")

    client.getUdpUrl = () => [
        client.options.udpProtocol, "://", 
        client.options.host, ":", client.options.port,
    ].join("")

    client.api = axios.create({
        baseURL: client.getTcpUrl(),
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json; charset=utf-8",
        },
    })

    client.api.interceptors.request.use((config) => {
        const token = client.token
        if(
            typeof config.headers !== "undefined" &&
            typeof token === "string" &&
            token?.length > 0
        ){
            config.headers.authorization = token
        }
        return config
    })

    client.registerConnection = async () => {
        const { data } = await client.api.get<ConnectionJSON<T["PublicConnectionData"]>>("/register")
        client.setToken(data.token)
        return data
    }
}

export const test = {
    hello(){
        console.log("hi")
    }
}