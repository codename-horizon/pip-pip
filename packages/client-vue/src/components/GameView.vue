<script src="./GameView" lang="ts"></script>

<template>
  <div id="game-setup" class="overlay" v-if="uiContext.isPhaseSetup">
    hello whats up??
    <GameButton v-if="uiContext.isHost" @click="startGame">Start Game</GameButton>

    <div v-if="typeof uiContext.clientPlayer !== 'undefined'">
      <h1>Current ship: {{ uiContext.clientPlayer.shipType.name }}</h1>
    </div>
    <GameButton v-for="(shipType, index) of PIP_SHIPS" @click="() => setShip(index)">{{ shipType.name }}</GameButton>
  </div>
  <div id="game-countdown" class="overlay" v-if="uiContext.isPhaseCountdown">
    Starting in {{ Number(uiContext.gameCountdownMs / 1000).toFixed(2) }} seconds
  </div>
  <div id="game-container" ref="container"></div>
</template>

<style lang="sass" scoped>
  .overlay
    position: fixed
    bottom: 0
    left: 0
    z-index: 100

  #game-countdown
    inset: 0
    display: grid
    align-items: center
    justify-items: center
    font-size: 2em
    background-color: rgba(0, 0, 0, 0.5)

  #game-container
    position: fixed
    inset: 0
    width: 100%
    height: 100%
</style>