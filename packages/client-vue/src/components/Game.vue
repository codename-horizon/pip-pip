<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { runGame } from '../game/instance';

const canvas = ref<HTMLCanvasElement>()

onMounted(() => {
  if(typeof canvas.value === "undefined") return
  runGame(canvas.value)
})

</script>

<template>
  <canvas id="canvas" ref="canvas"></canvas>
</template>

<style scoped>
</style>
