<script setup lang="ts">
import { useGameStore } from '../game/store';

const gameStore = useGameStore()
</script>

<template>
<div class="overlay">hello there

  <pre>{{ Object.keys(gameStore.getContext()?.game.players || {}) }}</pre>
</div>
</template>

<style lang="sass" scoped>
</style>