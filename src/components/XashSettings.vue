<template>
  <div class="xash-settings">
    <div class="xash-menu-flex" v-if="!loading">
      <XashGames />
      <XashZips v-if="selectedGame.name === GAME_SETTINGS.HL.name" />
      <XashLoadDirectory />
      <XashLoadZip />
      <XashLaunchOptions />
      <XashStart />
      <Attribution />
      <!-- Spacer for Flex layout -->
      <br />
      <br />
      <!-- Spacer for Flex layout -->
      <XashSaves />
    </div>
    <XashLoading v-if="loading" />
  </div>
</template>

<script setup lang="ts">
  import { GAME_SETTINGS, useXashStore } from '/@/stores/store';
  import { storeToRefs } from 'pinia';
  import XashZips from './XashZips.vue';
  import XashStart from '/@/components/XashStart.vue';
  import XashLoading from '/@/components/XashLoading.vue';
  import XashLaunchOptions from '/@/components/XashLaunchOptions.vue';
  import Attribution from '/@/components/Attribution.vue';
  import XashLoadZip from '/@/components/XashLoadZip.vue';
  import XashLoadDirectory from '/@/components/XashLoadDirectory.vue';
  import XashGames from '/@/components/XashGames.vue';
  import XashSaves from '/@/components/XashSaves.vue';

  const store = useXashStore();
  const { loading, selectedGame } = storeToRefs(store);
</script>

<style scoped lang="scss">
  .xash-settings {
    width: 90%;
    position: absolute;
    display: flex;
    flex-wrap: wrap;
    overflow: hidden;
    margin: 10px;
    flex-direction: column;
    z-index: 10;
  }

  .xash-menu-flex {
    height: 100vh;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: start;
    align-items: start;
    align-content: flex-start;
    overflow: hidden;
  }
</style>
