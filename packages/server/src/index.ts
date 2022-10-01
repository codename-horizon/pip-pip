type PacketType<T> = {
    length: number,
    encode: (value: T) => Uint8Array,
    decode: (value: Uint8Array) => T,
}

type TypedArray = Uint8ArrayConstructor | Uint16ArrayConstructor | Uint32ArrayConstructor | Float32ArrayConstructor | Float64ArrayConstructor

const numberTypes = {
    uint8: [1, Uint8Array],
    uint16: [2, Uint16Array],
    uint32: [4, Uint32Array],
    float32: [4, Float32Array],
    float64: [8, Float64Array],
}

function createNumberPacketType(type: keyof typeof numberTypes): PacketType<number>{
    const [length, NumberArray] = numberTypes[type] as [number, TypedArray]
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

const float64 = createNumberPacketType("uint32")

const packets = {
    "playerPositions": [float64]
}

console.log(float64.encode(Math.PI))
console.log(float64.decode(float64.encode(Math.PI)))
console.log(Math.PI)