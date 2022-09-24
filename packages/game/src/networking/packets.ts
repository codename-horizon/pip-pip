import { Array1DPacket, Array2DPacket, NumberPacket, StringPacket } from "@pip-pip/core/src/common"


export type PipPipPacketMap = {
    "gameTick": NumberPacket,

    "playerConnect": StringPacket,
    "playerDisconnect": StringPacket,
    "playerInfo": StringPacket,
    "playerChangeStatus": StringPacket,

    "playerPosition": Array1DPacket<[number, number, number, number, number]>,
    "playerPositions": Array2DPacket<[string, number, number, number, number, number][]>,
}

const packetCodeBank = "0123456789abcdefghijklmnopqrstuvwxyz".split("")

export const pipPipPacketMap: PipPipPacketMap = {
    "gameTick": new NumberPacket(packetCodeBank.shift() as string),

    "playerConnect": new StringPacket(packetCodeBank.shift() as string),
    "playerDisconnect": new StringPacket(packetCodeBank.shift() as string),
    "playerInfo": new StringPacket(packetCodeBank.shift() as string),
    "playerChangeStatus": new StringPacket(packetCodeBank.shift() as string),

    "playerPosition": new Array1DPacket(packetCodeBank.shift() as string),
    "playerPositions": new Array2DPacket(packetCodeBank.shift() as string),
}