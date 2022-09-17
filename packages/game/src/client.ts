import { ConnectionManager } from "@pip-pip/core/src/networking/ConnectionManager"
import { ConnectionOptions } from "@pip-pip/core/src/types/client"
import { PipPipPackets, pipPipPackets } from "./packets"

export class PipPipConnectionManager 
    extends ConnectionManager<PipPipPackets>{
    constructor(options: Partial<ConnectionOptions> = {}){
        super(options)
        this.setPacketDefinitions(pipPipPackets)
    }
}