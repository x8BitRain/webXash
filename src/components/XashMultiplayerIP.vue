<template>
  <div class="window no-resize" name="Multiplayer IP">
    <div class="multiplayer-ip-wrapper">
      <label for="multiplayer-ip-input"></label>
      <input id="multiplayer-ip-input" v-model="multiplayerIP" type="text" />
      <div class="info-icon">
        <img :src="InfoIcon" @click="openIpHelp" alt="Info" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { storeToRefs } from 'pinia';
  import { useXashStore } from '/@/stores/store.ts';
  // @ts-ignore -- asset import
  import InfoIcon from '../assets/info-icon.png?url';

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
  }

  .info-icon {
    cursor: help;
    img {
      height: 16px;
      border: none;
      &:hover {
        filter: brightness(0) saturate(100%) invert(56%) sepia(28%)
          saturate(830%) hue-rotate(0deg) brightness(92%) contrast(87%);
      }
    }
  }
</style>
