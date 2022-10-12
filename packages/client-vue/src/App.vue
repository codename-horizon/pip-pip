<script setup lang="ts">
import { onMounted, ref } from 'vue';
import GameLoading from './components/GameLoading.vue';
import { assetLoader } from './game/assets';
import { useUiStore } from './store/ui';

const loadedAssets = ref(false)
const uiStore = useUiStore()

onMounted(async () => {
  uiStore.loading = true
  uiStore.body = "Loading assets..."
  try{
    await assetLoader.loadBundle([
      "ui",
      "ships",
      "misc",
    ], progress => {
      uiStore.body = `Downloaded ${Math.floor(progress * 100)}% of assets...`
    })
    loadedAssets.value = true
  } catch(e){
    alert("Could not load assets :(")
    console.warn(e)
  }
  uiStore.loading = false
})
</script>

<template>
  <RouterView v-if="loadedAssets"/>
  <GameLoading/>
</template>

<style scoped>
</style>
