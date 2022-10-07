<script setup lang="ts">
import GameButton from "../components/GameButton.vue"

import { defineComponent, onMounted } from "vue"
import { useGameStore } from "../game/store"
const gameStore = useGameStore()

const test = () => {
    console.log("clicked")
}

</script>
<template lang="pug">
.center-container
    .content-container
        .header
            img.logo(src="../assets/logo.png")
            .caption ALPHA by Meg&amp;Mike

        .buttons
            GameButton(@click="test") Host Game 
            GameButton(@click="test") Join Game 
            GameButton.accent(@click="test") Settings
            GameButton.accent(@click="test") Credits
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