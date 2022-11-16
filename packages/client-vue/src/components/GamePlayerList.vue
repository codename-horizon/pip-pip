<script setup lang="ts">
import { computed } from 'vue';
import { GAME_CONTEXT } from '../game';
import { GameStorePlayer } from '../game/store';

function getPlayerListPriority(player: GameStorePlayer) {
  let score = 0
  if(player.isClient) score = 10000
  if(player.isHost) score = 1000
  score += player.score.kills
  if(player.idle) score -= 100
  return score
}

const players = computed(() => GAME_CONTEXT.store.players.sort((a, b) => {
  const A = getPlayerListPriority(a)
  const B = getPlayerListPriority(b)
  return B - A
}))

function getRowClass(player: GameStorePlayer): string {
  let classes = []
  if(player.isHost) classes.push("host")
  if(player.isClient) classes.push("client")
  if(player.idle) classes.push("idle")
  return classes.join(" ")
}

function getRowTags(player: GameStorePlayer): string[] {
  let tags = []
  if(player.isClient) tags.push("You")
  if(player.isHost) tags.push("Host")
  return tags
}
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
      :class="getRowClass(player)" 
      v-for="player in players">
      <td class="ping">{{ player.idle ? "DC" : `${player.ping}ms` }}</td>
      <td class="name">
        <span class="text">{{ player.name }}</span> 
        <span class="tag" 
          :class="tag.toLowerCase()"
          v-for="tag in getRowTags(player)">{{tag}}</span>
      </td>
      <td class="ship" :class="player.shipType.id">{{ player.shipType.name }}</td>
      <th class="damage">{{ player.score.damage }}</th>
      <th class="kills">{{ player.score.kills }}</th>
      <th class="deaths">{{ player.score.deaths }}</th>
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
        color: rgba(255, 255, 255, 0.5) !important
      &.client
        color: $color-accent

      td.name
        .text
          vertical-align: middle
          display: inline-block
        .tag
          vertical-align: middle
          display: inline-block
          margin-left: 0.4em
          font-size: 0.7em
          text-transform: uppercase
          padding: 0.025em 0.2em
          border-radius: 3px
          line-height: 1em
          color: white
          background-color: transparentize($color-main, 0.5)
          &.you
            background-color: transparentize($color-accent, 0.5)
</style>