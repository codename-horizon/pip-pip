import { ConnectionManager } from "@pip-pip/core/src/networking/ConnectionManager"
import { ConnectionOptions } from "@pip-pip/core/src/types/client"
import { clientPackets } from "./packets"

export type PipPipClientPackets = typeof clientPackets

export class PipPipConnectionManager 
    extends ConnectionManager<PipPipClientPackets>{
    constructor(options: Partial<ConnectionOptions> = {}){
        super(options)
        this.setPacketDefinitions(clientPackets)
    }
}