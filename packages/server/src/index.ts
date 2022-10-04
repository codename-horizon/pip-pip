import { $uint8, ExtractSerializerMap, Packet, PacketManager, Server } from "@pip-pip/core"
import { $varstring, Client, EventCollector, EventEmitter, generateId, Ticker } from "@pip-pip/core/src/common"
import { Connection } from "@pip-pip/core/src/networking/connection"
import { LobbyTypeOptions } from "@pip-pip/core/src/networking/lobby"
import { PipPipGame, Player, Ship } from "@pip-pip/game"
import { encodeBullet, encodeMovePlayer, encodeNewPlayer, encodePlayerGun, encodePlayerPing, packetManager } from "@pip-pip/game/src/networking/packets"

type GamePacketManagerSerializerMap = ExtractSerializerMap<typeof packetManager>

type GameConnectionLocals = {
    name: string,
}

type GameLobbyLocals = {
    players: string[],
}

const server = new Server<GamePacketManagerSerializerMap, GameConnectionLocals, GameLobbyLocals>(packetManager, {
    connectionIdleLifespan: 8000,
    lobbyIdleLifespan: 8000,
    verifyTimeLimit: 5000,
})

const defaultLobbyOptions: LobbyTypeOptions = {
    maxConnections: 32,
    maxInstances: 32,
    userCreatable: true,
}

// server.events.on("createConnection", ({ connection }) => {
//     connection.events.on("statusChange", ({ status }) => {
//         console.log(connection.id, status)
//     })
// })

server.registerLobby("default", defaultLobbyOptions, ({lobby, server}) => {
    const game = new PipPipGame()

    // create fake players
    for(let i = 0; i < 16; i++){
        const player = new Player(generateId())
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
        if(id in lobby.connections){
            lobby.connections[id].getPing().then(ping => {
                if(id in game.players){
                    game.players[id].ping = ping
                }
            })
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
            const player = new Player(connection.id)
            player.ship = new Ship()
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
            packetManager.serializers.tick.encode({ number: game.tickNumber }),
        ]

        for(const event of gameEvents.filter("addPlayer")){
            const { player } = event.addPlayer
            commonMessages.push(encodeNewPlayer(player))
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

            const updatePlayerReload = (player: Player) => {
                if(player.id === connection.id){
                    connectionMessages.push(encodePlayerGun(player))
                }
            }

            // if the player is new, send every other player
            for(const event of gameEvents.filter("addPlayer")){
                const newPlayer = event.addPlayer.player
                if(newPlayer.id === connection.id){
                    // if player is new
                    connectionMessages.push(packetManager.serializers.syncTick.encode({ number: game.tickNumber }))
                    updatePlayerReload(newPlayer)
                    for(const player of players){
                        if(newPlayer.id === player.id) continue
                        connectionMessages.push(encodeNewPlayer(player))
                    }
                }
            }

            // log player motion
            for(const player of players){
                connectionMessages.push(encodeMovePlayer(player))
                if(game.tickNumber % sendPingInterval === 0){
                    connectionMessages.push(encodePlayerPing(player))
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
                connectionMessages.push(encodeBullet(bullet))
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

    const conLobWatch = new EventCollector(server.events, ["addConnection", "createConnection", "createLobby", "removeConnection", "removeLobby"])
    conLobWatch.on("collect", ({ event }) => {
        console.log({
            connections: Object.keys(server.connections),
            lobbies: Object.keys(server.lobbies),
        })
        conLobWatch.flush()
    })
}

run()
