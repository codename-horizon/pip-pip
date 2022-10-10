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
    assetLoader.loadBundle([
      "ui",
      "ships",
    ], progress => {
      uiStore.body = `Downloaded ${Math.floor(progress * 100)}% of assets...`
    })
  } catch(e){
    alert("Could not load assets :(")
    console.warn(e)
  }
  uiStore.loading = false
  loadedAssets.value = true
})
</script>

<template>
  <RouterView v-if="loadedAssets"/>
  <GameLoading/>
</template>

<style scoped>
</style>
