import { EventEmitter } from "../networking/Events"
import { BasePacket, NumberPacket, PacketManager, StringPacket } from "../networking/Packets"
import { Flatten, PacketDecoded } from "./client"

export type PacketMap = {
    [key: string]: BasePacket,
}

export type PacketValueMap<T extends PacketMap = PacketMap> = {
    [K in keyof T]: ReturnType<T[K]["decode"]>
}

export type InternalPacketMap = {
    "connectionReconcile": StringPacket,
    "ping": NumberPacket,
}

export type ClientPacketEventMap<
    PacketDefs extends PacketMap,
    AllDefs extends PacketMap = Flatten<PacketDefs & InternalPacketMap>> = {
    [eventName in keyof AllDefs]: {
        group: PacketDecoded[],
        value: ReturnType<AllDefs[eventName]["decode"]>,
    }
}

export type InternalBasePacketManager = PacketManager<InternalPacketMap>
export type InternalClientPacketEventEmitter = EventEmitter<ClientPacketEventMap<InternalPacketMap>>