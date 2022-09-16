import { PacketDecoder, PacketEncoder } from "../types/client"

export const genericPacketEncoder = (value: unknown) => {
    const genericValue = value as unknown & { 
        toString?: () => string,
        getSerialized?: () => string,
    }

    if(typeof genericValue.toString === "function"){
        return genericValue.toString()
    }

    if(typeof genericValue.getSerialized === "function"){
        return genericValue.getSerialized()
    }
    
    if(typeof value === "object"){
        return JSON.stringify(value)
    }

    return value as string
}

export const generic

export class Packet<T>{
    eventCode: string
    encoder: PacketEncoder<T>
    decoder: PacketDecoder<T>

    constructor(eventCode: string, encoder?: (value: T) => string, decoder?: (value: string) => T){
        if(eventCode.length !== 1) throw new Error("eventCode must be one character")
        this.eventCode = eventCode
        
        this.encoder = typeof encoder === "function" ? encoder : genericPacketEncoder
    }
}