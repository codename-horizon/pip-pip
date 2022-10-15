import { PipPipGamePhase } from "@pip-pip/game/src/logic"
import { PipPlayer } from "@pip-pip/game/src/logic/player"
import { PIP_SHIPS } from "@pip-pip/game/src/ships"
import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { GameContext, getClientPlayer } from "."



export const useGameStore = defineStore("game", () => {
    const gameContext = ref<GameContext>()
    const loading = ref(false)
    const ready = ref(false)
    
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

    const isReady = computed(() => ready.value && !loading.value)

    const test = () => {
        ready.value = !ready.value
    }

    function sync(context: GameContext){
        gameContext.value = context
        const { game } = context
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
        loading, ready,

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

        gameContext,

        isReady,

        test,

        sync,
    }
})