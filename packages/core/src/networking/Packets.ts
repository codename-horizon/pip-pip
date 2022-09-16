import { Packet } from "../types/client"

export class PacketManager<T extends Record<string, BasePacket>>{
    packets: T

    constructor(packets: T){
        this.packets = packets
    }

    encode<K extends keyof T, R extends ReturnType<T[K]["decode"]>>(key: K, value: R){
        return this.packets[key].encode(value)
    }
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

    decode(value: unknown){
        return value
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
        return this.code + value.toString()
    }

    decode(value: string){
        return Number(value.substring(1))
    }
}

export class BooleanPacket extends BasePacket implements Packet<boolean>{
    constructor(code: string){
        super(code)
    }

    encode(value: boolean){
        return this.code + (value === true ? "1" : "0")
    }

    decode(value: string){
        return value.substring(1) === "1"
    }
}