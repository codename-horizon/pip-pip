import { ExtractSerializerMap } from "@pip-pip/core/src/networking/packets/manager"
import { Lobby, LobbyTypeOptions } from "@pip-pip/core/src/networking/lobby"
import { EventCollector } from "@pip-pip/core/src/common/events"
import { Server } from "@pip-pip/core/src/networking/server"
import { Ticker } from "@pip-pip/core/src/common/ticker"
import { generateId } from "@pip-pip/core/src/lib/utils"

import { CONNECTION_ID_LENGTH, encode, LOBBY_ID_LENGTH, packetManager } from "@pip-pip/game/src/networking/packets"
import { PipPlayer } from "@pip-pip/game/src/logic/player"
import { PipPipGame } from "@pip-pip/game/src/logic"
import { BaseShip } from "@pip-pip/game/src/logic/ship"
import { Connection } from "@pip-pip/core/src/networking/connection"

type GamePacketManagerSerializerMap = ExtractSerializerMap<typeof packetManager>

type GameConnectionLocals = {
    name: string,
}

type GameLobbyLocals = {
    players: string[],
}

const server = new Server<GamePacketManagerSerializerMap, GameConnectionLocals, GameLobbyLocals>(packetManager, {
    connectionIdleLifespan: 1000 * 60 * 10, // 10 minutes
    lobbyIdleLifespan: 1000 * 3, // 3 seconds
    verifyTimeLimit: 5000,
    connectionIdLength: CONNECTION_ID_LENGTH,
    lobbyIdLength: LOBBY_ID_LENGTH,
})

const defaultLobbyOptions: LobbyTypeOptions = {
    maxConnections: 16,
    maxInstances: 128,
    userCreatable: true,
}

// server.events.on("createConnection", ({ connection }) => {
//     connection.events.on("statusChange", ({ status }) => {
//         console.log(connection.id, status)
//     })
// })

server.registerLobby("default", defaultLobbyOptions, ({lobby, server}) => {
    const game = new PipPipGame({
        shootAiBullets: true,
        calculateAi: true,
    })

    // create fake players
    for(let i = 0; i < 16; i++){
        const player = new PipPlayer(generateId())
        player.ship = new BaseShip()
        player.ai = true
        player.physics.position.x = Math.random() * 500
        player.physics.position.y = Math.random() * 500
        game.addPlayer(player)
    }

    const lobbyEvents = new EventCollector(lobby.events)
    const gameEvents = new EventCollector(game.events)

    const updateTick = new Ticker(game.tps, false, "Game")
    const debugTick = new Ticker(1, false, "Debug")

    const sendPingInterval = Math.floor(game.tps / 4)

    const updatePlayerPing = (id: string) => {
        if(id in lobby.connections && id in game.players){
            if(game.players[id].ai === true){
                game.players[id].ping = 0
            } else{
                lobby.connections[id].getPing().then(ping => {
                    if(id in game.players){
                        game.players[id].ping = ping
                    }
                })
            }
        }
    }

    updateTick.on("tick", ({ deltaMs, deltaTime }) => {
        if(game.tickNumber % sendPingInterval === 0){
            const players = Object.values(game.players)
            for(const player of players){
                updatePlayerPing(player.id)
            }
        }
        for(const event of lobbyEvents.filter("addConnection")){
            const { connection } = event.addConnection
            const player = new PipPlayer(connection.id)
            player.ship = new BaseShip()
            player.physics.position.x = Math.random() * 100
            player.physics.position.y = Math.random() * 100
            updatePlayerPing(player.id)
            game.addPlayer(player)
            game.triggerPlayerReload(player)
        }
        for(const event of lobbyEvents.filter("removeConnection")){
            const { connection } = event.removeConnection
            const player = game.players[connection.id]
            if(typeof player !== "undefined"){
                game.removePlayer(player)
            }
        }
        for(const event of lobbyEvents.filter("packetMessage")){
            const { packets, connection } = event.packetMessage
            for(const p of packets.playerInput || []){
                const player = game.players[connection.id]
                if(typeof player !== "undefined"){
                    player.physics.position.x = p.x
                    player.physics.position.y = p.y
                    player.physics.velocity.x = p.vx
                    player.physics.velocity.y = p.vy
                    player.acceleration.angle = p.accelerationAngle
                    player.acceleration.magnitude = p.accelerationMagnitude
                    player.targetRotation = p.targetRotation
                    player.inputShooting = p.shooting
                    player.inputReloading = p.reloading
                }
            }
        }

        game.update()

        const commonMessages: number[][] = [
            encode.tick(game),
        ]

        for(const event of gameEvents.filter("addPlayer")){
            const { player } = event.addPlayer
            commonMessages.push(encode.newPlayer(player))
        }

        for(const event of gameEvents.filter("removePlayer")){
            const { player } = event.removePlayer
            commonMessages.push(packetManager.serializers.removePlayer.encode({
                id: player.id,
            }))
        }

        const connections = Object.values(lobby.connections)
        const players = Object.values(game.players)

        for(const connection of connections){
            let code: number[] = []
            const connectionMessages = [
                ...commonMessages
            ]

            const updatePlayerReload = (player: PipPlayer) => {
                if(player.id === connection.id){
                    connectionMessages.push(encode.playerGun(player))
                }
            }

            // if the player is new, send every other player
            for(const event of gameEvents.filter("addPlayer")){
                const newPlayer = event.addPlayer.player
                if(newPlayer.id === connection.id){
                    // if player is new
                    connectionMessages.push(encode.syncTick(game))
                    updatePlayerReload(newPlayer)
                    for(const player of players){
                        if(newPlayer.id === player.id) continue
                        connectionMessages.push(encode.newPlayer(player))
                    }
                }
            }

            // log player motion
            for(const player of players){
                connectionMessages.push(encode.movePlayer(player))
                if(game.tickNumber % sendPingInterval === 0){
                    connectionMessages.push(encode.playerPing(player))
                }
            }
            
            // update player gun
            for(const event of gameEvents.filter("playerReloadStart")){
                const { player } = event.playerReloadStart
                updatePlayerReload(player)
            }
            for(const event of gameEvents.filter("playerReloadEnd")){
                const { player } = event.playerReloadEnd
                updatePlayerReload(player)
            }

            // log bullets
            for(const event of gameEvents.filter("addBullet")){
                const { bullet } = event.addBullet
                if(bullet.owner?.id === connection.id) continue
                connectionMessages.push(encode.shootBullet(bullet))
            }

            for(const message of connectionMessages){
                code = code.concat(message)
            }

            if(code.length === 0) continue

            const buffer = new Uint8Array(code).buffer
            connection.send(buffer)
        }

        gameEvents.flush()
        lobbyEvents.flush()
    })

    debugTick.on("tick", () => {
        console.log(
            updateTick.getPerformance().averageExecutionTime.toFixed(2) + "ms", 
            Object.values(game.players).map(player => `${player.id}:${player.ping}ms`).join(" "))
    })

    // debugTick.startTick()
    updateTick.startTick()

    lobby.events.on("destroy", () => {
        debugTick.stopTick()
        updateTick.stopTick()
    })
})

async function run(){
    await server.start()

    const artLines = [
        "---------------- WELCOME TO ----------------",
        "██████╗░██╗██████╗░░░░░░░██████╗░██╗██████╗░",
        "██╔══██╗██║██╔══██╗░░░░░░██╔══██╗██║██╔══██╗",
        "██████╔╝██║██████╔╝█████╗██████╔╝██║██████╔╝",
        "██╔═══╝░██║██╔═══╝░╚════╝██╔═══╝░██║██╔═══╝░",
        "██║░░░░░██║██║░░░░░░░░░░░██║░░░░░██║██║░░░░░",
        "╚═╝░░░░░╚═╝╚═╝░░░░░░░░░░░╚═╝░░░░░╚═╝╚═╝░░░░░",
        `---------- http://localhost:${server.options.port} -----------`,
    ]

    console.log(artLines.join("\n"))

    let logTimeout: NodeJS.Timeout
    const conLobWatch = new EventCollector(server.events, [
        "addConnection", 
        "createConnection", 
        "createLobby", 
        "removeConnection", 
        "removeLobby", 
        "connectionStatusChange",
        "lobbyStatusChange",
    ])
    conLobWatch.on("collect", ({ event }) => {
        clearTimeout(logTimeout)
        logTimeout = setTimeout(() => {
            const map = (a: Lobby<any, any, any> | Connection<any, any, any>) => {
                return [a.id, a.status].join(":")
            }
            console.log({
                connections: Object.values(server.connections).map(map),
                lobbies: Object.values(server.lobbies).map(map),
            })
            conLobWatch.flush()
        }, 100)
    })
}

run()
