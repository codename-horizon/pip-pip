export * from "./manager"
export * from "./types"
export * from "./events"

import { PacketManager } from "./manager"
import { NumberPacket, StringPacket } from "./types"

export type InternalPacketMap = {
    "connectionReconcile": StringPacket,
    "ping": NumberPacket,
}

export type InternalPacketManager = PacketManager<InternalPacketMap>

export const internalPacketMap: InternalPacketMap = {
    "connectionReconcile": new StringPacket("0"),
    "ping": new NumberPacket("1"),
}
