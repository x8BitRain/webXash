<template>
  <div class="window no-resize" name="Half-Life Demos">
    <div class="box inset">
      <p
        v-for="zip in zipList"
        :key="zip.name"
        class="menu-item"
        :class="{ 'menu-item--selected': selectedZip === zip.packageName }"
        @click="selectedZip = zip.packageName"
      >
        {{ zip.name }}
      </p>
    </div>
    <button class="start-button" :disabled="!selectedZip" @click="start">
      Start Demo
    </button>
  </div>
</template>

<script setup lang="ts">
  import zipList from '/@/config/games';
  import { useXashStore } from '/@/stores/store';
  import { storeToRefs } from 'pinia';
  import setCanvasLoading from '/@/utils/setCanvasLoading.ts';
  import { XashLoader } from '/@/services';

  const store = useXashStore();

  const {
    selectedZip,
    selectedGame,
    xashCanvas,
    launchOptions,
    selectedLocalFolder,
    fullScreen,
    enableConsole,
    enableCheats,
    loadingProgress,
    customGameArg,
  } = storeToRefs(store);
  const { onStartLoading, onEndLoading, refreshSavesList } = store;

  // Methods

  const start = async () => {
    if (!xashCanvas.value) {
      console.error('Canvas is not available');
      return;
    }

    setCanvasLoading();
    const zip = await XashLoader.downloadZip(
      selectedZip.value,
      selectedGame.value.publicDir,
      (progress: number) => (loadingProgress.value = progress),
    );
    if (!zip) {
      alert('Selected game could not be loaded!');
      return;
    }

    try {
      const xash = await XashLoader.startGameZip(zip, {
        canvas: xashCanvas.value,
        selectedGame: selectedGame.value,
        selectedZip: selectedZip.value,
        selectedLocalFolder: selectedLocalFolder.value,
        launchOptions: launchOptions.value,
        fullScreen: fullScreen.value,
        enableConsole: enableConsole.value,
        enableCheats: enableCheats.value,
        onStartLoading,
        onEndLoading,
        onProgress: (progress) => {
          if (typeof progress === 'number') {
            loadingProgress.value = progress;
          } else {
            loadingProgress.value = progress.current;
          }
        },
      });

      await XashLoader.onAfterLoad({
        xash,
        selectedGame: selectedGame.value,
        customGameArg: customGameArg.value,
        enableCheats: enableCheats.value,
      });

      await XashLoader.initConsoleCallbacks(
        xash,
        selectedGame.value.consoleCallbacks,
      );

      await refreshSavesList();
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };
</script>

<style scoped lang="scss">
  .start-button {
    margin-top: 0.5rem;
    text-align: center;
    width: 100%;
  }
</style>
