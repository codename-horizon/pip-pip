import { NumberPacket } from "@pip-pip/core/src/networking/Packets"

export const clientServerPackets = {
    "ping": new NumberPacket("p"),
}

export const clientPackets = {
    ...clientServerPackets,
}

export const serverPackets = {
    ...clientServerPackets,
}