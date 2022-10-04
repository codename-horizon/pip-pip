import { $float32, $float64, $uint16, $uint32, $uint8, $varstring, Packet, PacketManager } from "@pip-pip/core/src/common"
import { Player } from "../logic/test"

export const packetManager = new PacketManager({
    tick: new Packet({
        number: $uint32,
    }),
    syncTick: new Packet({
        number: $uint32,
    }),
    uploadChat: new Packet({
        message: $varstring,
    }),
    downloadMessage: new Packet({
        order: $uint16,
        playerId: $varstring,
        message: $varstring,
    }),
    newPlayer: new Packet({
        id: $varstring,
        x: $float32,
        y: $float32,
    }),
    movePlayer: new Packet({
        id: $varstring,
        
        x: $float32,
        y: $float32,
        
        vx: $float32,
        vy: $float32,

        am: $float32,
        aa: $float32,
        tr: $float32,
    }),
    playerPing: new Packet({
        id: $varstring,
        ping: $uint16,
    }),
    removePlayer: new Packet({
        id: $varstring,
    }),
})

export const encodeNewPlayer = (player: Player) => packetManager.serializers.newPlayer.encode({
    id: player.id,
    x: player.physics.position.x,
    y: player.physics.position.y,
})

export const encodeMovePlayer = (player: Player) => packetManager.serializers.movePlayer.encode({
    id: player.id,
    x: player.physics.position.x,
    y: player.physics.position.y,
    vx: player.physics.velocity.x,
    vy: player.physics.velocity.y,
    am: player.acceleration.magnitude,
    aa: player.acceleration.angle,
    tr: player.targetRotation,
})

export const encodePlayerPing = (player: Player) => packetManager.serializers.playerPing.encode({
    id: player.id,
    ping: player.ping,
})