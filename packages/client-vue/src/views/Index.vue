<script setup lang="ts">
import GameButton from "../components/GameButton.vue"
import GameInput from "../components/GameInput.vue";

import { onMounted } from "vue"
import { useUiStore } from "../store/ui";
import { hostGame } from "../game"

const uiStore = useUiStore()

const notYetImplemented = () => {
    alert("That doesn't do anything yet.")
}

onMounted(() => {
    
})

</script>
<template lang="pug">
.center-container
    .content-container
        .header
            img.logo(src="../assets/logo.png")
            .caption ALPHA by Meg&amp;Mike

        .buttons
            GameButton(@click="hostGame") Host Game 
            GameInput
            GameButton(@click="notYetImplemented") Join Game 
            GameButton.accent(@click="notYetImplemented") Settings
            GameButton.accent(@click="notYetImplemented") Credits
</template>

<style lang="sass" scoped>
.header
    padding-bottom: 2em
    animation: wobble 1.5s infinite alternate ease-in-out
    .logo
        height: auto
    .caption
        margin-top: -0.5em
        text-align: center
        font-size: 1.6em
        

.buttons
    display: grid
    align-items: center
    justify-items: center
    gap: 0.2em
</style>