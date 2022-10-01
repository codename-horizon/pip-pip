type PacketSerializer<T = any> = {
    length: number,
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
class Pac<T extends PacketSerializerMap>{
    id: number
    dataTypes: T
    constructor(id: number, dataTypes: T){
        if(id < 0 || id > 255) throw new Error("ID must be an unsigned int8.")
        this.id = id
        this.dataTypes = dataTypes
    }
}

type PacketManagerInputMap = Record<string, PacketInputMap>

type GamePacketInputMap = {
    "playerPositions": {
        x: number,
        y: number,
    }
}

type PacketManagerInputSerializerMap<T extends PacketManagerInputMap> = {
    [K in keyof T]: Pac<{
        [P in keyof T[K]]: PacketSerializer<T[K][P]>
    }>
}

type GamePacketInputSerializerMap = PacketManagerInputSerializerMap<GamePacketInputMap>

const packets: GamePacketInputSerializerMap = {
    "playerPositions": new Pac(0, {
        x: uint16,
        y: uint16,
    }),
}

