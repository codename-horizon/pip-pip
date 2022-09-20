import { PipPipClient, PipPipServer } from "@pip-pip/game"

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

import { State } from "@pip-pip/core/src/state"
import { PickRecord } from "@pip-pip/core/src/lib/types"

type Vector2 = { x: number, y: number }

type Schema = {
    gameMode: string,
    playerNames: string[],
    playerPositions: Record<string, Vector2>,
}

const state = new State<Schema>({
    gameMode: "test",
    playerNames: [],
    playerPositions: {},
})

state.events.on("change", (snapshot) => console.log(snapshot.changes))

state.set("gameMode", "nice")
state.set("gameMode", (value) => value + "k")
state.set("playerNames", (arr) => ([...arr, "nice"]))
state.set("playerPositions", (pos) => {
    return {
        ...pos,
        hello: { x: 0, y: 0 }
    }
})
state.set("playerPositions", (pos) => ({
    ...pos,
    hello: { x: 100, y: 0 }
}))

state.setRecord("playerPositions", "hehe", {
    x: 0, y: 0,
})

state.setRecord("playerPositions", "hi", { x: 69, y: 69 })

state.setRecord("playerPositions", "hi", (vec) => ({...vec, x: 100}))


