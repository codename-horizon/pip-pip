import { defineComponent, onMounted, onUnmounted, ref } from "vue"

import { KeyboardListener } from "@pip-pip/core/src/client/keyboard"
import { MouseListener } from "@pip-pip/core/src/client/mouse"
import { EventCollector } from "@pip-pip/core/src/common/events"
import { Ticker } from "@pip-pip/core/src/common/ticker"

import { PipPipGame, PipPipGamePhase } from "@pip-pip/game/src/logic"

import { processPackets, clientEvents, sendGamePhase, sendPackets } from "../game/client"
import { PipPipRenderer } from "../game/renderer"
import GameButton from "./GameButton.vue"
import { getUIContext, processInputs, UIContext } from "../game/ui"
import { getClientPlayer } from "../game"
import { PIP_SHIPS } from "@pip-pip/game/src/logic/ship"

export default defineComponent({
    inheritAttrs: false,
    components: {
        GameButton,
    },
    setup(props, ctx) {
        const debugJson = ref({})
        const container = ref<HTMLDivElement>()
        
        const game = new PipPipGame()
        const renderer = new PipPipRenderer(game)

        console.log(game)
        
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

        const uiContext = ref<UIContext>(getUIContext(context))

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
                uiContext.value = getUIContext(context)
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
            uiContext, 
            container, 
            debugJson,
            
            startGame,
            setShip,
            PIP_SHIPS,
        }
    },
})