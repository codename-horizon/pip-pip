import { PipPipClient } from "@pip-pip/game/src/client"
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"

import "./styles/global.sass"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)

window.addEventListener("DOMContentLoaded", async () => {
    const client = new PipPipClient()
    await client.registerConnection()
    await client.connectSocket()
})