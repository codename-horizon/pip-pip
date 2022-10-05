import { $biguint64 } from "./serializer"
import { Packet } from "./packet"

export const serverPackets = {
    ping: new Packet({
        time: $biguint64,
    }),
    pong: new Packet({
        time: $biguint64,
    }),
}

export type ServerSerializerMap = typeof serverPackets