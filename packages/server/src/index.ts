import { PipPipClient, PipPipServer } from "@pip-pip/game"

const server = new PipPipServer(3000)

async function run(){
    await server.start()

    const client = new PipPipClient()
    await client.registerConnection()
    await client.connectSocket()

    setTimeout(async() => {
        client.closeSocket()
    }, 5000)
}

const eventNames = [
    "socketOpen", 
    "socketClose",
    "destroyConnection",
    "registerConnection",
    "start",
]

eventNames.forEach(eventName => server.serverEvents.on(eventName as any, () => {
    console.log(Object.entries(server.connections).map(([key, con]) => [key, con.token].join(":")))
}))

run()