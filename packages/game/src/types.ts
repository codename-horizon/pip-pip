import { NumberPacket, StringPacket } from "@pip-pip/core/src/networking/Packets"

export type PipPipConnectionPublicState = {
    name: string,
}

export type PipPipConnectionPrivateState = {
    hidden: false,
}

export type PipPipPackets = {
    "ping": NumberPacket,
    "error-2": StringPacket,
}