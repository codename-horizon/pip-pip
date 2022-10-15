import { defineComponent, onMounted, onUnmounted, ref, render } from "vue"

import { KeyboardListener } from "@pip-pip/core/src/client/keyboard"
import { MouseListener } from "@pip-pip/core/src/client/mouse"
import { EventCollector } from "@pip-pip/core/src/common/events"
import { Ticker } from "@pip-pip/core/src/common/ticker"

import { PipPipGame, PipPipGamePhase } from "@pip-pip/game/src/logic"

import { processPackets, clientEvents, sendGamePhase, sendPackets } from "../game/client"
import { PipPipRenderer } from "../game/renderer"
import { processInputs } from "../game/ui"
import { getClientPlayer } from "../game"
import { PIP_SHIPS } from "@pip-pip/game/src/ships"
import { useGameStore } from "../game/store"

import GameOverlaySetup from "./GameOverlaySetup.vue"
import GameButton from "./GameButton.vue"

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
        
        const game = new PipPipGame()
        const renderer = new PipPipRenderer(game)
        
        const gameEvents = new EventCollector(game.events)
        const keyboard = new KeyboardListener()
        const mouse = new MouseListener()
        
        const renderTick = new Ticker(60, true, "Render")
        const updateTick = new Ticker(game.tps, false, "Update")

        const context = {
            renderer,
            game,
            gameEvents,
            mouse,
            keyboard,
        }

        onMounted(() => {
            keyboard.setTarget(document.body)
            mouse.setTarget(document.body)

            if(typeof container.value === "undefined") throw new Error("Container not available.")
            renderer.mount(container.value)

            renderTick.on("tick", ({deltaMs, deltaTime}) => {
                renderer.render(context, deltaMs)
            })

            updateTick.on("tick", () => {
                // Apply messages
                processPackets(context)

                // Apply inputs
                processInputs(context)

                // Update local simulation
                game.update()

                // Send packets
                sendPackets(context)

                // Send updates
                gameEvents.flush()
                clientEvents.flush()

                // Update UI
                gameStore.sync(context)

                // Update document title
                const updatePerf = updateTick.getPerformance()
                const renderPerf = renderTick.getPerformance()
                const title = [
                    updatePerf.averageDeltaTime.toFixed(2),
                    renderPerf.averageDeltaTime.toFixed(2),
                    gameStore.ping.toFixed(2),
                ]
                window.document.title = title.join(" ")
            })

            renderTick.startTick()
            updateTick.startTick()
        })

        onUnmounted(() => {
            gameEvents.destroy()
            keyboard.destroy()
            mouse.destroy()
            renderTick.destroy()
            updateTick.destroy()
        })

        // User interface interactions
        function startGame(){
            sendGamePhase(PipPipGamePhase.COUNTDOWN)
        }

        function setShip(index: number){
            getClientPlayer(game)?.setShip(index)
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