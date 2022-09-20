import { NumberPacket, StringPacket } from "@pip-pip/core/src/common"

export type PipPipPacketMap = {
    "test": NumberPacket,
    "player-move": StringPacket,
}

export const pipPipPacketMap = {
    "test": new NumberPacket("9"),
    "player-move": new StringPacket("s"),
}