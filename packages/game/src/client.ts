import { ConnectionOptions } from "@pip-pip/core"
import { ConnectionManager } from "@pip-pip/core/src/networking/ConnectionManager"

export class PipPipConnectionManager extends ConnectionManager{
    constructor(options: Partial<ConnectionOptions> = {}){
        super(options)
    }
}