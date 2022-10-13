import { PipPipGamePhase } from "@pip-pip/game/src/logic"
import { PING_REFRESH } from "@pip-pip/game/src/logic/constants"
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
        messages.push(encode.playerSetShip(player))
        messages.push(encode.playerPositionSync(player))
        messages.push(encode.playerPosition(player))
        messages.push(encode.playerPing(player))
    }
    
    if(typeof game.host !== "undefined"){
        messages.push(encode.setHost(game.host))
    }

    messages.push(encode.gamePhase(game))
    messages.push(encode.gameCountdown(game))
    messages.push(encode.gameState(game))
    messages.push(encode.gameMap(game))

    return messages
}

export function getPartialGameState(context: ConnectionContext): number[][] {
    const { game, gameEvents, connection } = context

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

    // Send remove set ship
    for(const event of gameEvents.filter("playerSetShip")){
        const { player } = event.playerSetShip
        messages.push(encode.playerSetShip(player))
    }

    // Send host
    if(gameEvents.filter("setHost").length > 0 && typeof game.host !== "undefined"){
        messages.push(encode.setHost(game.host))
    }

    // Send phase change
    if(gameEvents.filter("phaseChange").length > 0){
        messages.push(encode.gamePhase(game))
    }
    
    // Send game settings
    if(gameEvents.filter("settingsChange").length > 0){
        messages.push(encode.gameState(game))
    }

    // Send game map
    if(gameEvents.filter("setMap").length > 0){
        messages.push(encode.gameMap(game))
    }

    
    if(game.phase !== PipPipGamePhase.SETUP){
        const connectionPlayer = game.players[connection.id]
        if(game.phase === PipPipGamePhase.COUNTDOWN){
            // Send game countdown 4 times a second
            if(game.tickNumber % 4 === 0){
                messages.push(encode.gameCountdown(game))
            }
            // Force place player position
            if(typeof connectionPlayer !== "undefined"){
                messages.push(encode.playerPositionSync(connectionPlayer))
            }
        }
        
        // Send player locations
        for(const playerId in game.players){
            const player = game.players[playerId]
            messages.push(encode.playerPosition(player))
            if(connection.id !== player.id){
                messages.push(encode.playerInputs(player))
            } 
        }
    }

    // send player ping
    if(game.tickNumber % (game.tps - PING_REFRESH) === 0){
        for(const playerId in game.players){
            const player = game.players[playerId]
            messages.push(encode.playerPing(player))
        }
    }

    return messages
}