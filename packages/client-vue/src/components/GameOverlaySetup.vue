<script setup lang="ts">
import { PipPipGamePhase } from '@pip-pip/game/src/logic';
import { GAME_CONTEXT } from '../game';
import GameButton from './GameButton.vue';
import GameInput from './GameInput.vue';
import GameChat from './GameChat.vue';
import { ref } from 'vue';

function startGame(){
  GAME_CONTEXT.startGame()
}
</script>

<template>
<div class="game-overlay">
<GameChat></GameChat>
<GameButton @click="startGame" v-if="GAME_CONTEXT.store.isHost">start game</GameButton>
</div>
</template>

<style lang="sass" scoped>
</style>