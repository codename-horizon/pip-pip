import { Server } from "../server"
import { EventEmitter } from "../../common/events"
import { PacketManagerSerializerMap, ServerPacketManagerEventMap } from "../packets/manager"
import { ServerSerializerMap } from "../packets/server"
import { ConnectionEventMap } from "../server/events"
import { Lobby } from "../lobby"

export type ConnectionLatencyRecord = {
    amount: number,
    timestamp: ReturnType<typeof Date["now"]>,
}

export class Connection<
    T extends PacketManagerSerializerMap,
    R extends Record<string, any> = Record<string, any>,
    P extends Record<string, any> = Record<string, any>,
>{
    server: Server<T, R, P>
    lobby?: Lobby<T, R, P>

    events: EventEmitter<ConnectionEventMap> = new EventEmitter()

    locals = {} as R

    packets: {
        events: EventEmitter<ServerPacketManagerEventMap<T & ServerSerializerMap>>
    }

    latencyHistory: ConnectionLatencyRecord[] = []

    constructor(server: Server<T, R, P>){
        this.server = server
        this.packets = {
            events: new EventEmitter()
        }
    }

    get latency(): ConnectionLatencyRecord{
        if(0 in this.latencyHistory){
            return this.latencyHistory[0]
        }
        return {
            amount: 0,
            timestamp: Date.now(),
        }
    }
}