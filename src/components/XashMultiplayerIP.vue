<template>
  <div class="window no-resize" name="Multiplayer IP">
    <div class="multiplayer-ip-wrapper">
      <label for="multiplayer-ip-input"></label>
      <input id="multiplayer-ip-input" v-model="multiplayerIP" type="text" placeholder="127.0.0.1:27016" />
      <InfoIcon @click="openIpHelp" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { storeToRefs } from 'pinia';
  import { useXashStore } from '/@/stores/store.ts';
  import InfoIcon from './InfoIcon.vue';

  // Data

  const store = useXashStore();
  const { multiplayerIP } = storeToRefs(store);

  // Methods

  const openIpHelp = () => {
    window.open(
      'https://github.com/x8BitRain/webXash?tab=readme-ov-file#save-manager',
      '_blank',
    );
  };
</script>

<style scoped lang="scss">
  .multiplayer-ip-wrapper {
    display: flex;
    align-items: center;

    #multiplayer-ip-input {
      width: 100%;
    }
  }
</style>
