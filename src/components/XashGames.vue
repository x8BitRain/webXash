<template>
  <div class="window" name="Games">
    <div class="box inset">
      <p
        v-for="game in Object.values(GAME_SETTINGS)"
        :key="game.name"
        class="menu-item"
        :class="{ 'menu-item--selected': selectedGame.name === game.name }"
        @click="selectedGame = game"
      >
        {{ game.name }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { GAME_SETTINGS, useXashStore } from '/@/stores/store';
  import { storeToRefs } from 'pinia';

  const store = useXashStore();

  const { selectedGame } = storeToRefs(store);
</script>

<style scoped lang="scss"></style>
