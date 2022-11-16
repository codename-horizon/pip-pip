import * as PIXI from "pixi.js"
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST

import { createApp } from "vue"
import { createPinia } from "pinia"

import App from "./App.vue"
import { router } from "./router"

import "./styles/global.sass"
import { GAME_CONTEXT } from "./game"

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

GAME_CONTEXT.initialize()

app.mount("#app")
