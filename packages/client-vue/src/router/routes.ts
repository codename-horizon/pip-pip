import { RouterOptions } from "vue-router"

import Index from "../views/Index.vue"
import Game from "../views/Game.vue"

export const routes: RouterOptions["routes"] = [
    {
        name: "index",
        path: "/",
        component: Index,
    },
    {
        name: "game",
        path: "/:id",
        component: Game,
    }
]