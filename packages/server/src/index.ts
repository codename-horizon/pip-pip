import { PipPipConnectionManager, PipPipServer } from "@pip-pip/game"

const instance = new PipPipServer()

instance.packetEvents.on("ping", ({value, ws}) => {
    console.log("i received it on the server", value)
    const message = instance.packetManager.group([
        instance.packetManager.encode("ping", 200)
    ])
    console.log("trying to send this to client", message)
    ws.send(message)
})

instance.start().then(() => {
    console.log(`Server started ${instance.options.port}`)
    test()
})

async function test(){
    // const con = new GameConnectionManager({
    //     host: "147.185.221.180",
    //     port: 17294,
    // })
    const o = {
        host: "localhost",
        port: 3000,
    }
    const a = new PipPipConnectionManager(o)

    console.log(a.isAuthenticated, a.isConnected, a.isReconciled)
    console.log(await a.authenticate())
    console.log(a.isAuthenticated, a.isConnected, a.isReconciled)
    console.log(await a.authenticate())
    console.log(a.isAuthenticated, a.isConnected, a.isReconciled)
    console.log(await a.getLobbies())
    console.log(a.isAuthenticated, a.isConnected, a.isReconciled)
    const lobby = await a.createLobby()
    console.log(await a.getLobbyInfo(lobby.id))
    await a.connect()

    console.log(a.isConnected, a.isReconciled)

    a.packetEvents.on("ping", ({value}) => {
        console.log("i got it from the server!", value)
    })

    a.packetEvents.on("heartbeat", () =>{
        console.log("heartbeat")
    })

    a.sendPacket(a.packetManager.encode("ping", 100))
}