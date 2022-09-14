import { GameServer } from "@pip-pip/core";

const gameServer = new GameServer()

gameServer.start().then(() => {
    console.log("Server started")
})