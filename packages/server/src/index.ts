import { ExtractSerializerMap } from "@pip-pip/core/src/networking/packets/manager"
import { Lobby, LobbyTypeOptions } from "@pip-pip/core/src/networking/lobby"
import { EventCollector, EventMapOf } from "@pip-pip/core/src/common/events"
import { ConnectionOf, LobbyOf, Server } from "@pip-pip/core/src/networking/server"
import { Ticker } from "@pip-pip/core/src/common/ticker"
import { generateId } from "@pip-pip/core/src/lib/utils"

import { CONNECTION_ID_LENGTH, encode, LOBBY_ID_LENGTH, packetManager } from "@pip-pip/game/src/networking/packets"
import { PipPlayer } from "@pip-pip/game/src/logic/player"
import { PipPipGame } from "@pip-pip/game/src/logic"
import { Ship } from "@pip-pip/game/src/logic/ship"
import { Connection } from "@pip-pip/core/src/networking/connection"
import { sendPacketToConnection } from "./connection-out"
import { processLobbyPackets } from "./connection-in"

import { BASE_MAPS } from "@pip-pip/game/src/maps"

type GamePacketManagerSerializerMap = ExtractSerializerMap<typeof packetManager>

type GameConnectionLocals = {
    name: string,
}

type GameLobbyLocals = {
    players: string[],
}

export type PipPipServer = Server<GamePacketManagerSerializerMap, GameConnectionLocals, GameLobbyLocals>
export type PipPipConnection = ConnectionOf<PipPipServer>
export type PipPipLobby = LobbyOf<PipPipServer>

const server: PipPipServer = new Server(packetManager, {
    connectionIdleLifespan: 1000 * 5, //1000 * 60 * 10, // 10 minutes
    lobbyIdleLifespan: 1000 * 5, // 5 second
    verifyTimeLimit: 5000,
    connectionIdLength: CONNECTION_ID_LENGTH,
    lobbyIdLength: LOBBY_ID_LENGTH,
})

const defaultLobbyOptions: LobbyTypeOptions = {
    maxConnections: 16,
    maxInstances: 128,
    userCreatable: true,
}

export type GameTickContext = {
    lobby: PipPipLobby,
    game: PipPipGame, 
    lobbyEvents: EventCollector<EventMapOf<PipPipLobby["events"]>>,
    gameEvents: EventCollector<EventMapOf<PipPipGame["events"]>>,
}

export type ConnectionContext = {
    connection: PipPipConnection,
} & GameTickContext

server.registerLobby("default", defaultLobbyOptions, ({lobby, server}) => {
    const game = new PipPipGame({
        calculateAi: true,
        shootAiBullets: true,
        assignHost: true,
    })

    const lobbyEvents = new EventCollector(lobby.events)
    const gameEvents = new EventCollector(game.events)

    const debugTick = new Ticker(2, false, "Debug")
    const updateTick = new Ticker(20, false, "Game")

    const gameContext: GameTickContext = { lobby, game, lobbyEvents, gameEvents }

    const getConnectionContext = (connection: PipPipConnection): ConnectionContext => ({ connection, ...gameContext, })

    updateTick.on("tick", () => {
        // process lobby packets
        processLobbyPackets(gameContext)

        // update game

        // send messages to connections
        const readyConnections = Object.values(lobby.connections).filter(connection => connection.isReady)
        for(const connection of readyConnections){
            sendPacketToConnection(getConnectionContext(connection))
        }

        lobbyEvents.flush()
        gameEvents.flush()
    })

    debugTick.on("tick", () => {
        const players = Object.keys(game.players)
        if(players.length) console.log(players)
    })
    
    lobby.events.on("destroy", () => {
        debugTick.destroy()
        updateTick.destroy()
        lobbyEvents.destroy()
        gameEvents.destroy()
        game.destroy()
    })

    debugTick.startTick()
    updateTick.startTick()
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

console.log(BASE_MAPS.test())

run()
