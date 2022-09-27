import { PipPipGame, Player } from "@pip-pip/game/src/logic/test";
import { defineComponent, onMounted, ref } from "vue";
import * as PIXI from "pixi.js"
import ship1 from "../assets/ship-1.png"
import { assets } from "../game/assets";

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST

function setup(){
    const container = ref()

    onMounted(() => {
        const game = new PipPipGame()
        const player = new Player("single")

        game.addPlayer(player)
        game.graphics.setContainer(container.value)
        
        game.renderTicker.on("tick", ({deltaMs}) => {
            game.graphics.app.render()
        })
    })

    return { container }
}

export default defineComponent({
    setup,
})