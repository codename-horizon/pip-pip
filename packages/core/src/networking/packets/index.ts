export * from "./manager"
export * from "./types"
export * from "./events"

import { PacketManager } from "./manager"
import { NumberPacket, StringPacket } from "./types"

export type InternalPacketMap = {
    "connectionHandshake": StringPacket,
    "ping": NumberPacket,
}

export type InternalPacketManager = PacketManager<InternalPacketMap>

export const internalPacketMap: InternalPacketMap = {
    "connectionHandshake": new StringPacket("0"),
    "ping": new NumberPacket("1"),
}
