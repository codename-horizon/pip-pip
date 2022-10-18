import { forgivingEqual } from "@pip-pip/core/src/math"
import { PipPipGamePhase } from "@pip-pip/game/src/logic"
import { PLAYER_POSITION_TOLERANCE } from "@pip-pip/game/src/logic/constants"
import { encode } from "@pip-pip/game/src/networking/packets"
import { GAME_CONTEXT, GameContext, getClientPlayer } from "."

export const processPackets = (gameContext: GameContext) => {
    const { game } = gameContext
    for(const events of gameContext.clientEvents.filter("packetMessage")){
        const { packets } = events.packetMessage

        // Add player
        for(const { playerId } of packets.addPlayer || []){
            game.createPlayer(playerId)
        }

        // Remove player
        for(const { playerId } of packets.removePlayer || []){
            game.players[playerId]?.remove()
        }

        // Set host
        for(const { playerId } of packets.setHost || []){
            const player = game.players[playerId]
            if(typeof player !== "undefined") game.setHost(player)
        }

        // Set player name
        for(const { playerId, name } of packets.playerName || []){
            const player = game.players[playerId]
            if(typeof player !== "undefined") player.name = name
        }

        // Set player idle
        for(const { playerId, idle } of packets.playerIdle || []){
            game.players[playerId]?.setIdle(idle)
        }

        // Set player ping
        for(const { playerId, ping } of packets.playerPing || []){
            const player = game.players[playerId]
            if(typeof player !== "undefined") player.ping = ping
        }

        // Set player ship
        for(const { playerId, shipIndex } of packets.playerSetShip || []){
            game.players[playerId]?.setShip(shipIndex)
        }

        // Set game state
        for(const settings of packets.gameState || []){
            game.setSettings(settings)
        }

        //  Set game phase
        for(const { phase } of packets.gamePhase || []){
            game.setPhase(phase)
        }

        //  Set game countdown
        for(const { countdown } of packets.gameCountdown || []){
            game.countdown = countdown
        }

        //  Set game map
        for(const { mapIndex } of packets.gameMap || []){
            game.setMap(mapIndex)
        }

        //  Set force player positions
        for(const pos of packets.playerPositionSync || []){
            const player = game.players[pos.playerId]
            if(typeof player === "undefined") continue
            
            if(pos.playerId === gameContext.client.connectionId){
                player.ship.physics.position.x = pos.positionX
                player.ship.physics.position.y = pos.positionY
                player.ship.physics.velocity.x = pos.velocityX
                player.ship.physics.velocity.y = pos.velocityY
            }
            
        }

        //  Set player positions
        for(const pos of packets.playerPosition || []){
            const player = game.players[pos.playerId]
            if(typeof player === "undefined") continue

            let xOffset = 0
            let yOffset = 0

            if(pos.playerId === gameContext.client.connectionId){
                // TODO: Improve server reconciliation
                const lookbackRaw = player.ping / game.deltaMs
                const state = player.getLastPositionState(lookbackRaw)
                const x = forgivingEqual((state.positionX + state.velocityX), (pos.positionX), PLAYER_POSITION_TOLERANCE)
                const y = forgivingEqual((state.positionY + state.velocityY), (pos.positionY), PLAYER_POSITION_TOLERANCE)
                if(x && y) continue
                console.log("Moving player back...")
                xOffset = -state.velocityX
                yOffset = -state.velocityY
            }
            
            player.ship.physics.position.x = pos.positionX + xOffset
            player.ship.physics.position.y = pos.positionY + yOffset
            player.ship.physics.velocity.x = pos.velocityX
            player.ship.physics.velocity.y = pos.velocityY
        }

        for(const inputs of packets.playerInputs || []){
            if(inputs.playerId === gameContext.client.connectionId) continue
            
            const player = game.players[inputs.playerId]
            if(typeof player === "undefined") continue
            player.inputs.movementAngle = inputs.movementAngle
            player.inputs.movementAmount = inputs.movementAmount
            player.inputs.aimRotation = inputs.aimRotation
        }

        // console.log(packets)
    }
}


export const sendPackets = (gameContext: GameContext) => {
    const { game, gameEvents } = gameContext

    const messages: number[][] = []
    const clientPlayer = getClientPlayer(game)

    if(game.phase === PipPipGamePhase.SETUP){
        if(typeof clientPlayer !== "undefined"){
            if(gameEvents.filter("playerSetShip").length > 0){
                messages.push(encode.playerSetShip(clientPlayer))
            }
        }
    }
    
    // send position
    if(game.phase === PipPipGamePhase.MATCH){

        if(typeof clientPlayer !== "undefined"){
            messages.push(encode.playerPosition(clientPlayer))
            messages.push(encode.playerInputs(clientPlayer))
        }
    }
    

    if(messages.length){
        let code: number[] = []
        messages.forEach(mes => code = code.concat(mes))
        const buffer = new Uint8Array(code).buffer
        gameContext.client.send(buffer)
    }
}

export function sendGamePhase(phase: PipPipGamePhase){
    const code = encode.gamePhase(phase)
    const buffer = new Uint8Array(code).buffer
    GAME_CONTEXT.client.send(buffer)
}