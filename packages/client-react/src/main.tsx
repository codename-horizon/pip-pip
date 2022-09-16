

import { PipPipConnectionManager } from "@pip-pip/game/src/client"
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)


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

    console.log(await a.authenticate())
    console.log(await a.getLobbies())
    const lobby = await a.createLobby()
    console.log(await a.getLobbyInfo(lobby.id))
    await a.connect()
    console.log(a.ws?.readyState, a.ws)
    a.socketSendMessage("tits")
}

test()