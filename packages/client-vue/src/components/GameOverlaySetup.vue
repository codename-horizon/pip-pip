<script setup lang="ts">
import { PipPipGamePhase } from '@pip-pip/game/src/logic';
import { GAME_CONTEXT } from '../game';
import { sendGamePhase } from '../game/client';
import { useGameStore } from '../game/store';
import GameButton from './GameButton.vue';

function start(){
  GAME_CONTEXT.sendGamePhase(PipPipGamePhase.COUNTDOWN)
}


</script>

<template>
<div class="overlay">hello there
<GameButton @click="start" v-if="GAME_CONTEXT.store.isHost">start game</GameButton>
</div>
</template>

<style lang="sass" scoped>
</style>