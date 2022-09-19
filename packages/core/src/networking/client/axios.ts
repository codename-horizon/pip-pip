import axios from "axios"
import { Client, ClientTypes } from "."

export function initializeApi<T extends ClientTypes>(client: Client<T>){
    client.getTcpUrl = () => [
        client.options.tcpProtocol, "://", 
        client.options.host, ":", client.options.port,
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
}

export const test = {
    hello(){
        console.log("hi")
    }
}