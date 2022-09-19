import { PipPipClient, PipPipServer } from "@pip-pip/game"

const server = new PipPipServer(3000)

async function run(){
    await server.start()

    const client = new PipPipClient()
    await client.registerConnection()
}

run()