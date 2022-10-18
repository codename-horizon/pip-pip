import { useGameStore } from "./store"
import { useUiStore } from "../store/ui"
import { router } from "../router"
import { PipPipGame, PipPipGamePhase } from "@pip-pip/game/src/logic"
import { KeyboardListener } from "@pip-pip/core/src/client/keyboard"
import { MouseListener } from "@pip-pip/core/src/client/mouse"
import { PipPipRenderer } from "./renderer"
import { EventCollector, EventMapOf } from "@pip-pip/core/src/common/events"
import { Client } from "@pip-pip/core/src/networking/client"

import { encode, packetManager, PipPacketSerializerMap } from "@pip-pip/game/src/networking/packets"
import { Ticker } from "@pip-pip/core/src/common/ticker"
import { processPackets, sendPackets } from "./client"
import { processInputs } from "./ui"
import { processChat } from "./chat"

export class GameContext{
    game!: PipPipGame
    renderer!: PipPipRenderer
    gameEvents!: EventCollector<EventMapOf<PipPipGame["events"]>>
    
    renderTick!: Ticker
    updateTick!: Ticker

    client!: Client<PipPacketSerializerMap>
    clientEvents!: EventCollector<EventMapOf<Client<PipPacketSerializerMap>["events"]>>

    keyboard!: KeyboardListener
    mouse!: MouseListener

    container!: HTMLDivElement

    initialized = false

    store!: ReturnType<typeof useGameStore>

    initialize(){
        this.initializeClient()
        this.store = useGameStore()
    }

    initializeClient(){
        this.client?.disconnect()
        this.client = new Client(packetManager, {
            host: window.location.hostname,
            port: 3000,
        })

        this.clientEvents?.destroy()
        this.clientEvents = new EventCollector(this.client.events)
    }

    mountGameView(container: HTMLDivElement){
        this.unmountGameView()
        this.game = new PipPipGame()

        // this.renderer?.destroy()
        this.renderer = new PipPipRenderer(this.game)
        this.gameEvents = new EventCollector(this.game.events)
        
        this.renderTick = new Ticker(60, true, "Render")
        this.updateTick = new Ticker(this.game.tps, false, "Update")

        this.keyboard = new KeyboardListener()
        this.mouse = new MouseListener()
        this.keyboard.setTarget(document.body)
        this.mouse.setTarget(document.body)

        this.renderer.mount(container)

        this.renderTick.on("tick", ({deltaMs, deltaTime}) => {
            this.renderer.render(this, deltaMs)
        })

        this.updateTick.on("tick", () => {
            // Apply messages
            processPackets(this)
            processChat(this)

            // Apply inputs
            processInputs(this)

            // Update local simulation
            this.game.update()

            // Send packets
            sendPackets(this)

            // Send updates
            this.gameEvents.flush()
            this.clientEvents.flush()

            // Update UI
            this.store.sync()

            // Update document title
            const updatePerf = this.updateTick.getPerformance()
            const renderPerf = this.renderTick.getPerformance()
            const title = [
                updatePerf.averageDeltaTime.toFixed(2),
                renderPerf.averageDeltaTime.toFixed(2),
                // gameStore.ping.toFixed(2),
            ]
            window.document.title = title.join(" ")
        })

        this.renderTick.startTick()
        this.updateTick.startTick()
    }

    unmountGameView(){
        console.log("unmounted")
        this.game?.destroy()
        this.gameEvents?.destroy()
        this.renderTick?.destroy()
        this.updateTick?.destroy()
    }

    destory(){
        // this.renderer?.destroy()
        this.client?.disconnect()
        this.clientEvents?.destroy()
    }

    reset(){

        this.initialized = true
    }

    getClientPlayer(){
        if(typeof this.client.connectionId !== "undefined"){
            if(this.client.connectionId in this.game.players){
                return this.game.players[this.client.connectionId]
            }
        }
    }
    
    sendGamePhase(phase: PipPipGamePhase){
        const code = encode.gamePhase(phase)
        const buffer = new Uint8Array(code).buffer
        this.client.send(buffer)
    }

}

export const GAME_CONTEXT = new GameContext()

export const getClientPlayer = (game: PipPipGame) => {
    if(typeof GAME_CONTEXT.client.connectionId !== "undefined"){
        if(GAME_CONTEXT.client.connectionId in game.players){
            return game.players[GAME_CONTEXT.client.connectionId]
        }
    }
}

export async function hostGame(){
    const uiStore = useUiStore()
    uiStore.loading = true
    uiStore.body = "Loading..."
    try{
        uiStore.body = "Requesting connection..."
        await GAME_CONTEXT.client.requestConnectionIfNeeded()
        uiStore.body = "Creating lobby..."
        const lobby = await GAME_CONTEXT.client.createLobby("default")
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