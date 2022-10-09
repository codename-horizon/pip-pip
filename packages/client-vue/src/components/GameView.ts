import { KeyboardListener } from "@pip-pip/core/src/client/keyboard"
import { MouseListener } from "@pip-pip/core/src/client/mouse"
import { EventCallbackOf, EventCollector, EventMapOf } from "@pip-pip/core/src/common/events"
import { Ticker } from "@pip-pip/core/src/common/ticker"
import { PipPipGame } from "@pip-pip/game/src/logic"
import { defineComponent, onMounted, onUnmounted, ref } from "vue"
import { client, clientEvents } from "../game/client"

export default defineComponent({
    inheritAttrs: false,
    setup(props, ctx) {
        const debugJson = ref({})

        const clientEventsListener: EventCallbackOf<EventMapOf<typeof clientEvents>, "collect"> = ({ event }) => {
            if(typeof event.packetMessage !== "undefined"){
                for(const id in event.packetMessage.packets){
                    const packets = event.packetMessage.packets[id as keyof typeof event.packetMessage.packets]
                    if(typeof packets !== "undefined"){
                        for(const packet of packets){
                            console.log(id, packet)
                        }
                    }
                }
            }
        }
        
        const game = new PipPipGame({
            shootAiBullets: false,
            calculateAi: true,
            assignHost: false,
        })
        
        const gameEvents = new EventCollector(game.events)
        const keyboard = new KeyboardListener()
        const mouse = new MouseListener()
        
        const renderTick = new Ticker(20, true, "Render")
        const updateTick = new Ticker(game.tps, false, "Update")

        onMounted(() => {
            clientEvents.on("collect", clientEventsListener)

            updateTick.on("tick", () => {
                // Apply messages

                // Update local simulation

                // Send updates
                gameEvents.flush()
                clientEvents.flush()
            })

            updateTick.startTick()
        })
        onUnmounted(() => {
            clientEvents.off("collect", clientEventsListener)
            gameEvents.destroy()
            keyboard.destroy()
            mouse.destroy()
            renderTick.destroy()
            updateTick.destroy()
        })

        return { debugJson }
    },
})