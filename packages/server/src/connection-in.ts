import { PipPipGamePhase } from "@pip-pip/game/src/logic"
import { PipPlayer } from "@pip-pip/game/src/logic/player"
import { GameTickContext } from "."

export function processLobbyPackets(context: GameTickContext){
    const { game, lobbyEvents } = context
    // Add players
    for(const events of lobbyEvents.filter("addConnection")){
        const { connection } = events.addConnection
        const player = game.createPlayer(connection.id)

        player.ship.physics.position.x = Math.random() * 100
        player.ship.physics.position.y = Math.random() * 100
    }
    // Remove players
    for(const events of lobbyEvents.filter("removeConnection")){
        const { connection } = events.removeConnection
        const player = game.players[connection.id]
        if(typeof player !== undefined){
            player.remove()
        }
    }
    // Update player status
    for(const events of lobbyEvents.filter("connectionStatusChange")){
        const { connection } = events.connectionStatusChange
        game.players[connection.id]?.setIdle(connection.isIdle)
    }

    // Process packets
    for(const events of lobbyEvents.filter("packetMessage")){
        const { packets, connection } = events.packetMessage

        //  Set game phase if host
        for(const { phase } of packets.gamePhase || []){
            if(game.host?.id === connection.id){
                if(phase === PipPipGamePhase.COUNTDOWN){
                    game.countdown = 20 * 5
                    game.setPhase(phase)
                } else{
                    game.setPhase(phase)
                }
            }
        }

        //  Set player position
        for(const pos of packets.playerPosition || []){
            const player = game.players[connection.id]
            if(typeof player !== "undefined"){
                player.ship.physics.position.x = pos.positionX
                player.ship.physics.position.y = pos.positionY
                player.ship.physics.velocity.x = pos.velocityX
                player.ship.physics.velocity.y = pos.velocityY
            }
        }

        // set player inputs
        for(const inputs of packets.playerInputs || []){
            const player = game.players[connection.id]
            if(typeof player !== "undefined"){
                player.inputs.movementAngle = inputs.movementAngle
                player.inputs.movementAmount = inputs.movementAmount
                player.inputs.aimAngle = inputs.aimAngle
                player.inputs.useWeapon = inputs.useWeapon
                player.inputs.useTactical = inputs.useTactical
                player.inputs.doReload = inputs.doReload
            }
        }
    }
}