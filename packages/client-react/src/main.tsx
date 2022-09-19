import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { connection } from "./game"

import "./styles/global.sass"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)

window.addEventListener("DOMContentLoaded", async () => {
    await connection.authenticate()
    await connection.connect()

    connection.managerEvents.on("socketReady", () => {
        setInterval(() => {
            connection.sendPacket([
                connection.packetManager.encode("ping", Date.now())
            ])
        }, 1000/20)
    })

    connection.packetEvents.on("ping", ({ value }) => {
        console.log(`PING: ${Date.now() - value}ms`)
    })

})