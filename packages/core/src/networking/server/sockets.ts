import { PacketManagerSerializerMap } from "../packets/manager"
import { Server } from "."

export function initializeSockets<
    T extends PacketManagerSerializerMap,
    R extends Record<string, any> = Record<string, any>,
    P extends Record<string, any> = Record<string, any>,
>(server: Server<T, R, P>){
    server
}