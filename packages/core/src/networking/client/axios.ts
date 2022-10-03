import { Client } from "."
import axios from "axios"
import { PacketManagerSerializerMap } from "../packets/manager"
import { ConnectionJSON } from "../api/types"

export function initializeAxios<T extends PacketManagerSerializerMap>(client: Client<T>){
    const getHttpUrl = () => [
        client.options.https ? "https" : "http",
        "://", client.options.host, ":",
        client.options.port, client.options.baseRoute,
    ].join("")

    client.api = axios.create({
        baseURL: getHttpUrl(),
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json; charset=utf-8",
        },
    })

    client.api.interceptors.request.use((config) => {
        const { connectionToken } = client

        if(
            typeof config.headers !== "undefined" &&
            typeof connectionToken === "string" &&
            connectionToken.length > 0
        ){
            config.headers[client.options.authHeader] = connectionToken
        }

        return config
    })

    client.requestConnection = async () => {
        const { data } = await client.api.post<ConnectionJSON>("/connection")
        client.connectionId = data.connectionId
        client.connectionToken = data.connectionToken
        client.websocketToken = data.websocketToken
        return data
    }

    client.verifyConnection = async () => {
        const { data } = await client.api.get<ConnectionJSON>("/connection")
        return data
    }
}