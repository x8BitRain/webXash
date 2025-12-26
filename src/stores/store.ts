import { computed, onMounted, ref } from 'vue';
import { SaveManager, XashLoader } from '/@/services';
import { defineStore } from 'pinia';
import setCanvasLoading from '/@/utils/setCanvasLoading.ts';
import type { ConsoleCallback, Enumify } from '/@/types.ts';
import { type SaveEntry } from '/@/services/save-manager.ts';
import type { FilesWithPath } from '/@/utils/directory-open.ts';

import { DEFAULT_GAME_DIR } from '/@/services/save-manager.ts';

// Xash Imports for game configuration
// @ts-ignore -- vite url imports
import filesystemURL from 'xash3d-fwgs/filesystem_stdio.wasm?url';
// @ts-ignore -- vite url imports
import xashURL from 'xash3d-fwgs/xash.wasm?url';
// @ts-ignore -- vite url imports
import menuURL from 'xash3d-fwgs/libmenu.wasm?url';
// @ts-ignore -- vite url imports
import HLClientURL from 'hlsdk-portable/cl_dlls/client_emscripten_wasm32.wasm?url';
// @ts-ignore -- vite url imports
import HLServerURL from 'hlsdk-portable/dlls/hl_emscripten_wasm32.so?url';
// @ts-ignore -- vite url imports
import CSMenuURL from 'cs16-client/cl_dll/menu_emscripten_wasm32.wasm?url';
// @ts-ignore -- vite url imports
import CSClientURL from 'cs16-client/cl_dll/client_emscripten_wasm32.wasm?url';
// @ts-ignore -- vite url imports
import CSServerURL from 'cs16-client/dlls/cs_emscripten_wasm32.so?url';

// Constants
export const DEFAULT_GAME = 'valve';

const XASH_LIBS = {
  filesystem: filesystemURL,
  xash: xashURL,
  menu: menuURL,
};

// Perform these callbacks when the matching command is emitted from the xash console
const BASE_GAME_SETTINGS = {
  consoleCallbacks: [
    {
      id: 'onExit',
      match: 'exit',
      callback: () => window.location.reload(),
    },
    {
      id: 'onQuit',
      match: 'quit',
      callback: () => window.location.reload(),
    },
    {
      id: 'onShutdown',
      match: 'CL_Shutdown()',
      callback: () => window.location.reload(),
    },
    {
      id: 'onTest',
      match: 'test',
      callback: () => console.log('test'),
    },
    {
      id: 'onSave',
      match: 'save',
      callback: () => void 0, // We set what this does after xash launches.
    },
  ] as ConsoleCallback[],
};

const setupSaveCallback = (selectedGame: typeof GAME_SETTINGS) => {
  const saveCallback = BASE_GAME_SETTINGS.consoleCallbacks.find(
    (callback) => callback.id === 'onSave',
  );
  if (saveCallback) {
    saveCallback.callback = () => {
      // @ts-ignore -- this works.
      SaveManager.onSave(selectedGame);
    };
  }
};

export const GAME_SETTINGS = {
  HL: {
    name: 'Half-Life',
    launchArgs: [],
    publicDir: 'hl/',
    libraries: {
      ...XASH_LIBS,
      client: HLClientURL,
      server: HLServerURL,
    },
    ...BASE_GAME_SETTINGS,
  },
  CS: {
    name: 'Counter-Strike',
    launchArgs: ['-game', 'cstrike', '+_vgui_menus', '0'],
    publicDir: 'cs/',
    libraries: {
      ...XASH_LIBS,
      menu: CSMenuURL,
      client: CSClientURL,
      server: CSServerURL,
    },
    ...BASE_GAME_SETTINGS,
  },
} as const;

const DEFAULT_ARGS = [`+hud_scale`, '2.5', '+volume', '0.05', '-ref', 'webgl2'];
const WINDOW_ARGS = ['-windowed', ...DEFAULT_ARGS];
const FULLSCREEN_ARGS = ['-fullscreen', ...DEFAULT_ARGS];
const CONSOLE_ARG = '-console';

export const useXashStore = defineStore(
  'xash',
  () => {
    // State
    const xashCanvas = ref<HTMLCanvasElement>();
    const selectedGame = ref<Enumify<typeof GAME_SETTINGS>>(GAME_SETTINGS.HL);
    const selectedZip = ref('');
    const selectedLocalFolder = ref('');
    const saves = ref<Partial<SaveEntry>[]>();
    const loading = ref(false);
    const loadingProgress = ref(1);
    const maxLoadingAmount = ref(100);
    const showXashSettingUI = ref(true);
    // -- Launch options
    const launchOptions = ref('');
    const fullScreen = ref(false);
    const enableConsole = ref(true);
    const enableCheats = ref(false);

    // Methods

    const getLaunchArgs = () => {
      const baseArgs = fullScreen.value ? FULLSCREEN_ARGS : WINDOW_ARGS;
      const args = [
        ...selectedGame.value.launchArgs,
        ...baseArgs,
        ...launchOptions.value.split(' ').filter(Boolean),
      ];

      if (enableConsole.value) {
        args.push(CONSOLE_ARG);
      }

      if (selectedLocalFolder.value) {
        args.push('-game');
        args.push(selectedLocalFolder.value);
      }

      return args;
    };

    const onStartLoading = () => {
      loading.value = true;
      loadingProgress.value = 0;
    };

    const onEndLoading = () => {
      loading.value = false;
      showXashSettingUI.value = false;
    };

    const startXashFiles = async (filesArray: FilesWithPath[]) => {
      if (!xashCanvas.value) {
        console.error('Xash canvas is not available.');
        return;
      }

      try {
        const xash = await XashLoader.startGameWithFiles(
          {
            canvas: xashCanvas.value,
            selectedGame: selectedGame.value,
            launchArgs: getLaunchArgs(),
            setCanvasLoading,
            onStartLoading: () => {
              onStartLoading();
              maxLoadingAmount.value = filesArray.length;
            },
            onEndLoading,
            onProgress: (progress) => {
              loadingProgress.value = progress.current;
            },
          },
          filesArray,
        );

        await XashLoader.onAfterLoad({
          xash,
          selectedGame: selectedGame.value,
          customGameArg: customGameArg.value,
          enableCheats: enableCheats.value,
          onSaveCallback: () => {
            // @ts-ignore -- this works
            setupSaveCallback(selectedGame.value);
          },
        });

        // Init callbacks on console messages
        await initConsoleCallbacks(xash);
      } catch (error) {
        console.error('Failed to start Xash with files:', error);
        onEndLoading();
      }
    };

    const startXashZip = async (zip?: ArrayBuffer | undefined) => {
      if (!xashCanvas.value) {
        console.error('Xash canvas is not available.');
        return;
      }

      try {
        const xash = await XashLoader.startGameWithZip(
          {
            canvas: xashCanvas.value,
            selectedGame: selectedGame.value,
            launchArgs: getLaunchArgs(),
            onStartLoading,
            onEndLoading,
          },
          zip,
          selectedZip.value,
          selectedGame.value.publicDir,
          (progress: number) => (loadingProgress.value = progress),
        );

        await XashLoader.onAfterLoad({
          xash,
          selectedGame: selectedGame.value,
          customGameArg: customGameArg.value,
          enableCheats: enableCheats.value,
          onSaveCallback: () => {
            // @ts-ignore -- this works
            setupSaveCallback(selectedGame.value);
          },
        });

        // Init callbacks on console messages
        await initConsoleCallbacks(xash);
      } catch (error) {
        console.error('Failed to start Xash with zip:', error);
        onEndLoading();
      }
    };

    const initConsoleCallbacks = async (xash: any) => {

      await Promise.all(
        selectedGame.value.consoleCallbacks.map(
          async (callback: ConsoleCallback) => {
            const run = true;
            while (run) {
              try {
                await xash.waitLog(callback.match, undefined, 1000);
                callback.callback();
              } catch (_error) {
                // noop
              }
              await new Promise((resolve) => setTimeout(resolve, 500));
            }
          },
        ),
      );
    };

    const refreshSavesList = async () => {
      const saveEntries = await SaveManager.listSaves();

      // Throw away the game data for now just to save on memory.
      for (const file of saveEntries) {
        if (file.data) {
          for (const saveData of file.data) {
            saveData.data = new Uint8Array();
          }
        }
      }

      saves.value = saveEntries;
    };

    // Computed

    const customGameArg = computed((): string => {
      // This regex should return two groups if it detects:
      // Group 0 (full match): -game blueshift
      // Group 1: blueshift (the word after -game)
      const customGameSearch = launchOptions.value?.match(
        /-game\s+(\S+)(?!.*-game\s+\S+)/,
      );
      if (customGameSearch && customGameSearch.length === 2) {
        return customGameSearch[1];
      } else if (selectedLocalFolder.value) {
        return selectedLocalFolder.value;
      } else {
        return DEFAULT_GAME_DIR;
      }
    });

    // Hooks

    onMounted(async () => {
      // Reapply console callback methods as they do not persist across refreshes.
      selectedGame.value = {
        ...selectedGame.value,
        ...BASE_GAME_SETTINGS,
      };

      // Getting Save Data from IDB
      await refreshSavesList();
    });

    return {
      // Data
      xashCanvas,
      selectedGame,
      selectedZip,
      selectedLocalFolder,
      saves,
      loading,
      loadingProgress,
      maxLoadingAmount,
      showXashSettingUI,
      launchOptions,
      fullScreen,
      enableConsole,
      enableCheats,
      // Computed
      customGameArg,
      // Methods
      onStartLoading,
      startXashZip,
      startXashFiles,
      refreshSavesList,
    };
  },
  {
    persist: {
      pick: [
        'selectedGame',
        'selectedZip',
        'selectedLocalFolder',
        'launchOptions',
        'fullScreen',
        'enableConsole',
        'enableCheats',
      ],
    },
  },
);
