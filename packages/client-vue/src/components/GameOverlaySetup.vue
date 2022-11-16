<script setup lang="ts">
import { PipPipGamePhase } from '@pip-pip/game/src/logic';
import { GAME_CONTEXT } from '../game';
import GameButton from './GameButton.vue';
import GamePlayerList from './GamePlayerList.vue';
import GameInput from './GameInput.vue';
import GameChat from './GameChat.vue';
import { computed, ComputedRef, Ref, ref, watch } from 'vue';

function startGame(){
  GAME_CONTEXT.startGame()
}

type SetupTab = {
  id: string,
  name: string,
  notifCount?: ComputedRef<string>,
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
  notifCount: computed(() => GAME_CONTEXT.store.players.length.toString()),
})

const displayTabs = computed(() => baseTabs.filter(tab => {
  if(typeof tab.show === "undefined") return true
  return tab.show.value
}))

const displayTabIndex = ref(0)
watch(computed(() => displayTabs.value.length), () => {
  displayTabIndex.value = 0
})

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
          @click="displayTabIndex = index">
            <div class="text">{{ tab.name }}</div>
            <div class="notif" v-if="typeof tab.notifCount !== 'undefined'">{{tab.notifCount.value}}</div>
          </div>
      </div>
      
      <div class="setup-tab" v-if="displayTab.id === 'host'">
        <GameButton @click="startGame" v-if="GAME_CONTEXT.store.isHost">Start Game</GameButton>
      </div>
      
      <div class="setup-tab players" v-if="displayTab.id === 'players'">
        <GamePlayerList></GamePlayerList>
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
  gap: 2em
  .game-chat
    flex-grow: 0
    flex-shrink: 0

  .setup-container
    flex-grow: 1
    flex-shrink: 1
    overflow: auto
    display: flex
    flex-direction: column

    .setup-tabs-nav
      overflow: auto
      flex-grow: 0
      flex-shrink: 0
      display: flex
      gap: 1.5em
      padding-bottom: 0.8em
      .setup-tab-nav
        cursor: pointer
        transition: all 0.1s
        .text
          font-size: 3em
          display: inline-block
        .notif
          display: inline-block
          vertical-align: top
          top: 0.5em
          margin-left: 0.2em
          background-color: $color-bad
          color: white
          font-size: 1.5em
          padding: 0.1em 0.2em
          border-radius: $border-radius
        &.active
          color: $color-main

        &:not(.active):hover
          color: $color-accent
          transform: translateY(-3px)
    .setup-tab
      flex-grow: 1
      flex-shrink: 1
      display: grid
      justify-items: center
      align-items: center

      &.players > *
        width: 100%
        
    
</style>