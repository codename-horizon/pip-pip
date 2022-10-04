import { Packet } from "./packet"
import { $biguint64, $uint32 } from "./serializer"

export const serverPackets = {
    ping: new Packet({
        time: $biguint64,
    }),
    pong: new Packet({
        time: $biguint64,
    }),
}

export type ServerSerializerMap = typeof serverPackets