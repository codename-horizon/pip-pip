import { Client, ClientOptions } from "@pip-pip/core/src/client"
import { pipPipPacketMap, PipPipPacketMap } from "./packets"

export type PublicConnectionData = {
    name: string,
    score: number,
}

export type ClientTypes = {
    PublicConnectionData: PublicConnectionData,
    PacketMap: PipPipPacketMap
}

export class PipPipClient extends Client<ClientTypes>{
    constructor(options: Partial<ClientOptions> = {}){
        super(options)

        this.setPacketMap(pipPipPacketMap)
    }
}