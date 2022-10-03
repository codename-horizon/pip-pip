
import { Packet, PacketSerializerMap } from "./packet"
import { serverPackets, ServerSerializerMap } from "./server"

export type PacketManagerSerializerMap = {
    [packetName: string]: Packet<PacketSerializerMap>,
}

export class BasePacketManager<T extends PacketManagerSerializerMap>{
    packets: T

    constructor(packets: T){{
        this.packets = packets

        const p = Object.values(this.packets)
        if(p.length > 256) throw new Error("Packet manager can only handle 256 packet types.")
        for(let i = 0; i < p.length; i++){
            p[i].setId(i)
        }
    }}
}

export class PacketManager<T extends PacketManagerSerializerMap> 
    extends BasePacketManager<T & ServerSerializerMap>{
    constructor(packets: T){
        super({
            ...packets,
            ...serverPackets,
        })
    }
}

export type ExtractSerializerMap<T> = T extends PacketManager<infer R> ? R : never

export type ServerPacketManager = BasePacketManager<ServerSerializerMap>

export type ServerPacketManagerEventMap<T extends PacketManagerSerializerMap> = {
    [K in keyof T]: undefined
}

export type ClientPacketManagerEventMap<T extends PacketManagerSerializerMap> = {
    [K in keyof T]: undefined
}