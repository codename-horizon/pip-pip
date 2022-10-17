import { PipPipGamePhase } from "@pip-pip/game/src/logic"
import { PIP_SHIPS } from "@pip-pip/game/src/ships"
import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { GAME_CONTEXT, GameContext, getClientPlayer } from "."

export const useGameStore = defineStore("game", () => {
    const loading = ref(false)
    
    const phase = ref(0)
    const countdownMs = ref(0)
    const isHost = ref(false)
    const ping = ref(0)

    const clientPlayerShipIndex = ref(0)
    const clientPlayerShipType = computed(() => PIP_SHIPS[clientPlayerShipIndex.value])

    const isPhaseSetup = computed(() => phase.value === PipPipGamePhase.SETUP)
    const isPhaseCountdown = computed(() => phase.value === PipPipGamePhase.COUNTDOWN)
    const isPhaseMatch = computed(() => phase.value === PipPipGamePhase.MATCH)
    const isPhaseResults = computed(() => phase.value === PipPipGamePhase.RESULTS)


    function sync(){
        const { game } = GAME_CONTEXT
        const gameClientPlayer = getClientPlayer(game)

        phase.value = game.phase
        countdownMs.value = game.countdown / game.tps * 1000

        if(typeof gameClientPlayer === "undefined"){
            // player doesnt exist
        } else{
            // player exists
            isHost.value = game.host?.id === gameClientPlayer.id
            ping.value = gameClientPlayer.ping
            clientPlayerShipIndex.value = gameClientPlayer.shipIndex
        }
    }

    return {
        loading,

        countdownMs,

        isHost,
        ping,
        clientPlayerShipIndex,
        clientPlayerShipType,
        
        phase,
        isPhaseSetup,
        isPhaseCountdown,
        isPhaseMatch,
        isPhaseResults,

        sync,
    }
})