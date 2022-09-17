import { BasePacket } from "../networking/Packets"

export function generateId(length = 16){
    const pool = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMOPQRSTUVWXYZ"
    return Array(length).fill(null).map(() => pool[Math.floor(Math.random()*pool.length)]).join("")
}

export function getKeyDuplicates(...args: Record<string, unknown>[]){
    const keys = args.map(obj => Object.keys(obj))
    const keysUnion = keys.reduce((agg, item) => [...agg, ...item], [])
    const keysSet: string[] = []
    const duplicates: string[] = []

    for(const key of keysUnion){
        if(duplicates.includes(key)){
            continue
        }
        if(keysSet.includes(key)){
            duplicates.push(key)
            continue
        }
        keysSet.push(key)
    }

    return {
        union: keysUnion,
        set: keysSet,
        duplicates: duplicates,
        hasDuplicates: duplicates.length > 0,
    }
}

export function testPacketKeyDuplicates(...args: Record<string, BasePacket>[]){
    const dupes = getKeyDuplicates(...args)
    if(dupes.hasDuplicates){
        throw Error(`Packet ID "${dupes.duplicates.join(",")}" defined in already in use. Packet ID must be reserved by the engine.`)
    }
}