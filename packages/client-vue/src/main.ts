import { createApp } from "vue"
import { createPinia } from "pinia"

import App from "./App.vue"
import { router } from "./router"

import "./styles/global.sass"
import { BASE_MAPS } from "@pip-pip/game/src/maps"

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount("#app")

console.log(BASE_MAPS.test())