import { BasePacket, BooleanPacket, ConnectionManager, LiteralArrayPacket, NumberPacket, PacketManager, StringPacket } from "@pip-pip/core"
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
    "game-start": new BasePacket("0"),
    "name-update": new StringPacket("n"),
    "update-score": new NumberPacket("s"),
    "locked": new BooleanPacket("k"),
    "randoms": new LiteralArrayPacket("r"),
})

const messages = [
    packetManager.code("game-start"),
    packetManager.encode("name-update", "mike"),
    packetManager.encode("update-score", 0),
    packetManager.encode("locked", false),
    packetManager.encode("randoms", ["hello there", "mike", 2]),
    packetManager.encode("randoms", ["ad2da2jo", Math.PI, Math.random() * 100, Math.random() * 100]),
    packetManager.encode("randoms", ["ad2da2jo", Math.PI, Math.random() * 100, Math.random() * 100]),
]

const grouped = packetManager.group(messages)
const decoded = packetManager.decodeGroup(grouped)

console.log(grouped, grouped.length, decoded)