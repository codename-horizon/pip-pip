import { $bool, $float16, $float32, $float64, $string, $uint16, $uint32, $uint8, $varstring, ExtractSerializerMap, Packet, PacketManager } from "@pip-pip/core/src/common"
import { Bullet, PipPipGame, Player } from "../logic/test"

export const CONNECTION_ID_LENGTH = 2

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
        playerId: $string(CONNECTION_ID_LENGTH),
        message: $varstring,
    }),
    newPlayer: new Packet({
        id: $string(CONNECTION_ID_LENGTH),
        x: $float16,
        y: $float16,
        ai: $bool,
    }),
    movePlayer: new Packet({
        id: $string(CONNECTION_ID_LENGTH),
        x: $float16,
        y: $float16,
        vx: $float16,
        vy: $float16,
        accelerationMagnitude: $float16,
        accelerationAngle: $float16,
        targetRotation: $float16,
    }),
    playerInput: new Packet({
        x: $float64,
        y: $float64,
        vx: $float64,
        vy: $float64,
        accelerationMagnitude: $float64,
        accelerationAngle: $float64,
        targetRotation: $float64,
        shooting: $bool,
        reloading: $bool,
    }),
    playerGun: new Packet({
        ammo: $uint8,
        reloadTimeLeft: $uint16,
    }),
    shootBullet: new Packet({
        playerId: $string(CONNECTION_ID_LENGTH),
        x: $float16,
        y: $float16,
        vx: $float16,
        vy: $float16,
    }),
    playerPing: new Packet({
        id: $string(CONNECTION_ID_LENGTH),
        ping: $uint16,
    }),
    removePlayer: new Packet({
        id: $string(CONNECTION_ID_LENGTH),
    }),
})

export const encode = {
    tick: (game: PipPipGame) => packetManager.serializers.tick.encode({
        number: game.tickNumber,
    }),
    syncTick: (game: PipPipGame) => packetManager.serializers.syncTick.encode({
        number: game.tickNumber,
    }),
    newPlayer: (player: Player) => packetManager.serializers.newPlayer.encode({
        id: player.id,
        x: player.physics.position.x,
        y: player.physics.position.y,
        ai: player.ai,
    }),
    movePlayer: (player: Player) => packetManager.serializers.movePlayer.encode({
        id: player.id,
        x: player.physics.position.x,
        y: player.physics.position.y,
        vx: player.physics.velocity.x,
        vy: player.physics.velocity.y,
        accelerationMagnitude: player.acceleration.magnitude,
        accelerationAngle: player.acceleration.angle,
        targetRotation: player.targetRotation,
    }),
    playerInput: (player: Player) => packetManager.serializers.playerInput.encode({
        x: player.physics.position.x,
        y: player.physics.position.y,
        vx: player.physics.velocity.x,
        vy: player.physics.velocity.y,
        accelerationMagnitude: player.acceleration.magnitude,
        accelerationAngle: player.acceleration.angle,
        targetRotation: player.targetRotation,
        shooting: player.inputShooting,
        reloading: player.inputReloading,
    }),
    playerGun: (player: Player) => packetManager.serializers.playerGun.encode({
        ammo: player.ammo,
        reloadTimeLeft: player.reloadTimeLeft,
    }),
    shootBullet: (bullet: Bullet) => packetManager.serializers.shootBullet.encode({
        playerId: bullet.owner?.id || "",
        x: bullet.physics.position.x,
        y: bullet.physics.position.y,
        vx: bullet.physics.velocity.x,
        vy: bullet.physics.velocity.y,
    }),
    playerPing: (player: Player) => packetManager.serializers.playerPing.encode({
        id: player.id,
        ping: player.ping,
    }),
}