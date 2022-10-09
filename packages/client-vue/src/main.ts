import { createApp } from "vue"
import { createPinia } from "pinia"

import App from "./App.vue"
import { router } from "./router"

import "./styles/global.sass"
import { BluShip } from "@pip-pip/game/src/logic/ship"

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount("#app")



console.log(new BluShip(null as any, "baby-blu"))