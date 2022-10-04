import { PipPipGame, Player, Ship } from "@pip-pip/game/src/logic/test";
import { defineComponent, onMounted, ref } from "vue";
import * as PIXI from "pixi.js"
import ship1 from "../assets/ship-1.png"
import { assets } from "../game/assets";
import { degreeDifference, EventCollector, generateId, KeyboardListener, MouseListener, PIXIGraphics, Ticker } from "@pip-pip/core/src/client";
import { PipPipGameRenderer } from "../game/render";


import { Client } from '@pip-pip/core/src/client'
import { encodeMovePlayer, packetManager } from '@pip-pip/game/src/networking/packets'

const client = new Client(packetManager, {
    // host: "star-mag.at.playit.gg",
    // port: 17294,
})

const clientEvents = new EventCollector(client.events)

const game = new PipPipGame()
const renderer = new PipPipGameRenderer()
const keyboard = new KeyboardListener()
const mouse = new MouseListener()
renderer.setGame(game)
renderer.setClient(client)

const dataTick = new Ticker(20, false, "Data")
const renderTick = new Ticker(20, true, "Render")
const updateTick = new Ticker(game.tps, false, "Update")
const debugTick = new Ticker(4, false, "Debug")

let lobbyId = window.location.href.split("#")[1] || ""

function setup(){
    const container = ref()
    const debugJson = ref<Record<string, any>>({})
    // const overlayMode
    // const overlayData

    onMounted(async () => {
        console.log(client)
        await client.connect()
        if(lobbyId.length === 0){
            if(confirm("Create a new lobby?")){
                const lobby = await client.createLobby("default")
                lobbyId = lobby.lobbyId
            } else{
                const _lobbyId = prompt("What lobby ID code?")
                lobbyId = typeof _lobbyId === "string" ? _lobbyId : ""
            }
        }
        console.log(lobbyId)
        window.location.href = window.location.href.split("#")[0] + "#" + lobbyId
        await client.joinLobby(lobbyId)

        renderer.graphics.setContainer(container.value)
        renderer.setup()
        keyboard.setTarget(document.body)
        mouse.setTarget(renderer.graphics.app.view)

        console.log(
            game, renderer, keyboard, mouse,
        )

        updateTick.on("tick", ({ deltaMs, deltaTime }) => {
            // Handle incoming messages
            for(const event of clientEvents.filter("packetMessage")){
                const { packets } = event.packetMessage
                for(const t of packets.syncTick || []){
                    console.log(game.tickNumber, t.number)
                    game.tickNumber = t.number
                }
                for(const p of packets.newPlayer || []){
                    const player = new Player(p.id)
                    player.ship = new Ship()
                    player.physics.position.x = p.x
                    player.physics.position.y = p.y
                    game.addPlayer(player)
                    console.log("new player", p)
                }
                for(const p of packets.movePlayer || []){
                    const player = game.players[p.id]
                    if(typeof player !== "undefined"){
                        // if(player.id === client.connectionId && player.acceleration.magnitude > 0) continue
                        if(player.id === client.connectionId) continue
                        player.physics.position.x = p.x
                        player.physics.position.y = p.y
                        player.physics.velocity.x = p.vx
                        player.physics.velocity.y = p.vy
                        player.acceleration.angle = p.aa
                        player.acceleration.magnitude = p.am
                        player.targetRotation = p.tr
                    }
                }
                for(const p of packets.removePlayer || []){
                    const player = game.players[p.id]
                    if(typeof player !== "undefined"){
                        game.removePlayer(player)
                    }
                }
                for(const p of packets.playerPing || []){
                    const player = game.players[p.id]
                    if(typeof player !== "undefined"){
                        player.ping = p.ping
                    }
                }
            }

            const player = game.players[client.connectionId || ""]
            if(typeof player !== "undefined"){
                debugJson.value.game = {
                    fps: renderTick.getPerformance().averageTPS.toFixed(2) + "Hz",
                    execTime: updateTick.getPerformance().averageExecutionTime.toFixed(2) + "ms",
                    "tick": game.tickNumber,
                    deltaMs, deltaTime,
                    entities: Object.keys(game.physics.objects).length,
                }
                debugJson.value.player = {
                    lobbyId,
                    ping: player.ping + "ms",
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
            }

            // update the game
            game.update()

            // Send position
            if(typeof player !== "undefined"){
                let code: number[] = []
                const messages = [
                    packetManager.serializers.tick.encode({ number: game.tickNumber }),
                ]

                messages.push(encodeMovePlayer(player))

                for(const message of messages){
                    code = code.concat(message)
                }

                const buffer = new Uint8Array(code).buffer
                client.send(buffer)
            }

            // flush
            clientEvents.flush()
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