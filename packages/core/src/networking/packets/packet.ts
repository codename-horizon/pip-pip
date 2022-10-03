import { PacketSerializer } from "./serializer"

export type PacketSerializerMap = {
    [dataKey: string]: PacketSerializer,
}

type GetPacketInput<T extends PacketSerializerMap> = {
    [K in keyof T]: T[K] extends PacketSerializer<infer R> ? R : never
}

export class Packet<T extends PacketSerializerMap>{
    id = 0
    serializers: T
    keyOrder: string[] = [] // Array<keyof T>
    messageLength = 0

    constructor(serializers: T){
        this.serializers = serializers
        
        for(const key in serializers){
            const serializer = serializers[key]
            this.keyOrder.push(key)
            this.messageLength += serializer.length
        }

        this.keyOrder = this.keyOrder.sort()
    }

    setId(id: number){
        if(id < 0 || id > 255) throw new Error("ID must be an unsigned int8.")
        this.id = id
    }

    encode<I extends GetPacketInput<T>>(inputs: I | I[]){
        const output = [this.id]

        if(!Array.isArray(inputs)) inputs = [inputs]

        for(const inp of inputs){
            for(const key of this.keyOrder){
                const value = inp[key]
                const arr = this.serializers[key].encode(value)
                output.push(...arr)
            }
        }

        return output.map(c => String.fromCharCode(c)).join("")
    }

    decode(value: string){
        const input = value.split("").map(s => s.charCodeAt(0))
        
        if(input[0] !== this.id) throw new Error("Cannot decode this message. Wrong ID.")

        input.shift()

        if(input.length % this.messageLength !== 0) throw new Error("Message missing data.")

        const messageCount = input.length / this.messageLength
        const output = []

        for(let i = 0; i < messageCount; i++){
            let indexOffset = i * this.messageLength
            const obj: Record<string, any> = {}
            for(const key of this.keyOrder){
                const serializer = this.serializers[key]
                obj[key] = serializer.decode(new Uint8Array(input.slice(indexOffset, indexOffset + serializer.length)))
                indexOffset += serializer.length
            }
            output.push(obj)
        }

        return output
    }
}