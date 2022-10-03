import { PacketManagerSerializerMap } from "../packets/manager"
import { Server } from "."
import { Lobby, LobbyInitializer, LobbyTypeOptions } from "../lobby"

export function initializeLobbyMethods<
    T extends PacketManagerSerializerMap,
    R extends Record<string, any> = Record<string, any>,
    P extends Record<string, any> = Record<string, any>,
>(server: Server<T, R, P>){
    server.registerLobby = (type: string, options: LobbyTypeOptions, initializer: LobbyInitializer<T>) => {
        if(type in server.lobbyType) throw new Error(`Lobby Type "${type}" already registered in server.`)
        server.lobbyType[type] = {
            options,
            initializer,
        }
    }

    server.createLobby = <K extends keyof Server<T, R, P>["lobbyType"]>(type: K, id?: string) => {
        if(!(type in server.lobbyType)) throw new Error(`Lobby type "${type}" does not exist.`)

        const lobbyType = server.lobbyType[type]

        const lobbies = Object.values(server.lobbies)
        if(lobbies.length >= server.options.maxLobbies) throw new Error("Max lobbies reached.")

        const instances = lobbies.filter(lobby => lobby.type === type)
        if(instances.length >= lobbyType.options.maxInstances) throw new Error(`Max instances of lobby type "${type}" reached.`)
     
        const lobby = new Lobby(server, type)
        lobbyType.initializer({
            lobby,
            server: server,
        })

        if(typeof id === "string") lobby.id = id
        server.lobbies[lobby.id] = lobby

        server.events.emit("createLobby", { lobby })

        return lobby
    }

    server.removeLobby = (lobby: Lobby<T, R, P>) => {
        if(lobby.id in server.lobbies){
            delete server.lobbies[lobby.id]
            server.events.emit("removeLobby", { lobby })
            lobby.destroy()
        }
    }
}