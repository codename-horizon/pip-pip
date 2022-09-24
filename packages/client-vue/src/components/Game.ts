import { PipPipGame, Player } from "@pip-pip/game/src/logic/test";
import { defineComponent, onMounted, ref } from "vue";
import * as PIXI from "pixi.js"
import ship1 from "../assets/ship-1.png"
import { assets } from "../game/assets";

function setup(){
    const container = ref()

    onMounted(() => {
        const game = new PipPipGame()
        const player = new Player("single")

        game.addPlayer(player)
        game.graphics.setContainer(container.value)
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST

        const test = async () => {
            const texture = await PIXI.Texture.from(assets["ship-1"])
            const sprite = new PIXI.Sprite(texture)
            const container = new PIXI.Container()
            sprite.anchor.x = 0.5
            sprite.anchor.y = 0.5
            sprite.scale.x = 10
            sprite.scale.y = 10

            container.addChild(sprite)
            container.position.y = 200
            container.position.x = 0
            game.graphics.viewport.addChild(container)

            game.renderTicker.on("tick", ({ deltaMs }) => {
                const C = (deltaMs / 16)
                sprite.rotation += 0.05 * C
                container.position.x += 1 * C
            })

            game.renderTicker.startTick()
        }

        game.renderTicker.on("tick", ({deltaMs}) => {
            game.graphics.app.render()
        })

        test()
    })

    return { container }
}

export default defineComponent({
    setup,
})