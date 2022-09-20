<script setup lang="ts">
import { onMounted } from 'vue';
import { test } from '../game/instance';

onMounted(() => {
  test()
})

</script>

<template>
  <canvas id="canvas"></canvas>
</template>

<style scoped>
</style>
