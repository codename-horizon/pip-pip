<script setup lang="ts">
import { PipPipGamePhase } from '@pip-pip/game/src/logic';
import { GAME_CONTEXT } from '../game';
import GameButton from './GameButton.vue';
import GameInput from './GameInput.vue';
import GameChat from './GameChat.vue';
import { computed, ComputedRef, ref, watch } from 'vue';

function startGame(){
  GAME_CONTEXT.startGame()
}

type SetupTab = {
  id: string,
  name: string,
  show?: ComputedRef<boolean>,
}

const baseTabs: SetupTab[] = []

baseTabs.push({
  id: "host",
  name: "Host",
  show: computed(() => GAME_CONTEXT.store.isHost)
})

baseTabs.push({
  id: "players",
  name: "Players",
})

const displayTabs = computed(() => baseTabs.filter(tab => {
  if(typeof tab.show === "undefined") return true
  return tab.show.value
}))

const displayTabIndex = ref(0)
watch(displayTabs, () => {
  displayTabIndex.value = 0
}, { deep: true })

const displayTab = computed(() => {
  let index = displayTabIndex.value < displayTabs.value.length ? displayTabIndex.value : 0
  return displayTabs.value[index]
})

</script>

<template>
<div class="game-overlay">
  <div class="overlay-container">
    <div class="setup-container">

      <div class="setup-tabs-nav">
        <div 
          class="setup-tab-nav" 
          :class="displayTabIndex === index ? 'active' : ''"
          v-for="(tab, index) of displayTabs"
          @click="displayTabIndex = index">{{ tab.name }}</div>
      </div>
      
      <div class="setup-tab" v-if="displayTab.id === 'host'">
        <GameButton @click="startGame" v-if="GAME_CONTEXT.store.isHost">Start Game</GameButton>
      </div>
      
      <div class="setup-tab" v-if="displayTab.id === 'players'">
        <pre>this should show a list of players</pre>
      </div>

    </div>
    <GameChat></GameChat>
  </div>
</div>
</template>

<style lang="sass" scoped>
@import "../styles/_variables"

.overlay-container
  position: absolute
  inset: $screen-margin-dynamic
  display: flex
  flex-direction: column
  .game-chat
    flex-grow: 0
    flex-shrink: 0

  .setup-container
    flex-grow: 1
    flex-shrink: 1
    overflow: auto

    .setup-tabs-nav
      display: flex
      gap: 1.5em
      padding-bottom: 0.8em
      .setup-tab-nav
        font-size: 3em
        cursor: pointer
        transition: all 0.1s
        &.active
          color: $color-main

        &:not(.active):hover
          color: $color-accent
          transform: translateY(-3px)
    
</style>