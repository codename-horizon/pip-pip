import { NibblerServer } from "@pip-pip/core";

class PipPip{
    nibbler: NibblerServer

    constructor(port = 3000){
        this.nibbler = new NibblerServer({ port })

        this.nibbler.app.get("/", (req, res) => {
            res.json({ok: true})
        })

        this.nibbler.start().then(() => {
            console.log(`NibblerServer started in port ${port}`)
        })
    }
}

new PipPip(3000)