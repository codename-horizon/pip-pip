<script setup lang="ts">
import { computed } from 'vue';
import { GAME_CONTEXT } from '../game';

const players = computed(() => GAME_CONTEXT.store.players)
</script>

<template>
<div class="player-list">
  <table>
    <tr class="row-header">
      <th class="ping">Ping</th>
      <th class="name">Name</th>
      <th class="ship">Ship</th>
      <th class="damage">Damage</th>
      <th class="kills">Kills</th>
      <th class="deaths">Deaths</th>
      <th class="wins">Wins</th>
    </tr>
    <tr 
      class="row-player" 
      :class="player.idle ? 'idle' : ''" 
      v-for="player in players">
      <td class="ping">{{ player.idle ? "DC" : `${player.ping}ms` }}</td>
      <td class="name">{{ player.name + (
        player.isHost ? " (Host)" : ""
      ) }}</td>
      <td class="ship" :class="player.shipType.id">{{ player.shipType.name }}</td>
      <th class="deaths">{{ player.score.deaths }}</th>
      <th class="kills">{{ player.score.kills }}</th>
      <th class="damage">{{ player.score.damage }}</th>
      <th class="wins">{{ 0 }}</th>
    </tr>
  </table>
</div>
</template>

<style lang="sass" scoped>
@import "../styles/_variables"

.player-list
  font-size: 1.4em
  table
    width: 100%
    max-width: 30em
    margin: auto
    border-collapse: collapse
    td
      white-space: nowrap
      text-overflow: ellipsis
      overflow: hidden
    td, th
      padding: 0.2em 0.5em
      &.ping
        text-align: right
        width: 3em
      &.damage, &.kills, &.deaths, &.wins
        text-align: center
        width: 2em
      &.name, &.ship
        text-align: left
      &.ship
        max-width: 2em
      &.name
        max-width: 5em
    tr.row-header
      color: $color-main
    tr.row-player
      border-top: 1px solid rgba(255, 255, 255, 0.1)
      &.idle *
        color: $color-bad !important
</style>