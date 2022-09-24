import { PipPipGame, Player } from "@pip-pip/game/src/logic/test";
import { defineComponent, onMounted, ref } from "vue";
import * as PIXI from "pixi.js"

function setup(){
    const container = ref()

    onMounted(() => {
        const game = new PipPipGame()
        const player = new Player("single")

        game.addPlayer(player)
        game.graphics.setContainer(container.value)

        console.log(game)

        const test = async () => {
            const texture = await PIXI.Texture.from("https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Vg_graphics.svg/1024px-Vg_graphics.svg.png")
            const sprite = new PIXI.Sprite(texture)
            game.graphics.viewport.addChild(sprite)
            sprite.anchor.x = 0.5
            sprite.anchor.y = 0.5

            game.renderTicker.startTick()
        }


        game.renderTicker.on("tick", ({deltaMs}) => {
            console.log("nice?")
            game.graphics.app.stage.children.forEach(child => {
                child.rotation += 0.01
            })
            game.graphics.viewport.position.x += 5
            game.graphics.app.render()
        })

        test()
    })

    return { container }
}

export default defineComponent({
    setup,
})