import { RouterOptions } from "vue-router"

import Index from "../components/Game"

export const routes: RouterOptions["routes"] = [
    {
        path: "/",
        component: Index,
    },
]