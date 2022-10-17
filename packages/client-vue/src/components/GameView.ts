import { defineComponent, onMounted, onUnmounted, ref, render } from "vue"

import { PipPipGamePhase } from "@pip-pip/game/src/logic"

import { sendGamePhase } from "../game/client"
import { PIP_SHIPS } from "@pip-pip/game/src/ships"
import { useGameStore } from "../game/store"

import GameOverlaySetup from "./GameOverlaySetup.vue"
import GameButton from "./GameButton.vue"
import { gameContext } from "../game"

export default defineComponent({
    inheritAttrs: false,
    components: {
        GameButton,
        GameOverlaySetup,
    },
    setup(props, ctx) {
        const gameStore = useGameStore()

        const debugJson = ref({})
        const container = ref<HTMLDivElement>()

        onMounted(() => {
            if(typeof container.value === "undefined") throw new Error("Container not available.")
            gameContext.mountGameView(container.value)
        })

        onUnmounted(() => {
            gameContext.unmountGameView()
            gameContext.client.disconnect()
        })

        // User interface interactions
        function startGame(){
            sendGamePhase(PipPipGamePhase.COUNTDOWN)
        }

        function setShip(index: number){
            
        }

        return { 
            gameStore,
            container, 
            debugJson,
            
            startGame,
            setShip,
            PIP_SHIPS,
        }
    },
})