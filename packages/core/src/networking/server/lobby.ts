import { PacketManagerSerializerMap } from "../packets/manager"
import { Server } from "."
import { Lobby, LobbyInitializer, LobbyOptions } from "../lobby"

export function initializeLobbyMethods<
    T extends PacketManagerSerializerMap,
    R extends Record<string, any> = Record<string, any>,
    P extends Record<string, any> = Record<string, any>,
>(server: Server<T, R, P>){
    server.registerLobby = (type: string, options: LobbyOptions, initializer: LobbyInitializer<T>) => {
        if(type in server.lobbyType) throw new Error(`Lobby Type "${type}" already registered in server.`)
        server.lobbyType[type] = {
            options,
            initializer,
        }
    }

    server.createLobby = <K extends keyof typeof server.lobbyType>(type: K, id?: string) => {
        if(!(type in server.lobbyType)) throw new Error(`Lobby type "${type}" does not exist.`)
        // double check if instances have reached max
        // move lobbyoptions into lobbyTypeoptions cause it's different
        const lobbyType = server.lobbyType[type]
        const lobby = new Lobby(server, lobbyType.options)
        lobbyType.initializer({
            lobby,
            server: server,
        })
        if(typeof id === "string") lobby.id = id
        server.lobbies[lobby.id] = lobby
    }
}