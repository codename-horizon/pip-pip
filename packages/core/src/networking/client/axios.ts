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

    client.registerConnection = async () => {
        const { data } = await client.api.get<ConnectionJSON<T["PublicConnectionData"]>>("/register")
        return data
    }
}

export const test = {
    hello(){
        console.log("hi")
    }
}