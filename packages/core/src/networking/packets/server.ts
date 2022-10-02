import { Packet } from "./packet"
import { $uint32 } from "./serializer"

export const serverPackets = {
    ping: new Packet(255, {
        time: $uint32,
    })
}

export type ServerSerializerMap = typeof serverPackets