<script src="./GameView" lang="ts"></script>

<template>
  <pre id="debug">{{debugJson}}</pre>
  <div id="game-container" ref="container"></div>
</template>

<style lang="sass" scoped>
  #debug
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