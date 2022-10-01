import { PipPipGame, Player, Ship } from "@pip-pip/game/src/logic/test";
import { defineComponent, onMounted, ref } from "vue";
import * as PIXI from "pixi.js"
import ship1 from "../assets/ship-1.png"
import { assets } from "../game/assets";
import { degreeDifference, generateId, KeyboardListener, MouseListener, PIXIGraphics, Ticker } from "@pip-pip/core/src/client";
import { PipPipGameRenderer } from "../game/render";


const game = new PipPipGame()
const renderer = new PipPipGameRenderer()
const keyboard = new KeyboardListener()
const mouse = new MouseListener()
renderer.setGame(game)
const player = new Player("single")
player.ship = new Ship()

const dataTick = new Ticker(20, false, "Data")
const renderTick = new Ticker(20, true, "Render")
const updateTick = new Ticker(game.tps, false, "Update")
const debugTick = new Ticker(4, false, "Debug")

debugTick.on("tick", () => {
    const renderPerf = renderTick.getPerformance()
    const updatePerf = updateTick.getPerformance()
    const totalExecTime = Number(updatePerf.averageExecutionTime + renderPerf.averageExecutionTime).toFixed(2)
    document.title = `${renderPerf.averageTPS.toFixed(2)}fps ${updatePerf.averageExecutionTime.toFixed(2)}+${renderPerf.averageExecutionTime.toFixed(2)}=${totalExecTime}ms`
})

function setup(){
    const container = ref()
    const debugJson = ref<Record<string, any>>({})
    // const overlayMode
    // const overlayData

    onMounted(() => {
        renderer.graphics.setContainer(container.value)
        renderer.setup()
        keyboard.setTarget(document.body)
        mouse.setTarget(renderer.graphics.app.view)
        game.addPlayer(player)

        console.log(
            game, renderer, keyboard, mouse,
        )

        for(let i = 0; i < 200; i++){
            const p = new Player(generateId())
            p.physics.position.x = Math.random() * 600
            p.physics.position.y = Math.random() * 600
            // p.physics.mass = Math.random() * 300
            // p.physics.radius = p.physics.mass / 100 * 25
            game.addPlayer(p)
        }

        updateTick.on("tick", ({ deltaMs, deltaTime }) => {
            debugJson.value.game = {
                "tick": game.tickNumber,
                deltaMs, deltaTime,
                entities: Object.keys(game.physics.objects).length
            }
            debugJson.value.player = {
                mag: player.debugMagModifier.toFixed(2),
                shooting: player.shooting,
                reloading: player.isReloading ? player.reloadTimeLeft : false,
                ammo: player.ammo,
            }
            debugJson.value.bullets = {
                count: Object.keys(game.bullets).length,
            }
            
            
            // inputs
            let xInput = 0, yInput = 0

            if(keyboard.state.KeyW) yInput -= 1
            if(keyboard.state.KeyS) yInput += 1
            if(keyboard.state.KeyA) xInput -= 1
            if(keyboard.state.KeyD) xInput += 1

            const hasKeyboardInput = xInput !== 0 || yInput !== 0
            
            if(hasKeyboardInput){
                player.acceleration.angle = Math.atan2(yInput, xInput)
                player.acceleration.magnitude = 1
            }

            if(!hasKeyboardInput){
                player.acceleration.magnitude = 0
            }

            // aiming
            const mouseAngle = Math.atan2(
                mouse.state.position.y - window.innerHeight / 2,
                mouse.state.position.x - window.innerWidth / 2,
            )
            
            player.targetRotation = mouseAngle

            // shooting
            player.shooting = mouse.state.down
            if(keyboard.state.KeyR) player.reload()

            // update the game
            game.update()
        })

        renderTick.on("tick", ({ deltaMs }) => {
            renderer.render(deltaMs)
        })

        renderTick.startTick()
        updateTick.startTick()
        debugTick.startTick()
    })

    return { container, debugJson }
}

export default defineComponent({
    setup,
})