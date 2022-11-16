import { zlib, unzlib } from "fflate"

// eslint-disable-next-line prefer-const
let USE_COMPRESSION = false

export const compress = (arr: number[] | Uint8Array | ArrayBuffer) => new Promise<Uint8Array>(resolve => {
    const input = new Uint8Array(arr)
    if(USE_COMPRESSION === false){
        resolve(input)
        return
    }
    zlib(input, { level: 4, mem: 4 }, (err, data) => {
        if(err){
            resolve(input)
            return
        }
        if(data.length > input.length){
            resolve(input)
            return
        }
        resolve(data)
    })
})

export const decompress = (arr: number[] | Uint8Array | ArrayBuffer) => new Promise<Uint8Array>(resolve => {
    const input = new Uint8Array(arr)
    if(USE_COMPRESSION === false){
        resolve(input)
        return
    }
    unzlib(input, (err, data) => {
        if(err){
            resolve(input)
            return
        }
        resolve(data)
    })
})