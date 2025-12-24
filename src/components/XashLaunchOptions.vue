<template>
  <div class="window no-resize" name="Launch Options">
    <div class="box">
      <div class="options">
        <label for="fullscreen">
          <input
            id="fullscreen"
            v-model="fullScreen"
            name="fullscreen"
            type="checkbox"
          />
          Fullscreen
        </label>
        <label for="cheats">
          <input
            id="cheats"
            v-model="enableCheats"
            name="cheats"
            type="checkbox"
          />
          sv_cheats 1
        </label>
        <label for="console">
          <input
            id="console"
            v-model="enableConsole"
            name="console"
            type="checkbox"
          />
          Console
        </label>
      </div>
      <input v-model="launchOptions" class="xash-launch-options" type="text" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useXashStore } from '/@/stores/store';
  import { storeToRefs } from 'pinia';

  const store = useXashStore();
  const { launchOptions, fullScreen, enableConsole, enableCheats } = storeToRefs(store);
</script>

<style scoped lang="scss">
  .xash-launch-options {
    width: 100%;
  }

  .options {
    display: flex;
    flex-direction: column;
    margin-bottom: 16px;

    label {
      cursor: pointer;
    }
  }
</style>
