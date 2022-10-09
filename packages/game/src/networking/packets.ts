import { $bool, $float16, $float64, $string, $uint16, $uint32, $uint8, $varstring } from "@pip-pip/core/src/networking/packets/serializer"
import { PacketManager } from "@pip-pip/core/src/networking/packets/manager"
import { Packet } from "@pip-pip/core/src/networking/packets/packet"

import { Bullet } from "../logic/bullet"
import { PipPlayer } from "../logic/player"
import { PipPipGame } from "../logic"

export const CONNECTION_ID_LENGTH = 2
export const LOBBY_ID_LENGTH = 4

export const packetManager = new PacketManager({
    uploadChat: new Packet({
        message: $varstring,
    }),
    downloadMessage: new Packet({
        order: $uint16,
        playerId: $string(CONNECTION_ID_LENGTH),
        message: $varstring,
    }),
    addPlayer: new Packet({
        playerId: $string(CONNECTION_ID_LENGTH),
    }),
    removePlayer: new Packet({
        playerId: $string(CONNECTION_ID_LENGTH),
    }),
    setHost: new Packet({
        playerId: $string(CONNECTION_ID_LENGTH),
    }),
    playerName: new Packet({
        playerId: $string(CONNECTION_ID_LENGTH),
        name: $varstring,
    }),
    playerIdle: new Packet({
        playerId: $string(CONNECTION_ID_LENGTH),
        idle: $bool
    }),
})

export const encode = {
    addPlayer: (player: PipPlayer) => packetManager.serializers.addPlayer.encode({
        playerId: player.id,
    }),
    removePlayer: (player: PipPlayer) => packetManager.serializers.removePlayer.encode({
        playerId: player.id,
    }),
    setHost: (player: PipPlayer) => packetManager.serializers.setHost.encode({
        playerId: player.id,
    }),
    playerName: (player: PipPlayer) => packetManager.serializers.playerName.encode({
        playerId: player.id,
        name: player.name,
    }),
    playerIdle: (player: PipPlayer) => packetManager.serializers.playerIdle.encode({
        playerId: player.id,
        idle: player.idle,
    }),
    
}