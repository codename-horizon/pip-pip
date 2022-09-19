import { NumberPacket } from "@pip-pip/core/src/common"

export type PipPipPacketMap = {
    "test": NumberPacket,
}

export const pipPipPacketMap = {
    "test": new NumberPacket("9"),
}