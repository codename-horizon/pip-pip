import { useGameStore } from "./store"
import { client, clientEvents } from "./client"
import { useUiStore } from "../store/ui"
import { router } from "../router"
import { LobbyJSON } from "@pip-pip/core/src/networking/api/types"
import { PipPipGame, PipPipGamePhase } from "@pip-pip/game/src/logic"
import { KeyboardListener } from "@pip-pip/core/src/client/keyboard"
import { MouseListener } from "@pip-pip/core/src/client/mouse"
import { PipPipRenderer } from "./renderer"

export type RendererContext = {
    game: PipPipGame,
    keyboard: KeyboardListener,
    mouse: MouseListener,
}

export type GameContext = {
    renderer: PipPipRenderer,
} & RendererContext


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