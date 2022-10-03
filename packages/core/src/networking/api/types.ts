import { ConnectionStatus } from "../connection"
import { LobbyStatus } from "../lobby"

export type ConnectionJSON = {
    connectionId: string,
    connectionToken?: string,
    websocketToken?: string,
    status: ConnectionStatus,
}

export type LobbyJSON = {
    lobbyId: string,
    lobbyType: string,
    connections: number,
    maxConnections: number,
    status: LobbyStatus,
}