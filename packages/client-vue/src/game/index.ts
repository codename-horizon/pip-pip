import { useGameStore } from "./store"
import { client, clientEvents } from "./client"
import { useUiStore } from "../store/ui"
import { router } from "../router"
import { LobbyJSON } from "@pip-pip/core/src/networking/api/types"
import { PipPipGame, PipPipGameEventMap, PipPipGamePhase } from "@pip-pip/game/src/logic"
import { KeyboardListener } from "@pip-pip/core/src/client/keyboard"
import { MouseListener } from "@pip-pip/core/src/client/mouse"
import { PipPipRenderer } from "./renderer"
import { EventCollector, EventEmitter, EventMapOf } from "@pip-pip/core/src/common/events"
import { Client } from "@pip-pip/core/src/networking/client"

import { packetManager, PipPacketSerializerMap } from "@pip-pip/game/src/networking/packets"
import { Ticker } from "@pip-pip/core/src/common/ticker"

export type RendererContext = {
    game: PipPipGame,
    gameEvents: EventCollector<PipPipGameEventMap>,
    keyboard: KeyboardListener,
    mouse: MouseListener,
}

export const getClientPlayer = (game: PipPipGame) => {
    if(typeof client.connectionId !== "undefined"){
        if(client.connectionId in game.players){
            return game.players[client.connectionId]
        }
    }
}

export async function hostGame(){
    const uiStore = useUiStore()
    uiStore.loading = true
    uiStore.body = "Loading..."
    try{
        uiStore.body = "Requesting connection..."
        await client.requestConnectionIfNeeded()
        uiStore.body = "Creating lobby..."
        const lobby = await client.createLobby("default")
        router.push({
            name: "game",
            params: {
                id: lobby.lobbyId,
            },
        })
    } catch(e){
        console.warn(e)
        alert("Could not host a game!")
    }
    uiStore.loading = false
}

class GameContext{
    game!: PipPipGame
    renderer!: PipPipRenderer
    gameEvents!: EventCollector<EventMapOf<PipPipGame["events"]>>
    
    renderTick!: Ticker
    updateTick!: Ticker

    client!: Client<PipPacketSerializerMap>
    clientEvents!: EventCollector<EventMapOf<Client<PipPacketSerializerMap>["events"]>>

    keyboard!: KeyboardListener
    mouse!: MouseListener

    initialized = false

    constructor(){
        this.initializeClient()
    }

    initializeClient(){
        this.client?.disconnect()
        this.client = new Client(packetManager, {
            host: window.location.hostname,
            port: 3000,
        })

        this.clientEvents?.destroy()
        this.clientEvents = new EventCollector(client.events)
    }

    mountGameView(){
        this.unmountGameView()
        this.game = new PipPipGame()

        // this.renderer?.destroy()
        this.renderer = new PipPipRenderer(this.game)
        this.gameEvents = new EventCollector(this.game.events)
        
        this.renderTick = new Ticker(60, true, "Render")
        this.updateTick = new Ticker(this.game.tps, false, "Update")

        this.keyboard = new KeyboardListener()
        this.mouse = new MouseListener()
    }

    unmountGameView(){
        this.game?.destroy()
    }

    destory(){
        if(this.initialized) return
        this.game?.destroy()
        // this.renderer?.destroy()
        this.gameEvents?.destroy()
        this.renderTick?.destroy()
        this.updateTick?.destroy()
        this.client?.disconnect()
        this.clientEvents?.destroy()
    }

    reset(){

        this.initialized = true
    }
    
}