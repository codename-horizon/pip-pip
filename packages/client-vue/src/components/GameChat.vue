<script setup lang="ts">
import { computed, ref } from 'vue';
import { GAME_CONTEXT } from '../game';
import { GAME_COMMANDS, MESSAGE_ERROR_COMMAND_404 } from '../game/chat';
import GameButton from './GameButton.vue';
import GameInput from './GameInput.vue';
import GameChatMessage from './GameChatMessage.vue';

const chatMessage = ref("")

function sendMessage(){
  const message = chatMessage.value.trim()
  if(message.startsWith("/")){
    const [command, ...inputs] = message.toLowerCase().substring(1).split(/\s+/gmi)
    const chatCommand = GAME_COMMANDS.find(chatCommand => chatCommand.command === command)
    if(typeof chatCommand === "undefined"){
        GAME_CONTEXT.store.chatMessages.push(MESSAGE_ERROR_COMMAND_404)
    } else{
      const response = chatCommand.callback(message, inputs)
      if(typeof response !== "undefined"){
        GAME_CONTEXT.store.chatMessages.push(response)
      }
    }
  }
  chatMessage.value = ""
}

function restoreLastMessage(){
  //
}

const chatMessages = computed(() => GAME_CONTEXT.store.chatMessages.slice(-20))

</script>

<template lang="pug">
.game-chat
  .game-chat-messages
    GameChatMessage(v-for="message in chatMessages" :message="message")
  GameInput(
    v-model="chatMessage"
    @enter="sendMessage"
    @up="restoreLastMessage"
    placeholder="Chat or use /command")
</template>

<style lang="sass" scoped>
</style>