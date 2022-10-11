import { useGameStore } from "./store"
import { client, clientEvents } from "./client"
import { useUiStore } from "../store/ui"
import { router } from "../router"
import { LobbyJSON } from "@pip-pip/core/src/networking/api/types"
import { PipPipGame, PipPipGameEventMap, PipPipGamePhase } from "@pip-pip/game/src/logic"
import { KeyboardListener } from "@pip-pip/core/src/client/keyboard"
import { MouseListener } from "@pip-pip/core/src/client/mouse"
import { PipPipRenderer } from "./renderer"
import { EventCollector } from "@pip-pip/core/src/common/events"

export type RendererContext = {
    game: PipPipGame,
    gameEvents: EventCollector<PipPipGameEventMap>,
    keyboard: KeyboardListener,
    mouse: MouseListener,
}

export type GameContext = {
    renderer: PipPipRenderer,
} & RendererContext

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