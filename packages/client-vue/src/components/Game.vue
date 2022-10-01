<script src="./Game" lang="ts"></script>

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
</style>