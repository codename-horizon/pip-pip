<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue"

import GameOverlaySetup from "./GameOverlaySetup.vue"
import GameOverlayCountdown from "./GameOverlayCountdown.vue"
import { GAME_CONTEXT } from "../game"
import GamePlayerList from "./GamePlayerList.vue";
import GameOverlayMatch from "./GameOverlayMatch.vue";

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
    inheritAttrs: false,
    components: { GamePlayerList, GameOverlayMatch }
}
</script>

<template>
  <GameOverlaySetup v-if="GAME_CONTEXT.store.isPhaseSetup"></GameOverlaySetup>
  <GameOverlayCountdown v-if="GAME_CONTEXT.store.isPhaseCountdown"></GameOverlayCountdown>
  <GameOverlayMatch v-if="GAME_CONTEXT.store.isPhaseMatch"></GameOverlayMatch>
  <div id="game-container" ref="container"></div>
</template>

<style lang="sass" scoped>
</style>