<script setup lang="ts">
import { PipPipGamePhase } from '@pip-pip/game/src/logic';
import { gameContext } from '../game';
import { sendGamePhase } from '../game/client';
import { useGameStore } from '../game/store';
import GameButton from './GameButton.vue';

const gameStore = useGameStore()

function start(){
  sendGamePhase(PipPipGamePhase.COUNTDOWN)
}

</script>

<template>
<div class="overlay">hello there
<GameButton @click="start" v-if="gameStore.isHost">start game</GameButton>
</div>
</template>

<style lang="sass" scoped>
</style>