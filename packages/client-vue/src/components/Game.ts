import { defineComponent, onMounted, ref } from "vue";

import { KeyboardListener } from "@pip-pip/core/src/client/keyboard"
import { EventCollector } from "@pip-pip/core/src/common/events";
import { MouseListener } from "@pip-pip/core/src/client/mouse"
import { Client } from "@pip-pip/core/src/networking/client";
import { Ticker } from "@pip-pip/core/src/common/ticker"

import { encode, packetManager } from '@pip-pip/game/src/networking/packets'
import { Player } from "@pip-pip/game/src/logic/player";
import { Bullet } from "@pip-pip/game/src/logic/bullet";
import { Ship } from "@pip-pip/game/src/logic/ship";
import { PipPipGame } from "@pip-pip/game/src/logic";

import { PipPipGameRenderer } from "../game/render";

const client = new Client(packetManager, {
    host: window.location.hostname,
    port: 3000,
})

const clientEvents = new EventCollector(client.events)

const game = new PipPipGame({
    shootAiBullets: false,
    calculateAi: true,
})
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
let lastTick = 0

// new EventCollector(client.packets.events).on("collect", ({event}) => console.log(event))

async function findLobby(){
    if(lobbyId.length > 0){
        try{
            await client.joinLobby(lobbyId)
            window.location.hash = lobbyId
            return
        } catch(e){
            console.warn(e)
            alert(`Could not connect to lobby ${lobbyId}`)
        }
    }
    if(confirm("Create a new lobby?")){
        const lobby = await client.createLobby("default")
        lobbyId = lobby.lobbyId
    } else{
        const _lobbyId = prompt("What lobby ID code?")
        lobbyId = typeof _lobbyId === "string" ? _lobbyId : ""
    }
    await findLobby()
}

function setup(){
    const container = ref()
    const debugJson = ref<Record<string, any>>({})
    // const overlayMode
    // const overlayData

    onMounted(async () => {
        console.log(client)
        await client.connect()

        await findLobby()

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
                let packetIsOld = false
                const { packets } = event.packetMessage
                for(const t of packets.syncTick || []){
                    game.tickNumber = t.number
                }
                for(const t of packets.tick || []){
                    if(t.number > lastTick){
                        lastTick = t.number
                    } else{
                        packetIsOld = true
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
                for(const p of packets.playerGun || []){
                    if(typeof client.connectionId !== "undefined"){
                        const player = game.players[client.connectionId]
                        if(typeof player !== "undefined"){
                            player.ammo = p.ammo
                            player.reloadTimeLeft = p.reloadTimeLeft
                        }
                    }
                }
                for(const p of packets.newPlayer || []){
                    const player = new Player(p.id)
                    player.ship = new Ship()
                    player.ai = p.ai
                    player.physics.position.x = p.x
                    player.physics.position.y = p.y
                    game.addPlayer(player)
                    console.log("new player", p)
                }
                for(const b of packets.shootBullet || []){
                    const bullet = new Bullet()
                    const player = game.players[b.playerId]
                    if(typeof player !== "undefined"){
                        bullet.setOwner(player)
                    }
                    bullet.physics.position.x = b.x
                    bullet.physics.position.y = b.y
                    bullet.physics.velocity.x = b.vx
                    bullet.physics.velocity.y = b.vy
                    game.addBullet(bullet)
                }
                // Discard data if packet is old
                if(packetIsOld === false){
                    for(const p of packets.movePlayer || []){
                        const player = game.players[p.id]
                        if(typeof player !== "undefined"){
                            // if(player.id === client.connectionId && player.acceleration.magnitude > 0) continue
                            if(player.id === client.connectionId) continue
                            player.physics.position.x = p.x
                            player.physics.position.y = p.y
                            player.physics.velocity.x = p.vx
                            player.physics.velocity.y = p.vy
                            player.acceleration.angle = p.accelerationAngle
                            player.acceleration.magnitude = p.accelerationMagnitude
                            player.targetRotation = p.targetRotation
                        }
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
                    shooting: player.inputShooting,
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
                player.inputShooting = mouse.state.down || keyboard.state.Space
                player.inputReloading = keyboard.state.KeyR
            }

            // update the game
            game.update()

            // Send position
            if(typeof player !== "undefined"){
                let code: number[] = []
                const messages = [
                    encode.tick(game),
                ]

                messages.push(encode.playerInput(player))

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