<template>
  <div class="window" name="Games">
    <div class="box inset">
      <p
        v-for="game in Object.values(GAME_SETTINGS)"
        :key="game.name"
        class="menu-item"
        :class="{ 'menu-item--selected': selectedGame.name === game.name }"
        @click="onSelectGame(game)"
      >
        {{ game.name }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { GAME_SETTINGS, useXashStore } from '/@/stores/store';
  import { storeToRefs } from 'pinia';
  import { type Enumify } from '/@/types.ts';
  import { onMounted } from 'vue';

  const store = useXashStore();

  const { selectedGame } = storeToRefs(store);

  // Methods

  const onSelectGame = (game: Enumify<typeof GAME_SETTINGS>): void => {
    window.scriptDir = game.publicDir;
    selectedGame.value = game;
  };

  // Hooks

  onMounted(() => {
    window.scriptDir = selectedGame.value.publicDir;
  });
</script>

<style scoped lang="scss"></style>
