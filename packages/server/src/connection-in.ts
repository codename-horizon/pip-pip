import { PipPlayer } from "@pip-pip/game/src/logic/player"
import { GameTickContext } from "."

export function processLobbyPackets(context: GameTickContext){
    const { game, lobbyEvents } = context
    // Add players
    for(const events of lobbyEvents.filter("addConnection")){
        const { connection } = events.addConnection
        const player = new PipPlayer(game, connection.id)
        game.addPlayer(player)
    }
    // Remove players
    for(const events of lobbyEvents.filter("removeConnection")){
        const { connection } = events.removeConnection
        const player = game.players[connection.id]
        if(typeof player !== undefined){
            game.removePlayer(player)
        }
    }
    // Update player status
    for(const events of lobbyEvents.filter("connectionStatusChange")){
        const { connection } = events.connectionStatusChange
        game.players[connection.id]?.setIdle(connection.isIdle)
    }
}