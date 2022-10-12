import { $biguint64, $string } from "./serializer"
import { Packet } from "./packet"

export const PING_PONG_PACKET_ID_LENGTH = 1

export const serverPackets = {
    ping: new Packet({
        id: $string(PING_PONG_PACKET_ID_LENGTH),
    }),
    pong: new Packet({
        id: $string(PING_PONG_PACKET_ID_LENGTH),
    }),
}

export type ServerSerializerMap = typeof serverPackets