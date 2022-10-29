<script setup lang="ts">
import type { PropType } from 'vue'
import type { ChatMessage } from '../game/chat'

const props = defineProps({
  message: Object as PropType<ChatMessage>,
})

</script>

<template lang="pug">
.game-chat-message
  template(v-for="part of props.message.text") 
    span.text(:class="part.style || ''") {{ part.text }}
</template>

<style lang="sass" scoped>
@import "../styles/_variables"

.game-chat-message
  span
    display: inline-block
    &.space
      width: 0.25em
    &.player
      color: $color-main
    &.info
      color: blue
    &.bad
      color: red
    &.good
      color: green

</style>