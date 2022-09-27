import { BasePacket, PacketDecoded, PacketMap } from "./types"

export class PacketManager<PM extends PacketMap = PacketMap>{
    packets: PM
    packetsByCode: Record<BasePacket["code"], { id: string, packet: BasePacket }> = {}
    delimiter = "\n"

    constructor(packets: PM){
        this.packets = packets

        for(const id in this.packets){
            const packet = this.packets[id]
            this.packetsByCode[packet.code] = { id, packet }

            // Check for duplicate
            for(const id2 in this.packets){
                const packet2 = this.packets[id2]
                if(id !== id2){
                    if(packet.code === packet2.code){
                        throw Error(`Packet code "${packet.code}" is used by both "${id}" and "${id2}". Packet code is most likely already used by the engine.`)
                    }
                }
            }
        }
    }

    code(key: keyof PM){
        return this.packets[key].code
    }

    encode<K extends keyof PM, R extends ReturnType<PM[K]["decode"]>>(key: K, value: R){
        return this.packets[key].encode(value)
    }

    group(value: string[]){
        return value.join(this.delimiter)
    }

    decode(value: string): PacketDecoded{
        const code = value[0]
        if(!(code in this.packetsByCode)) throw Error("code not registered in packet manager")
        const packetHandler = this.packetsByCode[code]
        return {
            id: packetHandler.id,
            code: packetHandler.packet.code,
            value: packetHandler.packet.decode(value),
        }
    }

    decodeGroup(value: string): PacketDecoded[]{
        return value.split(this.delimiter).map(line => this.decode(line))
    }
}