import { NumberPacket } from "@pip-pip/core/src/networking/Packets"

export const pipPipPackets = {
    "ping": new NumberPacket("p"),
    "error-2": new NumberPacket("_"),
}

export const clientPackets = {
    ...pipPipPackets,
}

export const serverPackets = {
    ...pipPipPackets,
}