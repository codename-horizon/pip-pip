import { GameServer, GameStateData, GameWorld, GameWorldOptions } from "@pip-pip/core"
import { LobbyWorld } from "@pip-pip/game"

class PipPip{
    gameServer: GameServer

    constructor(port = 3000){
        this.gameServer = new GameServer({ port })

        this.gameServer.app.get("/", (req, res) => {
            res.json({ok: true})
        })

        this.gameServer.start().then(() => {
            console.log(`NibblerServer started in port ${port}`)
        })
    }
}

new PipPip(3000)

// const a = new GameStateData<number, string>(0, {
//     serialize: n => "num-" + n.toString(),
//     deserialize: s => Number(s.substring(3)),
// })
// a.subscribe(() => {
//     console.log(a.get(), a.getSerialized())
// })

// setInterval(() => {
//     a.set((n) => n + 1)
// }, 1000)

type PlayerRecord = Record<string, number>

type TestWorldGameState = {
    gameMode: GameStateData<string>,
    players: GameStateData<PlayerRecord>,
}

class TestWorld extends GameWorld<TestWorldGameState>{
    constructor(options: Partial<GameWorldOptions> = {}){
        super(options)

        this.setGameState({
            gameMode: new GameStateData("lobby"),
            players: new GameStateData<PlayerRecord>({}, {
                serialize: (value) => JSON.stringify(value),
                deserialize: (value) => JSON.parse(value),
            }),
        })
    }
}

const testWorld = new TestWorld()

console.log(testWorld)

testWorld.state.players.subscribe(() => {
    console.log(testWorld.getSerializedState())
})

testWorld.state.players.set((record) => ({
    ...record,
    mike: 0,
}))

testWorld.state.players.set((record) => ({
    ...record,
    mike: record.mike + 1,
}))

testWorld.state.players.set((record) => {
    const copy = {...record}
    delete copy.mike
    return copy
})