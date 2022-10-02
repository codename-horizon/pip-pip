
import { Packet, PacketSerializerMap } from "./packet"
import { serverPackets, ServerSerializerMap } from "./server"

export type PacketManagerSerializerMap = {
    [packetName: string]: Packet<PacketSerializerMap>,
}

export class BasePacketManager<T extends PacketManagerSerializerMap>{
    packets: T

    constructor(packets: T){{
        this.packets = packets
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

export type ServerPacketManager = BasePacketManager<ServerSerializerMap>

export type ServerPacketManagerEventMap<T extends PacketManagerSerializerMap> = {
    [K in keyof T]: undefined
}

export type ClientPacketManagerEventMap<T extends PacketManagerSerializerMap> = {
    [K in keyof T]: undefined
}