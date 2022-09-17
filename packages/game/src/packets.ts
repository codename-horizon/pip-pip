import { NumberPacket, StringPacket } from "@pip-pip/core/src/networking/Packets"
import { PipPipPackets } from "./types"

export const pipPipPackets: PipPipPackets = {
    "ping": new NumberPacket("p"),
    "error-2": new StringPacket("_"),
}