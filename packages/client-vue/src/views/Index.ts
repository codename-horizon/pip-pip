import GameButton from "../components/GameButton.vue"

import { defineComponent, onMounted } from "vue"
import { useGameStore } from "../game/store"


export default defineComponent({
    components: {
        GameButton,
    },
    setup(props, ctx) {
        const gameStore = useGameStore()

        const test = () => {
            console.log("clicked")
        }

        return {
            test,
        }
    },
})