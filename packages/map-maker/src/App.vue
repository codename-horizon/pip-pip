<script lang="ts" src="./App.ts"></script>
<template lang="pug">
canvas(ref="canvas")
.overlay 
  button(@click="centerTiles") Center
  pre {{ {debug, camera} }}
</template>
