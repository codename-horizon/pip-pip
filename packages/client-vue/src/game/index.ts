import { useGameStore } from "./store"
import { client, clientEvents } from "./client"
import { useUiStore } from "../store/ui"
import { router } from "../router"
import { LobbyJSON } from "@pip-pip/core/src/networking/api/types"

export async function hostGame(){
    const uiStore = useUiStore()
    uiStore.loading = true
    uiStore.body = "Loading..."
    try{
        uiStore.body = "Connecting..."
        await client.connect()
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