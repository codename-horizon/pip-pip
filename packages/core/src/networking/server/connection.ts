import { Server } from "."
import { PacketManagerSerializerMap } from "../packets/manager"
import { Lobby } from "./lobby"

export class Connection<T extends PacketManagerSerializerMap>{
    server: Server<T>
    lobby?: Lobby<T>

    constructor(server: Server<T>){
        this.server = server
    }
}