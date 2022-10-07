import { RouterOptions } from "vue-router"

import Index from "../views/Index.vue"

export const routes: RouterOptions["routes"] = [
    {
        path: "/",
        component: Index,
    },
]