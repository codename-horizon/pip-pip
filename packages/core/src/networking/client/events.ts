import { PacketManagerSerializerMap } from "../packets/manager";

export type ClientEventMap<T extends PacketManagerSerializerMap> = {
    socketReady: undefined,
    socketClose: undefined,
    socketMessage: { data: string | ArrayBuffer, verified: boolean }
}