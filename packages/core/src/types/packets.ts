import { HorizonEventEmitter } from "../networking/Events"
import { BasePacket, NumberPacket, PacketManager } from "../networking/Packets"
import { Flatten, PacketDecoded } from "./client"

export type PacketMap = {
    [key: string]: BasePacket,
}

export type PacketValueMap<T extends PacketMap = PacketMap> = {
    [K in keyof T]: ReturnType<T[K]["decode"]>
}

export type LibPacketMap = {
    "heartbeat": NumberPacket,
}

export type ClientPacketEventMap<
    PacketDefs extends PacketMap,
    AllDefs extends PacketMap = Flatten<PacketDefs & LibPacketMap>> = {
    [eventName in keyof AllDefs]: {
        group: PacketDecoded[],
        value: ReturnType<AllDefs[eventName]["decode"]>,
    }
}

export type InternalPacketManager = PacketManager<LibPacketMap>
export type InternalClientPacketEventEmitter = HorizonEventEmitter<ClientPacketEventMap<LibPacketMap>>