import axios from "axios"

import { ConnectionJSON, ConnectionLobbyJSON, LobbyJSON } from "../api/types"
import { PacketManagerSerializerMap } from "../packets/manager"
import { Client } from "."

export function initializeAxios<T extends PacketManagerSerializerMap>(client: Client<T>){
    client.initializeApi = () => {
        client.api = axios.create({
            baseURL: client.httpUrl,
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
    }

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

    client.createLobby = async (type: string) => {
        const { data } = await client.api.post<LobbyJSON>("/lobbies", { type })
        return data
    }

    client.getConnectedLobby = async () => {
        const { data } = await client.api.get<ConnectionLobbyJSON>("/lobbies/connected")
        return data
    }

    client.joinLobby = async (id: string) => {
        try{
            const connectedLobby = await client.getConnectedLobby()
            return connectedLobby
        } catch(e){
            // Probably not connected in lobby
        }
        const { data } = await client.api.post<ConnectionLobbyJSON>("/lobbies/join", { id })
        return data
    }

    client.leaveLobby = async () => {
        const { data } = await client.api.post<ConnectionLobbyJSON>("/lobbies/leave")
        return data
    }
}