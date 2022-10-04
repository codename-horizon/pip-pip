import { PacketManagerDecoded, PacketManagerSerializerMap } from "../packets/manager";
import { ServerSerializerMap } from "../packets/server";

export type ClientEventMap<T extends PacketManagerSerializerMap> = {
    socketReady: undefined,
    socketClose: undefined,
    socketMessage: { data: string | ArrayBuffer, verified: boolean },
    packetMessage: { packets: PacketManagerDecoded<T & ServerSerializerMap> },
}