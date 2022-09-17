/* REMINDER: BROWSER-SAFE */
import { Flatten, LiteralPacketType, Packet, PacketDecoded, PacketDefinitions } from "../types/client"

export class PacketManager<T extends PacketDefinitions = PacketDefinitions>{
    packets: T
    packetsByCode: Record<BasePacket["code"], { id: string, packet: BasePacket }> = {}
    delimiter = "\n"

    constructor(packets: T){
        this.packets = packets

        for(const id in this.packets){
            const packet = this.packets[id]
            this.packetsByCode[packet.code] = { id, packet }

            // Check for duplicate
            for(const id2 in this.packets){
                const packet2 = this.packets[id2]
                if(id !== id2){
                    if(packet.code === packet2.code){
                        throw Error(`Packet code "${packet.code}" is used by both "${id}" and "${id2}"`)
                    }
                }
            }
        }
    }

    code(key: keyof T){
        return this.packets[key].code
    }

    encode<K extends keyof T, R extends ReturnType<T[K]["decode"]>>(key: K, value: R){
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

export function encodeLiteral(value: LiteralPacketType): string {
    if(typeof value === "string") return value
    if(typeof value === "number") return value.toString()
    if(typeof value === "boolean") return value ? "1" : "0"
    return ""
}

export function decodeLiteral(value: string): LiteralPacketType {
    const number = Number(value)
    if(isNaN(number)) return value
    return number
}

export class BasePacket implements Packet{
    code: string
    constructor(code: string){
        if(code.length !== 1) throw new Error("code must be one character in length")
        this.code = code
    }

    encode(value: unknown){
        return value as string
    }

    decode(value: string){
        return value as unknown
    }
}

export class StringPacket extends BasePacket implements Packet<string>{
    constructor(code: string){
        super(code)
    }

    encode(value: string){
        return this.code + value
    }

    decode(value: string){
        return value.substring(1)
    }
}

export class NumberPacket extends BasePacket implements Packet<number>{
    constructor(code: string){
        super(code)
    }

    encode(value: number){
        return this.code + encodeLiteral(value)
    }

    decode(value: string){
        return decodeLiteral(value.substring(1)) as number
    }
}

export class BooleanPacket extends BasePacket implements Packet<boolean>{
    constructor(code: string){
        super(code)
    }

    encode(value: boolean){
        return this.code + encodeLiteral(value)
    }

    decode(value: string){
        return !!decodeLiteral(value.substring(1)) as boolean
    }
}

export class LiteralArrayPacket extends BasePacket implements Packet<LiteralPacketType[]>{
    constructor(code: string){
        super(code)
    }

    encode(value: LiteralPacketType[]){
        return this.code + value.map(v => encodeLiteral(v)).join(",")
    }

    decode(value: string){
        return value.substring(1).split(",").map(v => decodeLiteral(v))
    }
}

export const defaultServerClientPackets = {
    "connection-status": new NumberPacket("-"),
}

export const defaultServerPackets = {
    ...defaultServerClientPackets,
}

export const defaultClientPackets = {
    ...defaultServerClientPackets,
}

// export interface PacketMap {
//     [key: string]: BasePacket
// }

export type PacketMap = {
    [key: string]: BasePacket,
}


export type PVM<T extends PacketMap> = {
    [K in keyof T]: ReturnType<T[K]["decode"]>
}

export type LibPacketMap = {
    "connection-status": NumberPacket,
    "test": StringPacket,
}
export type LibPacketValueMap = PVM<LibPacketMap>
export const libPackets: LibPacketMap = {
    "connection-status": new NumberPacket("c"),
    "test": new StringPacket("C"),
}

export type PacketValueMapFrom<T extends PacketMap> = {
    [K in keyof T]: ReturnType<T[K]["decode"]>
}


export type PacketValueMap = Record<string, any>


export class Test<
    InstanceMap extends PacketMap, 
    InstanceValueMap extends PacketValueMap,
>{
    map: LibPacketMap & InstanceMap

    constructor(map: InstanceMap){
        this.map = {
            ...libPackets,
            ...map,
        }
        this.call("connection-status", 0)
        this.call("test", "nice")
    }

    call<K extends keyof Flatten<LibPacketValueMap & InstanceValueMap>, B extends Flatten<LibPacketValueMap & InstanceValueMap>[K]>(a: K, b: B){
        console.log(a, b)
    }
}

type TestPacketMap = {
    "testable": StringPacket,
}
type TestPacketValueMap = PVM<TestPacketMap>

const testPackets: TestPacketMap = {
    "testable": new StringPacket("l"),
}

export class Testable extends Test<TestPacketMap, TestPacketValueMap>{
    constructor(){
        super(testPackets)

        this.call("test", "nice")
    }
}