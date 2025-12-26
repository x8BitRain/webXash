<template>
  <div class="window no-resize" name="Games">
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
  import { useXashStore } from '/@/stores/store';
  import { storeToRefs } from 'pinia';
  import { type Enumify } from '/@/types.ts';
  import { onMounted } from 'vue';
  import { GAME_SETTINGS } from '/@/services/xash-loader.ts';

  const store = useXashStore();

  const { selectedGame, selectedGameKey } = storeToRefs(store);

  // Methods

  const onSelectGame = (game: Enumify<typeof GAME_SETTINGS>): void => {
    window.scriptDir = game.publicDir;
    // Find the key for this game
    const gameKey = Object.keys(GAME_SETTINGS).find(
      (key) => GAME_SETTINGS[key as keyof typeof GAME_SETTINGS].name === game.name
    ) as keyof typeof GAME_SETTINGS;

    if (gameKey) {
      selectedGameKey.value = gameKey;
    }
  };

  // Hooks

  onMounted(() => {
    window.scriptDir = selectedGame.value.publicDir;
  });
</script>

<style scoped lang="scss"></style>
