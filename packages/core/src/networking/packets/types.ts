export interface Packet<T = any>{
    code: string,
    encode: (value: T) => string,
    decode: (value: string) => T,
}

export type PacketType<T extends Packet> = ReturnType<T["decode"]>

export type PacketDecoded<T = unknown> = {
    id: string, code: string, value: T,
}

export interface PacketMap {
    [key: string]: Packet,
}

export interface PacketCollection{
    [key: string]: Packet
}

export type LiteralPacketType = string | number | boolean

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

    encode(value: any){
        return value as string
    }

    decode(value: string){
        return value as any
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

export class Array1DPacket<T extends LiteralPacketType[]> extends BasePacket implements Packet<T>{
    delimiter = "~"

    constructor(code: string){
        super(code)
    }
    
    encode(value: T): string {
        return this.code + value.map(part => encodeLiteral(part)).join(this.delimiter)
    }

    decode(value: string){
        return value.substring(1).split(this.delimiter).map(part => decodeLiteral(part)) as T
    }
}

export class Array2DPacket<T extends LiteralPacketType[][]> extends BasePacket implements Packet<T>{
    bigDelimiter = "|"
    smallDelimiter = "~"

    constructor(code: string){
        super(code)
    }
    
    encode(value: T): string {
        return this.code + value.map(inner => inner.map(part => encodeLiteral(part)).join(this.smallDelimiter)).join(this.bigDelimiter)
    }

    decode(value: string){
        return value.substring(1).split(this.bigDelimiter).map(inner => inner.split(this.smallDelimiter).map(part => decodeLiteral(part))) as T
    }
}