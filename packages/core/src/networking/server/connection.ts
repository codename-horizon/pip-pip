import { Server } from "."
import { EventEmitter } from "../../common/events"
import { PacketManagerSerializerMap, ServerPacketManagerEventMap } from "../packets/manager"
import { ServerSerializerMap } from "../packets/server"
import { ConnectionEventMap } from "./events"
import { Lobby } from "./lobby"

export type LatencyRecord = {
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

    latencyHistory: LatencyRecord[] = []

    constructor(server: Server<T, R, P>){
        this.server = server
        this.packets = {
            events: new EventEmitter()
        }
    }

    get latency(): LatencyRecord{
        if(0 in this.latencyHistory){
            return this.latencyHistory[0]
        }
        return {
            amount: 0,
            timestamp: Date.now(),
        }
    }
}