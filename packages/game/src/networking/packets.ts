import { $float32, $float64, $uint16, $uint8, $varstring, Packet, PacketManager } from "@pip-pip/core/src/common";

export const packetManager = new PacketManager({
    shoot: new Packet({
        a: $uint16,
        b: $float32,
        c: $float64,
    }),
    dodge: new Packet({
        count: $uint8,
    }),
    name: new Packet({
        id: $varstring,
        name: $varstring,
        n: $float32,
    })
})