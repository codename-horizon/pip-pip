import { createApp } from 'vue'

import './styles/global.sass'
import App from './App.vue'
import { router } from './router'
import { Client } from '@pip-pip/core/src/client'
import { packetManager } from '@pip-pip/game/src/networking/packets'

const app = createApp(App)
app.use(router)
app.mount('#app')


const client = new Client(packetManager)

async function run(){
    await client.connect()
}

run()