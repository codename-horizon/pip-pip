import { Packet, PacketDecoded, PacketType } from "@pip-pip/core/src/common"
import { PipPipGame, Player } from "@pip-pip/game/src/logic/test"
import { PipPipClient } from "@pip-pip/game/src/networking/client"
import { PipPipPacketMap } from "@pip-pip/game/src/networking/packets"

export async function runGame(canvas: HTMLCanvasElement){
    const client = new PipPipClient({
        host: "star-mag.at.playit.gg",
        port: 17294,
    })
    const connection = await client.registerConnection()
    await client.connectSocket()

    console.log(client.token)

    const game = new PipPipGame()

    const player = new Player(connection.id)
    player.physics.position.x = Math.random() * canvas.width
    player.physics.position.y = Math.random() * canvas.height
    // const a = Math.random() * Math.PI * 2
    // const m = Math.random() * 10
    // player.physics.velocity.x = Math.cos(a) * m
    // player.physics.velocity.y = Math.sin(a) * m
    game.addPlayer(player)

    const keyPressed = {
        "up": false,
        "left": false,
        "down": false,
        "right": false,
    }

    window.addEventListener("keydown", (e) => {
        if(e.code === "KeyW") keyPressed.up = true
        if(e.code === "KeyA") keyPressed.left = true
        if(e.code === "KeyS") keyPressed.down = true
        if(e.code === "KeyD") keyPressed.right = true
        console.log(keyPressed)
    })

    window.addEventListener("keyup", (e) => {
        if(e.code === "KeyW") keyPressed.up = false
        if(e.code === "KeyA") keyPressed.left = false
        if(e.code === "KeyS") keyPressed.down = false
        if(e.code === "KeyD") keyPressed.right = false
        console.log(keyPressed)
    })

    const context = canvas.getContext("2d")

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let time = 0
    let uploadInterval = 3
    let lastServerTick = 0

    const isPacketOld = (group: PacketDecoded[]) => {
        const gameTickPacket: undefined | PacketDecoded<PacketType<PipPipPacketMap["gameTick"]>> = group.find(packet => packet.code === "gameTick") as PacketDecoded<PacketType<PipPipPacketMap["gameTick"]>>
        if(typeof gameTickPacket === "undefined") return false // ignore, cant do anything
        if(gameTickPacket.value < lastServerTick) {
            console.log("OLD OLD OLD!!!!")
            return true
        }
        lastServerTick = gameTickPacket.value
        return false
    }

    client.packetEvents.on("playerPositions", ({ group, value }) => {
        if(isPacketOld(group)) return
        value.forEach(([playerId, x, y, vx, vy, a]) => {
            if(!(playerId in game.players)){
                const np = new Player(playerId)
                game.addPlayer(np)
            }
            const p = game.players[playerId]
            if(playerId === player.id){
                const dx = x - p.physics.position.x
                const dy = y - p.physics.position.y
                const dist = Math.sqrt(dx*dx + dy*dy)
                if(dist < 100) return
            }
            p.physics.position.qx = x
            p.physics.position.qy = y
            p.physics.velocity.qx = vx
            p.physics.velocity.qy = vy
        })

        for(const id in game.players){
            const p = game.players[id]
            p.physics.position.flush()
            p.physics.velocity.flush()
        }
    })

    client.packetEvents.on("playerDisconnect", ({ value }) => {
        if(value in game.players){
            const p = game.players[value]
            game.removePlayer(p)
        }
    })

    function uploadLoop(){
        client.sendSocketData(client.packetManager.group([
            client.packetManager.encode("playerPosition", [
                player.physics.position.x,
                player.physics.position.y,
                player.physics.velocity.x,
                player.physics.velocity.y,
                0,
            ])
        ]))
    }

    setInterval(uploadLoop, 1000 / 20)

    function loop(){
        requestAnimationFrame(loop)
        time++
        game.physics.update()
        if(context === null) return
        context.fillStyle = "black"
        context.fillRect(0, 0, canvas.width, canvas.height)

        const bools: [boolean, boolean, number][] = [
            [keyPressed.up, keyPressed.left, 0.5],
            [keyPressed.up, keyPressed.right, 3.5],
            [keyPressed.down, keyPressed.left, 1.5],
            [keyPressed.down, keyPressed.right, 2.5],

            [keyPressed.up, true, 0],
            [keyPressed.left, true, 1],
            [keyPressed.down, true, 2],
            [keyPressed.right, true, 3],
        ]

        for(const [a, b, r] of bools){
            if(a === true && b === true){
                console.log(r)
                const angle = (-Math.PI * 2 * (r / 4)  + Math.PI / 2) + Math.PI
                const mag = 0.25
                player.physics.velocity.qx += Math.cos(angle) * mag
                player.physics.velocity.qy += Math.sin(angle) * mag
                break
            }
        }

        // const R = 0.5

        // if(player.physics.position.x < 0){
        //     player.physics.position.x = 0
        //     player.physics.velocity.x *= -R
        // }

        // if(player.physics.position.y < 0){
        //     player.physics.position.y = 0
        //     player.physics.velocity.y *= -R
        // }

        // if(player.physics.position.x > canvas.width){
        //     player.physics.position.x = canvas.width
        //     player.physics.velocity.x *= -R
        // }

        // if(player.physics.position.y > canvas.height){
        //     player.physics.position.y = canvas.height
        //     player.physics.velocity.y *= -R
        // }
        
        context.strokeStyle = "white"
        const offsetX = canvas.width / 2 - player.physics.smoothing.position.x
        const offsetY = canvas.height / 2 - player.physics.smoothing.position.y
        for(const id in game.physics.objects){
            const object = game.physics.objects[id]
            let x = object.smoothing.position.x
            let y = object.smoothing.position.y
            // if(player.physics === object){
            //     x = object.position.x
            //     y = object.position.y
            // }
            context.beginPath()
            context.moveTo(
                -player.physics.smoothing.position.x, 
                -player.physics.smoothing.position.y,
            )
            context.lineTo(x + offsetX, y + offsetY)
            context.stroke()
            context.beginPath()
            context.arc(
                x + offsetX, 
                y + offsetY, 
                object.radius, 0, Math.PI * 2)
            context.stroke()
        }
    }

    loop()
}