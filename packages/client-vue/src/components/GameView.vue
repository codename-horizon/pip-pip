<script src="./GameView" lang="ts"></script>

<template>
  <div id="game-setup" class="overlay" v-if="uiContext.isPhaseSetup">
    hello whats up??
    <GameButton v-if="uiContext.isHost" @click="startGame">Start Game</GameButton>
    <GameButton @click="() => setShip(0)">Blu</GameButton>
    <GameButton @click="() => setShip(1)">Red</GameButton>
  </div>
  <div id="game-countdown" class="overlay" v-if="uiContext.isPhaseCountdown">
    Starting in {{ uiContext.gameCountdownMs }}...
  </div>
  <div id="game-container" ref="container"></div>
</template>

<style lang="sass" scoped>
  .overlay
    position: fixed
    bottom: 0
    left: 0
    z-index: 100

  #game-container
    position: fixed
    inset: 0
    width: 100%
    height: 100%
</style>