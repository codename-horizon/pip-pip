<script setup lang="ts">
import { useUiStore } from '../store/ui';

const uiStore = useUiStore()

</script>
<template lang="pug">
.game-loading.center-container(v-if="uiStore.loading")
    .content-container
        .text {{ uiStore.body }}
</template>

<style lang="sass" scoped>
@import "../styles/_variables"

.game-loading
    background-color: transparentize($color-dark-2, 0.2)
    position: fixed
    z-index: 100
    inset: 0
    font-size: 1.6em
    .content-container
        animation: zoom 400ms alternate infinite ease-in-out
</style>