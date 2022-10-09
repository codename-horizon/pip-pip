<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { client } from '../game/client';
import { useUiStore } from '../store/ui';
import GameView from '../components/GameView.vue';

const router = useRouter()
const route = useRoute()
const uiStore = useUiStore()

const ready = ref(false)
const lobbyId = ref("")

onMounted(async () => {
    lobbyId.value = route.params.id as string

    uiStore.loading = true
    try{
        uiStore.body = "Connecting..."
        await client.connect()
        uiStore.body = "Joining lobby..."
        await client.joinLobby(lobbyId.value)
    } catch(e){
        console.warn(e)
        alert("Could not join lobby.")
        router.push({ name: "index" })
    }
    uiStore.loading = false

    ready.value = true
})
</script>
<template lang="pug">
GameView(v-if="ready" :lobbyId="lobbyId")
</template>

<style lang="sass" scoped>

</style>