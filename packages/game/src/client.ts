import { ConnectionManager } from "@pip-pip/core/src/networking/ConnectionManager"
import { ConnectionOptions } from "@pip-pip/core/src/types/client"
import { pipPipPackets } from "./packets"
import { PipPipPackets } from "./types"

export class PipPipConnectionManager 
    extends ConnectionManager<PipPipPackets>{
    constructor(options: Partial<ConnectionOptions> = {}){
        super(options)
        this.setPacketDefinitions(pipPipPackets)
    }
}