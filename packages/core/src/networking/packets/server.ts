import { Packet } from "./packet"
import { $uint32 } from "./serializer"

export const serverPackets = {
    ping: new Packet({
        time: $uint32,
    }),
    pong: new Packet({
        time: $uint32,
    }),
}

export type ServerSerializerMap = typeof serverPackets