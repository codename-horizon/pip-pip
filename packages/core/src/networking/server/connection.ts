import { WebSocket } from "ws"

export type ConnectionData = {
    public: Record<string, any>,
    private: Record<string, any>,
}

export enum ConnectionState {
    DISCONNECTED,
}

export type ConnectionId = string

export type Connection<T extends ConnectionData> = {
    id: ConnectionId,
    ws: WebSocket,
    data: T,
}