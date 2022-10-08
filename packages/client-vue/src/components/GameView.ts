import { KeyboardListener } from "@pip-pip/core/src/client/keyboard"
import { MouseListener } from "@pip-pip/core/src/client/mouse"
import { EventCallbackOf, EventMapOf } from "@pip-pip/core/src/common/events"
import { Ticker } from "@pip-pip/core/src/common/ticker"
import { PipPipGame } from "@pip-pip/game/src/logic"
import { defineComponent, onMounted, onUnmounted } from "vue"
import { client, clientEvents } from "../game/client"

export default defineComponent({
    setup(props, ctx) {
        const clientEventsListener: EventCallbackOf<EventMapOf<typeof clientEvents>, "collect"> = ({ event }) => {
            console.log("something happened", event)
        }
        
        const game = new PipPipGame({
            shootAiBullets: false,
            calculateAi: true,
        })
        const keyboard = new KeyboardListener()
        const mouse = new MouseListener()
        
        const renderTick = new Ticker(20, true, "Render")
        const updateTick = new Ticker(game.tps, false, "Update")

        onMounted(() => {
            clientEvents.on("collect", clientEventsListener)
        })
        onUnmounted(() => {
            clientEvents.off("collect", clientEventsListener)
            keyboard.destroy()
            mouse.destroy()
            renderTick.destroy()
            updateTick.destroy()
        })
    },
})