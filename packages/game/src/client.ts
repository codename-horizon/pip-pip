import { ConnectionManager } from "@pip-pip/core/src/networking/ConnectionManager"
import { ConnectionOptions } from "@pip-pip/core/src/types/client"
import { PipPipPackets, pipPipPackets } from "./packets"

export class PipPipConnectionManager 
    extends ConnectionManager<PipPipPackets>{
    constructor(options: Partial<ConnectionOptions> = {}){
        super(options)
        this.setPacketDefinitions(pipPipPackets)
    }

    testParrot(text: string){
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("Parrot took longer than 1000ms"))
            }, 1000)

            this.sendPacket([
                this.packetManager.encode("parrot", text)
            ])

            this.packetEvents.once("parrot", ({ value }) => {
                clearTimeout(timeout)
                resolve(`Server said: ${value}`)
            })
        })
    }
}