<template>
  <div
    class="window no-resize"
    :name="storedFolder ? 'Game: ' + storedFolder : 'Open folder'"
  >
    <div>
      <div v-if="subfolders.length > 0" class="box inset local-folders">
        <p
          v-for="folder in subfolders"
          :key="folder"
          class="menu-item"
          :class="{ 'menu-item--selected': selectedLocalFolder === folder }"
          @click="selectedLocalFolder = folder"
        >
          {{ folder }}
        </p>
      </div>

      <div
        class="start-buttons"
        :class="{ 'start-buttons--has-folders': subfolders.length > 0 }"
      >
        <button
          v-if="storedFolder"
          class="start-button"
          :disabled="!selectedLocalFolder"
          @click="start"
        >
          <span> Start Game </span>
        </button>

        <button class="start-button" @click="chooseNewFolder">
          <span> Open game Folder </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useXashStore } from '/@/stores/store';
  import directoryOpen, {
    type FilesWithPath,
    clearStoredFolder,
    getStoredDirectoryHandle,
    getImmediateSubfolders,
  } from '/@/utils/directory-open.ts';
  import { computed, onMounted, ref } from 'vue';
  import { storeToRefs } from 'pinia';
  import { XashLoader } from '/@/services';
  import setCanvasLoading from '/@/utils/setCanvasLoading.ts';

  // Dependencies

  const store = useXashStore();

  // Data

  const files = ref<FilesWithPath[]>();
  const storedFolder = ref<string | null>(null);

  const {
    selectedLocalFolder,
    selectedGame,
    xashCanvas,
    launchOptions,
    fullScreen,
    enableConsole,
    enableCheats,
    loadingProgress,
    customGameArg,
  } = storeToRefs(store);
  const { onStartLoading, onEndLoading, refreshSavesList } = store;

  // Computed

  const subfolders = computed(() => {
    return getImmediateSubfolders(files.value ?? []);
  });

  // Methods

  const openFolder = async () => {
    files.value = await directoryOpen({ recursive: true });
  };

  const chooseNewFolder = async () => {
    await clearStoredFolder();
    await openFolder();
    await populateStoredDir();
  };

  const populateStoredDir = async () => {
    const storedDir = await getStoredDirectoryHandle();
    if (storedDir && storedDir?.name) {
      storedFolder.value = storedDir.name;
      // Load files from the stored directory
      files.value = await directoryOpen({ recursive: true });
    }
  };

  const start = async () => {
    if (!files.value) {
      await openFolder();
      if (!files.value) {
        alert(
          'There were no files found in this folder, was it moved or deleted?',
        );
        return;
      }
    }

    if (!xashCanvas.value) {
      console.error('Canvas is not available');
      return;
    }

    try {
      const xash = await XashLoader.startGameFiles(files.value, {
        canvas: xashCanvas.value,
        selectedGame: selectedGame.value,
        selectedLocalFolder: selectedLocalFolder.value,
        launchOptions: launchOptions.value,
        fullScreen: fullScreen.value,
        enableConsole: enableConsole.value,
        enableCheats: enableCheats.value,
        setCanvasLoading,
        onStartLoading: () => {
          onStartLoading();
          store.maxLoadingAmount = files.value!.length;
        },
        onEndLoading,
        onProgress: (progress) => {
          loadingProgress.value = progress.current;
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

  // Hooks

  onMounted(async () => {
    await populateStoredDir();
  });
</script>

<style scoped lang="scss">
  .local-folders {
    max-height: 200px;
    overflow: auto;
  }

  .start-buttons {
    display: flex;
    flex-direction: column;

    .start-button {
      text-align: center;
      width: 100%;

      &:first-child {
        margin-bottom: 1rem;
      }
    }
  }

  .start-buttons--has-folders {
    margin-top: 1rem;
  }
</style>
