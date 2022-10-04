
import { Connection } from "../connection"
import { GetPacketInput, Packet, PacketSerializerMap } from "./packet"
import { serverPackets, ServerSerializerMap } from "./server"

export type PacketManagerSerializerMap = {
    [packetName: string]: Packet<PacketSerializerMap>,
}

export type GetPacketSerializerMap<T> = T extends Packet<infer R> ? R : never 

export type PacketManagerDecoded<T extends PacketManagerSerializerMap> = {
    [K in keyof T]?: GetPacketInput<GetPacketSerializerMap<T[K]>>[]
}

export class BasePacketManager<T extends PacketManagerSerializerMap>{
    serializers: T

    constructor(serializers: T){{
        this.serializers = serializers

        const p = Object.values(this.serializers)
        if(p.length > 256) throw new Error("Packet manager can only handle 256 packet types.")
        for(let i = 0; i < p.length; i++){
            p[i].setId(i)
        }
    }}

    encode<K extends keyof T, I extends GetPacketInput<GetPacketSerializerMap<T[K]>>>(serializer: K, input: I | I[]){
        return this.serializers[serializer].encode(input)
    }

    decode(value: number[] | Uint8Array | ArrayBuffer): PacketManagerDecoded<T>{
        const arr = Array.from(value instanceof ArrayBuffer ? new Uint8Array(value) : value)
        const output: PacketManagerDecoded<T> = {}

        while(arr.length > 0){
            let serializerId: keyof T | undefined = undefined
            for(const id in this.serializers){
                if(this.serializers[id].decodable(arr)){
                    serializerId = id
                    break
                }
            }
            if(typeof serializerId === "undefined") break
            const serializer = this.serializers[serializerId]
            const length = serializer.peekLength(arr)
            const splice = arr.splice(0, length)
            const decoded = serializer.decode(splice) as GetPacketInput<GetPacketSerializerMap<T[keyof T]>>
            if(typeof output[serializerId] === "undefined") output[serializerId] = []
            output[serializerId]?.push(decoded)
        }

        return output
    }
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

export type ServerPacketManagerEventMap<
    T extends PacketManagerSerializerMap,
    R extends Record<string, any> = Record<string, any>,
    P extends Record<string, any> = Record<string, any>,
> = {
    [K in keyof T]: {
        ws: WebSocket,
        data: GetPacketInput<GetPacketSerializerMap<T[K]>>,
        connection: Connection<T, R, P>,
        packets: PacketManagerDecoded<T & ServerSerializerMap>,
    }
}

export type ClientPacketManagerEventMap<T extends PacketManagerSerializerMap> = {
    [K in keyof T]: {
        data: GetPacketInput<GetPacketSerializerMap<T[K]>>,
        packets: PacketManagerDecoded<T & ServerSerializerMap>,
    }
}