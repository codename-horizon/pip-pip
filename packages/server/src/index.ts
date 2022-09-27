import { PipPipClient, PipPipServer } from "@pip-pip/game"

const server = new PipPipServer()

async function run(){
    await server.start()

    // const client = new PipPipClient()
    // await client.registerConnection()
    // await client.connectSocket()

    // const message = client.packetManager.group([
    //     client.packetManager.encode("player-move", "hi!"),
    //     client.packetManager.encode("player-move", "hi!"),
    //     client.packetManager.encode("player-move", "hi!"),
    // ])

    // client.sendSocketData(message)

    // setTimeout(async() => {
    //     client.closeSocket()
    // }, 5000)
}

run()