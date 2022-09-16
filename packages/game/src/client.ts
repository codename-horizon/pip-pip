import { ConnectionManager } from "@pip-pip/core/src/networking/ConnectionManager"
import { PacketManager } from "@pip-pip/core/src/networking/Packets"
import { ConnectionOptions } from "@pip-pip/core/src/types/client"
import { clientPackets } from "./packets"

export class PipPipConnectionManager extends ConnectionManager<PacketManager<typeof clientPackets>>{
    constructor(options: Partial<ConnectionOptions> = {}){
        super(options)

        const pm = new PacketManager(clientPackets)
        this.setPacketManager(pm)
    }
}