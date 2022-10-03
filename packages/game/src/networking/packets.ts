import { $uint8, Packet, PacketManager } from "@pip-pip/core/src/common";

export const packetManager = new PacketManager({
    shoot: new Packet({
        count: $uint8,
    }),
    dodge: new Packet({
        count: $uint8,
    })
})