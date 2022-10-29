<script setup lang="ts">
import { computed } from 'vue';
import { GAME_CONTEXT } from '../game';
import GameButton from './GameButton.vue';
import GameChat from './GameChat.vue';

const time = computed(() => {
  const t = GAME_CONTEXT.store.countdownMs
  return (t/1000).toFixed(2)
})

</script>

<template>
<div class="game-overlay">
  <div class="blackout">
    <div class="center">
      <div class="text">Game starts in</div>
      <div class="time">{{time}}</div>
    </div>
  </div>
  <GameChat></GameChat>
</div>
</template>

<style lang="sass" scoped>
@import "../styles/_variables"
.blackout
  position: absolute
  inset: 0
  background-color: rgba(0, 0, 0, 0.5)

  display: grid
  align-items: center
  justify-items: center

  .center
    text-align: center
    .text
      font-size: 2em
    .time
      font-size: 3em
      animation: zoom 200ms alternate infinite ease-in-out
      color: $color-main
  
.game-chat
  position: absolute
  bottom: $screen-margin-dynamic
  left: $screen-margin-dynamic
  width: 100% - $screen-margin-dynamic * 2

</style>