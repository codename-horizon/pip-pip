import { EventCollector } from "@pip-pip/core/src/common/events"
import { Client } from "@pip-pip/core/src/networking/client"
import { packetManager } from "@pip-pip/game/src/networking/packets"

export const client = new Client(packetManager, {
    host: window.location.hostname,
    port: 3000,
})

export const clientEvents = new EventCollector(client.events)