import { PipPipGamePhase } from "@pip-pip/game/src/logic"
import { PING_REFRESH } from "@pip-pip/game/src/logic/constants"
import { PipPlayer } from "@pip-pip/game/src/logic/player"
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
        messages.push(encode.playerShipTimings(player))
        messages.push(encode.playerShipCapacities(player))
        messages.push(encode.playerTimings(player))
        messages.push(encode.playerScores(player))

        if(player.spawned){
            messages.push(encode.spawnPlayer(player))
        } else{
            messages.push(encode.despawnPlayer(player))
        }
    }

    // send all bulelts
    for(const bullet of game.bullets.getActive()){
        if(bullet.owner instanceof PipPlayer){
            messages.push(encode.playerShootBullet(bullet.owner, bullet))
        }
    }
    
    if(typeof game.host !== "undefined"){
        messages.push(encode.setHost(game.host))
    }

    messages.push(encode.gamePhase(game))
    messages.push(encode.gameCountdown(game))
    messages.push(encode.gameState(game))
    messages.push(encode.gameMap(game.mapIndex))

    return messages
}

type PlayerUpdateObject = {
    shipTimings: boolean,
    shipCapacities: boolean,
    playerTimings: boolean,
    playerScores: boolean,
}
type PlayerUpdateType = Record<string, PlayerUpdateObject>

class PlayerUpdateTracker{
    states: PlayerUpdateType = {}
    
    track<K extends keyof PlayerUpdateObject>(id: string, key: K, value: PlayerUpdateObject[K] = true){
        if(id in this.states){
            this.states[id] = {
                ...this.states[id],
                [key]: value,
            }
        } else{
            this.states[id] = {
                shipTimings: false,
                shipCapacities: false,
                playerTimings: false,
                playerScores: false,
                [key]: value,
            }
        }
    }
}

export function getPartialGameState(context: ConnectionContext): number[][] {
    const { game, gameEvents, connection, lobbyEvents } = context

    const playerUpdates = new PlayerUpdateTracker()

    const messages = []
    
    // Send new players
    for(const event of gameEvents.filter("addPlayer")){
        const { player } = event.addPlayer
        messages.push(encode.addPlayer(player))
        messages.push(encode.playerName(player))
        messages.push(encode.playerIdle(player))
        playerUpdates.track(player.id, "playerScores")
        playerUpdates.track(player.id, "playerTimings")
        playerUpdates.track(player.id, "shipCapacities")
        playerUpdates.track(player.id, "shipTimings")
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

    // player spawned
    for(const event of gameEvents.filter("playerSpawned")){
        const { player } = event.playerSpawned
        if(player.spawned === true){
            // player spawned
            messages.push(encode.spawnPlayer(player))
        } else{
            // player despawned
            messages.push(encode.despawnPlayer(player))
        }
        playerUpdates.track(player.id, "playerScores")
        playerUpdates.track(player.id, "playerTimings")
        playerUpdates.track(player.id, "shipCapacities")
        playerUpdates.track(player.id, "shipTimings")
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
        messages.push(encode.gameMap(game.mapIndex))
    }

    // Shoot bullet
    for(const event of gameEvents.filter("addBullet") || []){
        const { bullet } = event.addBullet
        if(bullet.owner instanceof PipPlayer){
            if(bullet.owner.id === connection.id) continue
            messages.push(encode.playerShootBullet(bullet.owner, bullet))
        }
    }

    // Reload
    for(const event of gameEvents.filter("playerReloadStart") || []){
        const { player } = event.playerReloadStart
        if(connection.id === player.id){
            playerUpdates.track(player.id, "playerTimings")
            playerUpdates.track(player.id, "shipCapacities")
            playerUpdates.track(player.id, "shipTimings")
        }
    }
    for(const event of gameEvents.filter("playerReloadEnd") || []){
        const { player } = event.playerReloadEnd
        if(connection.id === player.id){
            playerUpdates.track(player.id, "playerTimings")
            playerUpdates.track(player.id, "shipCapacities")
            playerUpdates.track(player.id, "shipTimings")
        }
    }

    // Deal damage
    for(const event of gameEvents.filter("dealDamage") || []){
        const { dealer, target, damage } = event.dealDamage
        if(connection.id === dealer.id){
            messages.push(encode.playerDamage(dealer, target, damage))
        }
        playerUpdates.track(dealer.id, "playerScores")
        playerUpdates.track(dealer.id, "shipCapacities")
        playerUpdates.track(target.id, "shipCapacities")
    }

    // Track kill
    for(const event of gameEvents.filter("playerKill") || []){
        const { killer, killed } = event.playerKill
        messages.push(encode.playerKill(killer, killed))
        playerUpdates.track(killer.id, "playerScores")
        playerUpdates.track(killed.id, "playerScores")
        playerUpdates.track(killer.id, "playerTimings")
        playerUpdates.track(killed.id, "playerTimings")
    }

    for(const events of lobbyEvents.filter("packetMessage")){
        const { packets, connection } = events.packetMessage

        // Broadcast chat message
        for(const { message } of packets.sendChat || []){
            const player = game.players[connection.id]
            if(typeof player !== "undefined"){
                messages.push(encode.receiveChat(player, message))
            }
        }
    }

    for(const playerId in playerUpdates.states){
        const player = game.players[playerId]
        if(typeof player === "undefined") continue
        const update = playerUpdates.states[playerId]

        if(update.playerScores === true){
            messages.push(encode.playerScores(player))
        }
        if(update.playerTimings === true){
            messages.push(encode.playerTimings(player))
        }
        if(update.shipCapacities === true){
            messages.push(encode.playerShipCapacities(player))
        }
        if(update.shipTimings === true){
            messages.push(encode.playerShipTimings(player))
        }
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