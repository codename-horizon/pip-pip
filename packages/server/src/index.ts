import { PipPipConnectionManager, PipPipServer } from "@pip-pip/game"

const instance = new PipPipServer()
instance.start().then(async () => {
    const connectionManager = new PipPipConnectionManager()
    await connectionManager.authenticate()
    await connectionManager.connect()
    await connectionManager.waitForReconciled()

    const lobby = await connectionManager.createLobby()
    console.log(lobby)
    log()

    const ping = await connectionManager.getPing()

    console.log(`ping: ${ping}ms`)

    const output = await connectionManager.testParrot("peekabooo")

    console.log(output)

    setTimeout(async () => {
        await connectionManager.ws?.close()
    }, 5000)
})

function log(){
    console.log(
        "connections", 
        Object.entries(instance.connections).map(([key, connection]) => `${key}:${connection.token}`),
        "wss", 
        Array.from(instance.wss.clients.values()).map(ws => ws.readyState))
}

instance.serverEvents.on("connectionDestroy", () => {
    log()
})

// instance.serverEvents.on("socketMessage", ({ data }) => { console.log(data) })

instance.serverEvents.on("socketClose", () => {
    console.log("connections", Object.keys(instance.connections))
    console.log("wss", Array.from(instance.wss.clients.values()).map(ws => ws.readyState))
})
