type PacketSerializer<T = any> = {
    readonly length: number,
    encode: (value: T) => Uint8Array,
    decode: (value: Uint8Array) => T,
}

type NumberArrayConstructor = Uint8ArrayConstructor | Uint16ArrayConstructor | Uint32ArrayConstructor | Float32ArrayConstructor | Float64ArrayConstructor

const numberTypes = {
    uint8: [1, Uint8Array],
    uint16: [2, Uint16Array],
    uint32: [4, Uint32Array],
    float32: [4, Float32Array],
    float64: [8, Float64Array],
}

function numPacket(type: keyof typeof numberTypes): PacketSerializer<number>{
    const [length, NumberArray] = numberTypes[type] as [number, NumberArrayConstructor]
    return {
        length,
        encode(value){
            return new Uint8Array(new NumberArray([value]).buffer)
        },
        decode(value){
            const output = new NumberArray(1)
            const int = new Uint8Array(output.buffer)
            for(let i = 0; i < value.length; i++){
                int[i] = value[i]
            }
            return output[0]
        },
    }
}

const uint8 = numPacket("uint8")
const uint16 = numPacket("uint16")
const uint32 = numPacket("uint32")
const float32 = numPacket("float32")
const float64 = numPacket("float64")

type PacketInputMap = Record<string, unknown>
type PacketSerializerMap = Record<string, PacketSerializer>

type GetPacketInput<T extends PacketSerializerMap> = {
    [K in keyof T]: T[K] extends PacketSerializer<infer R> ? R : never
}
class Packet<T extends PacketSerializerMap>{
    id: number
    serializers: T
    keyOrder: string[] = []// Bugs out if Array<keyof T>
    messageLength = 0

    constructor(id: number, serializers: T){
        if(id < 0 || id > 255) throw new Error("ID must be an unsigned int8.")
        this.id = id
        this.serializers = serializers
        
        for(const key in serializers){
            const serializer = serializers[key]
            this.keyOrder.push(key)
            this.messageLength += serializer.length
        }

        this.keyOrder = this.keyOrder.sort()
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

type PacketManagerInputMap = Record<string, PacketInputMap>

type PacketManagerInputSerializerMap<T extends PacketManagerInputMap> = {
    [K in keyof T]: Packet<{
        [P in keyof T[K]]: PacketSerializer<T[K][P]>
    }>
}
type PacketManagerSerialierMap = Record<string, Packet<PacketSerializerMap>>

const packets = {
    "tick": new Packet(255, {
        n: uint32,
    }),
    "playerPositions": new Packet(0, {
        x: float32,
        y: float32,
        a: float64,
        b: float32,
        s: uint16,
        r: uint8,
    }),
}

type GetPacketInputs<T extends PacketManagerSerialierMap> = {
    [K in keyof T]: T[K] extends Packet<infer R> ? {
        [I in keyof R]: R[I] extends PacketSerializer<infer J> ? J : never
    } : never
}

type T = GetPacketInputs<typeof packets>

class PacketManager<T extends PacketManagerSerialierMap>{
    packets: T
    constructor(packets: T){
        this.packets = packets
    }

    encode<
        K extends keyof T,
        O extends GetPacketInputs<T>,
        P extends O[K]
    >(id: K, inputs: P | P[]){
        return this.packets[id].encode(inputs)
    }
}

const pm = new PacketManager(packets)

const example = Array(2).fill({
    x: Math.PI,
    y: Math.PI / 2,
    a: -Math.PI * 200,
    b: -20,
    s: 51,
    r: 6,
})

const a = pm.encode("playerPositions", example)
const code = packets.playerPositions.encode(example)
const decode = packets.playerPositions.decode(code)
console.log(packets.playerPositions.messageLength, a, code, decode)

const n = pm.encode("tick", {
    n: 1005,
})

console.log(n)