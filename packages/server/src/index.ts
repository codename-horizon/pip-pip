import { GameServer } from "@pip-pip/core";

const gameServer = new GameServer()

gameServer.app.get("/test", (req, res) => {
    res.json({ok: true})
})

gameServer.start().then(() => {
    console.log("Server started")
})