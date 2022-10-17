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
  <GameOverlaySetup></GameOverlaySetup>
  <div id="game-countdown" class="overlay" v-if="GAME_CONTEXT.store.isPhaseCountdown">
    Starting in {{ Number(GAME_CONTEXT.store.countdownMs / 1000).toFixed(2) }} seconds
  </div>
  <div id="game-container" ref="container"></div>
</template>

<style lang="sass" scoped>
  .overlay
    position: fixed
    bottom: 0
    left: 0
    z-index: 100

  #game-countdown
    inset: 0
    display: grid
    align-items: center
    justify-items: center
    font-size: 2em
    background-color: rgba(0, 0, 0, 0.5)

  #game-container
    position: fixed
    inset: 0
    width: 100%
    height: 100%
</style>