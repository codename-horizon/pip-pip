import { EventCollector } from "@pip-pip/core/src/common/events"
import { Client } from "@pip-pip/core/src/networking/client"
import { PipPipGamePhase } from "@pip-pip/game/src/logic"
import { encode, packetManager } from "@pip-pip/game/src/networking/packets"
import { GameContext } from "."

export const client = new Client(packetManager, {
    host: window.location.hostname,
    port: 3000,
})

export const clientEvents = new EventCollector(client.events)

export const processPackets = (context: GameContext) => {
    const { game } = context
    for(const events of clientEvents.filter("packetMessage")){
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

        //  Set game phase
        for(const { countdown } of packets.gameCountdown || []){
            game.countdown = countdown
        }

        //  Set game phase
        for(const pos of packets.playerPosition || []){
            const player = game.players[pos.playerId]
            if(typeof player !== "undefined"){
                player.ship.physics.position.x = pos.positionX
                player.ship.physics.position.y = pos.positionY
                player.ship.physics.velocity.x = pos.velocityX
                player.ship.physics.velocity.y = pos.velocityY
            }
        }

        console.log(game)
    }
}


export const sendPackets = (context: GameContext) => {
    const { game } = context

    const messages: number[][] = []

    if(game.phase === PipPipGamePhase.SETUP){
        
        return
    }
    
    // send position
    {
        if(typeof client.connectionId !== "undefined"){
            if(client.connectionId in game.players){
                const player = game.players[client.connectionId]
                messages.push(encode.playerPosition(player))
            }
        }
    }

    if(messages.length){
        let code: number[] = []
        messages.forEach(mes => code = code.concat(mes))
        const buffer = new Uint8Array(code).buffer
        client.send(buffer)
    }
}

export function sendGamePhase(phase: PipPipGamePhase){
    const code = encode.gamePhase(phase)
    const buffer = new Uint8Array(code).buffer
    client.send(buffer)
}