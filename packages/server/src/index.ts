import { GameServer, GameStateData } from "@pip-pip/core";
import { LobbyWorld } from "@pip-pip/game";

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

const a = new GameStateData<number, string>(0, {
    serialize: n => "num-" + n.toString(),
    deserialize: s => Number(s.substring(3)),
})
a.subscribe(console.log)
setInterval(() => {
    a.set((n) => n + 1)
}, 1000)