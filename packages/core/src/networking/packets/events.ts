import { InternalPacketMap } from "."
import { EventEmitter } from "../../events"
import { PacketDecoded, PacketMap } from "./types"

export type ClientPacketEventMap<PM extends PacketMap> = {
    [K in keyof PM]: {
        group: PacketDecoded[],
        value: ReturnType<PM[K]["decode"]>,
    }
}

export type ServerPacketEventMap<PM extends PacketMap> = {
    [K in keyof PM]: {
        group: PacketDecoded[],
        value: ReturnType<PM[K]["decode"]>,
        ws: WebSocket,
    }
}

// Case these internal types for better hinting

export type InternalClientPacketEventMap = ClientPacketEventMap<InternalPacketMap>
export type InternalServerPacketEventMap = ServerPacketEventMap<InternalPacketMap>

export type InternalClientPacketEventEmitter = EventEmitter<InternalClientPacketEventMap>
export type InternalServerPacketEventEmitter = EventEmitter<InternalServerPacketEventMap>