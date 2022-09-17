import { NumberPacket, StringPacket } from "@pip-pip/core/src/networking/Packets"

export type PipPipPackets = {
    "ping": NumberPacket,
    "pong": StringPacket,
}

export const pipPipPackets: PipPipPackets = {
    "ping": new NumberPacket("p"),
    "pong": new StringPacket("_"),
}