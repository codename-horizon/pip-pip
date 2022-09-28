import { PipPipGame, Player } from "@pip-pip/game/src/logic/test";
import { defineComponent, onMounted, ref } from "vue";
import * as PIXI from "pixi.js"
import ship1 from "../assets/ship-1.png"
import { assets } from "../game/assets";
import { generateId, KeyboardListener, PIXIGraphics, Ticker } from "@pip-pip/core/src/client";
import { PipPipGameRenderer } from "../game/render";


const game = new PipPipGame()
const renderer = new PipPipGameRenderer()
const keyboard = new KeyboardListener()
renderer.setGame(game)
const player = new Player("single")

const dataTick = new Ticker(20, false, "Data")
const renderTick = new Ticker(20, true, "Render")
const updateTick = new Ticker(20, false, "Update")
const debugTick = new Ticker(1, false, "Debug")

debugTick.on("tick", () => {
    const perf = renderTick.getPerformance()
    document.title = `${perf.averageTPS.toFixed(2)} FPS @ ${perf.averageExecutionTime.toFixed(2)}ms`
    console.log(renderer.graphics.viewport.position)
})
function setup(){
    const container = ref()
    // const overlayMode
    // const overlayData

    onMounted(() => {
        renderer.graphics.setContainer(container.value)
        renderer.setup()
        keyboard.setTarget(document.body)
        game.addPlayer(player)

        for(let i = 0; i < 600; i++){
            const p = new Player(generateId())
            p.physics.position.x = Math.random() * 1000
            p.physics.position.y = Math.random() * 1000
            game.addPlayer(p)
        }

        updateTick.on("tick", ({ deltaMs }) => {
        })

        renderTick.on("tick", ({ deltaMs }) => {
            game.physics.update(deltaMs)
            renderer.render(deltaMs)

            // inputs
            const deltaTime = deltaMs / (1000 / 60)
            const mag = 1 * deltaTime
            if(keyboard.state.KeyW) player.physics.velocity.y -= mag
            if(keyboard.state.KeyS) player.physics.velocity.y += mag
            if(keyboard.state.KeyA) player.physics.velocity.x -= mag
            if(keyboard.state.KeyD) player.physics.velocity.x += mag
        })

        renderTick.startTick()
        updateTick.startTick()
        debugTick.startTick()
    })

    return { container }
}

export default defineComponent({
    setup,
})