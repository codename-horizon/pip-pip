import { NumberPacket, StringPacket } from "@pip-pip/core/src/networking/Packets"

export type PipPipPackets = {
    "hello": NumberPacket,
    "parrot": StringPacket,
}

export const pipPipPackets: PipPipPackets = {
    "hello": new NumberPacket("p"),
    "parrot": new StringPacket("k"),
}