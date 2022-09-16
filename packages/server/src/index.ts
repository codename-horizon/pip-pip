import { ConnectionManager, NumberPacket, PacketManager, StringPacket } from "@pip-pip/core"
import { PipPipServer } from "@pip-pip/game"

const instance = new PipPipServer()
instance.start().then(() => {
    console.log(`Server started ${instance.options.port}`)
    // test()
})

// async function test(){
//     // const con = new GameConnectionManager({
//     //     host: "147.185.221.180",
//     //     port: 17294,
//     // })
//     const o = {
//         host: "localhost",
//         port: 3000,
//     }
//     const a = new ConnectionManager(o)

//     console.log(await a.authenticate())
//     console.log(await a.authenticate())
//     console.log(await a.getLobbies())
//     const lobby = await a.createLobby()
//     console.log(await a.getLobbyInfo(lobby.id))
//     await a.connect()
// }


const packetManager = new PacketManager({
    "name-update": new StringPacket("n"),
    "update-score": new NumberPacket("s"),
})


console.log(packetManager.encode("name-update", "mike"))
console.log(packetManager.encode("update-score", 0))
// console.log(packetManager.decode("amike"))