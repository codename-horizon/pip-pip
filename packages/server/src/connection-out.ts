import { encode } from "@pip-pip/game/src/networking/packets"
import { ConnectionContext } from "."

export function sendPacketToConnection(context: ConnectionContext){
    const { connection, gameEvents } = context

    // check if the player is new or just reconnecting
    let sendFullGameState = false
    
    for(const event of gameEvents.filter("addPlayer")){
        const { player } = event.addPlayer
        if(connection.id === player.id){
            // player just connected
            sendFullGameState = true
        }
    }
    
    for(const event of gameEvents.filter("playerIdleChange")){
        const { player } = event.playerIdleChange
        if(connection.id === player.id && player.idle === false){
            // player just reconnected
            sendFullGameState = true
        }
    }
    
    const messages = sendFullGameState ? getFullGameState(context) : getPartialGameState(context)

    if(messages.length){
        let code: number[] = []
        messages.forEach(mes => code = code.concat(mes))
        const buffer = new Uint8Array(code).buffer
        connection.send(buffer)
    }
}

export function getFullGameState(context: ConnectionContext): number[][] {
    const { game } = context

    const messages = []

    for(const id in game.players){
        const player = game.players[id]
        messages.push(encode.addPlayer(player))
        messages.push(encode.playerName(player))
        messages.push(encode.playerIdle(player))
    }
    
    if(typeof game.host !== "undefined"){
        messages.push(encode.setHost(game.host))
    }

    return messages
}

export function getPartialGameState(context: ConnectionContext): number[][] {
    const { game, gameEvents } = context

    const messages = []
    
    // Send new players
    for(const event of gameEvents.filter("addPlayer")){
        const { player } = event.addPlayer
        messages.push(encode.addPlayer(player))
        messages.push(encode.playerName(player))
        messages.push(encode.playerIdle(player))
    }
    // Send player details
    for(const event of gameEvents.filter("playerIdleChange")){
        const { player } = event.playerIdleChange
        messages.push(encode.playerIdle(player))
    }

    // Send removed players
    for(const event of gameEvents.filter("removePlayer")){
        const { player } = event.removePlayer
        messages.push(encode.removePlayer(player))
    }

    // Send host
    if(gameEvents.filter("setHost").length > 0 && typeof game.host !== "undefined"){
        messages.push(encode.setHost(game.host))
    }

    return messages
}