import { WebSocket } from "ws"
import { Server, ServerTypes } from "."
import { generateId } from "../../common"

export type ConnectionData = {
    public: Record<string, any>,
    private: Record<string, any>,
}

export enum ConnectionStatus {
    IDLE = 0,
    CONNECTED = 1,
    READY = 2,
}

export type ConnectionId = string
export type ConnectionToken = string

export type Connection<T extends ConnectionData> = {
    id: ConnectionId,
    token: ConnectionToken,
    data: T,
    status: ConnectionStatus,

    ws?: WebSocket,
    _idleTimeout?: NodeJS.Timeout,
}

export type ConnectionJSON<T extends Record<string, any>> = {
    id: ConnectionId,
    data: T,
    status: ConnectionStatus,
}

export function initializeConnectionHandlers<T extends ServerTypes>(server: Server<T>){
    server.createConnection = async () => {
        const connection: Connection<T["ConnectionData"]> = {
            id: generateId(),
            token: generateId(),
            data: server.options.connectionDataFactory(),
            status: ConnectionStatus.IDLE,
        }

        server.startConnectionIdle(connection)

        await server.registerConnection(connection)

        return connection
    }

    server.registerConnection = async (connection: Connection<T["ConnectionData"]>) => {
        if(connection.id in server.connections){
            throw new Error(`Connection ID ${connection.id} already registered in server.`)
        }
        server.connections[connection.id] = connection
        server.serverEvents.emit("registerConnection", { connection })
    }

    server.getConnectionByToken = async (token: ConnectionToken) => {
        for(const id in server.connections){
            const connection = server.connections[id]
            if(connection.token === token){
                return connection
            }
        }
    }

    server.destroyConnection = async (connection: Connection<T["ConnectionData"]>) => {
        if(!(connection.id in server.connections)){
            throw new Error(`Connection ID ${connection.id} does not exist in server.`)
        }
        if(typeof connection.ws !== "undefined"){
            connection.ws.close()
        }
        delete server.connections[connection.id]
        server.serverEvents.emit("destroyConnection", { connection })
    }

    server.startConnectionIdle = (connection: Connection<T["ConnectionData"]>) => {
        connection._idleTimeout = setTimeout(() => {
            server.destroyConnection(connection)
        }, server.options.connectionIdleLifespan)
        server.serverEvents.emit("connectionIdleStart", { connection })
    }

    server.endConnectionIdle = (connection: Connection<T["ConnectionData"]>) => {
        if(typeof connection._idleTimeout === "undefined"){
            clearTimeout(connection._idleTimeout)
            server.serverEvents.emit("connectionIdleEnd", { connection })
        }
    }

    server.getConnectionJSON = (connection: Connection<T["ConnectionData"]>): ConnectionJSON<T["ConnectionData"]["public"]> => {
        return {
            id: connection.id,
            data: connection.data.public,
            status: connection.status,
        }
    }
}