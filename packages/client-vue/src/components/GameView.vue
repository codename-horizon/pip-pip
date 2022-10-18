<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue"

import GameOverlaySetup from "./GameOverlaySetup.vue"
import { GAME_CONTEXT } from "../game"

const container = ref<HTMLDivElement>()

onMounted(() => {
    if(typeof container.value === "undefined") throw new Error("Container not available.")
    GAME_CONTEXT.mountGameView(container.value)
})

onUnmounted(() => {
    GAME_CONTEXT.unmountGameView()
    GAME_CONTEXT.client.disconnect()
})
        
</script>
<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<template>
  <GameOverlaySetup v-if="GAME_CONTEXT.store.isPhaseSetup || true"></GameOverlaySetup>
  <div id="game-countdown" class="overlay" v-if="GAME_CONTEXT.store.isPhaseCountdown">
    Starting in {{ Number(GAME_CONTEXT.store.countdownMs / 1000).toFixed(2) }} seconds
  </div>
  <div id="game-container" ref="container"></div>
</template>

<style lang="sass" scoped>
</style>