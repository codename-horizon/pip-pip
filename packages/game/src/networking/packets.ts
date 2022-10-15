import { $bool, $float16, $float64, $string, $uint16, $uint32, $uint8, $varstring } from "@pip-pip/core/src/networking/packets/serializer"
import { PacketManager, GetPacketSerializerMap, ExtractSerializerMap } from "@pip-pip/core/src/networking/packets/manager"
import { Packet } from "@pip-pip/core/src/networking/packets/packet"

import { Bullet } from "../logic/bullet"
import { PipPlayer } from "../logic/player"
import { PipPipGame, PipPipGamePhase } from "../logic"

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
    playerPing: new Packet({
        playerId: $string(CONNECTION_ID_LENGTH),
        ping: $uint16,
    }),
    playerSetShip: new Packet({
        playerId: $string(CONNECTION_ID_LENGTH),
        shipIndex: $uint8,
    }),
    playerPosition: new Packet({
        playerId: $string(CONNECTION_ID_LENGTH),
        positionX: $float16,
        positionY: $float16,
        velocityX: $float16,
        velocityY: $float16,
    }),
    playerPositionSync: new Packet({
        playerId: $string(CONNECTION_ID_LENGTH),
        positionX: $float16,
        positionY: $float16,
        velocityX: $float16,
        velocityY: $float16,
    }),
    playerInputs: new Packet({
        playerId: $string(CONNECTION_ID_LENGTH),
        movementAngle: $float16,
        movementAmount: $float16,
        aimRotation: $float16,
        useWeapon: $bool,
        useTactical: $bool,
        doReload: $bool,
    }),
    gameState: new Packet({
        mode: $uint8,
        useTeams: $bool,
        maxDeaths: $uint8,
        maxKills: $uint8,
        friendlyFire: $bool,
    }),
    gamePhase: new Packet({
        phase: $uint8,
    }),
    gameCountdown: new Packet({
        countdown: $uint8,
    }),
    gameMap: new Packet({
        mapIndex: $uint8,
    }),
})

export type PipPacketManager = typeof packetManager
export type PipPacketSerializerMap = ExtractSerializerMap<PipPacketManager>

export const encode = {
    gameState: (game: PipPipGame) => packetManager.serializers.gameState.encode({
        mode: game.settings.mode,
        useTeams: game.settings.useTeams,
        maxDeaths: game.settings.maxDeaths,
        maxKills: game.settings.maxKills,
        friendlyFire: game.settings.friendlyFire,
    }),
    gamePhase: (gameOrPhase: PipPipGame | PipPipGamePhase) => packetManager.serializers.gamePhase.encode({
        phase: gameOrPhase instanceof PipPipGame ? gameOrPhase.phase : gameOrPhase,
    }),
    gameCountdown: (game: PipPipGame) => packetManager.serializers.gameCountdown.encode({
        countdown: game.countdown,
    }),
    gameMap: (game: PipPipGame) => packetManager.serializers.gameMap.encode({
        mapIndex: game.mapIndex,
    }),
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
    playerPing: (player: PipPlayer) => packetManager.serializers.playerPing.encode({
        playerId: player.id,
        ping: player.ping,
    }),
    playerSetShip: (player: PipPlayer) => packetManager.serializers.playerSetShip.encode({
        playerId: player.id,
        shipIndex: player.shipIndex,
    }),
    playerPosition: (player: PipPlayer) => packetManager.serializers.playerPosition.encode({
        playerId: player.id,
        positionX: player.ship.physics.position.x,
        positionY: player.ship.physics.position.y,
        velocityX: player.ship.physics.velocity.x,
        velocityY: player.ship.physics.velocity.y,
    }),
    playerPositionSync: (player: PipPlayer) => packetManager.serializers.playerPositionSync.encode({
        playerId: player.id,
        positionX: player.ship.physics.position.x,
        positionY: player.ship.physics.position.y,
        velocityX: player.ship.physics.velocity.x,
        velocityY: player.ship.physics.velocity.y,
    }),
    playerInputs: (player: PipPlayer) => packetManager.serializers.playerInputs.encode({
        playerId: player.id,
        movementAngle: player.inputs.movementAngle,
        movementAmount: player.inputs.movementAmount,
        aimRotation: player.inputs.aimRotation,
        useWeapon: player.inputs.useWeapon,
        useTactical: player.inputs.useTactical,
        doReload: player.inputs.doReload,
    }),
    
}