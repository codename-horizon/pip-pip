import { PipPipClient, PipPipServer, World } from "@pip-pip/game"

const server = new PipPipServer()

async function run(){
    await server.start()

    const client = new PipPipClient()
    const connection = await client.registerConnection()
    console.log(connection)
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


const world = new World()

world.addNewPlayer()
console.log(world.players[0].getState())
world.players[0].setState(player => ({
    ...player,
    angle: Math.PI,
}))

world.state.set("gameMode", "hi")