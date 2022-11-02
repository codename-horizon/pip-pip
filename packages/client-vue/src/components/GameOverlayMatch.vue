<script setup lang="ts">
import { GAME_CONTEXT } from '../game';
import GameChat from './GameChat.vue';
import GamePlayerList from './GamePlayerList.vue';

</script>

<template>
<div class="game-overlay">
  <GamePlayerList v-if="GAME_CONTEXT.store.showPlayerList"></GamePlayerList>
  <pre>{{ GAME_CONTEXT.store.clientPlayerStats }}</pre>
  <GameChat></GameChat>
</div>
</template>

<style lang="sass" scoped>
@import "../styles/_variables"

.game-chat
  position: absolute
  bottom: $screen-margin-dynamic
  left: $screen-margin-dynamic
  width: 100% - $screen-margin-dynamic * 2

</style>