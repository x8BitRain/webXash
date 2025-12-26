import { computed, onMounted, ref } from 'vue';
import { SaveManager } from '/@/services';
import { defineStore } from 'pinia';
import { getZip } from '/@/utils/zip-helpers';
import { Xash3D } from 'xash3d-fwgs';
import { unzipSync } from 'fflate';
import setCanvasLoading from '/@/utils/setCanvasLoading.ts';
import { delay } from '/@/utils/helpers.ts';
import type { ConsoleCallback, Enumify } from '/@/types.ts';
import { type SaveEntry } from '/@/services/save-manager.ts';
import type { FilesWithPath } from '/@/utils/directory-open.ts';

// Xash Imports
// @ts-ignore -- vite url imports
import filesystemURL from 'xash3d-fwgs/filesystem_stdio.wasm?url';
// @ts-ignore -- vite url imports
import xashURL from 'xash3d-fwgs/xash.wasm?url';
// @ts-ignore -- vite url imports
import menuURL from 'xash3d-fwgs/libmenu.wasm?url';
// @ts-ignore -- vite url imports
import webgl2URL from 'xash3d-fwgs/libref_webgl2.wasm?url';
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
import { DEFAULT_GAME_DIR } from '/@/services/save-manager.ts';

// Constants

const DYNAMIC_LIBRARIES = [
  'filesystem_stdio.wasm',
  'libref_webgl2.wasm',
  'cl_dlls/menu_emscripten_wasm32.wasm',
  'dlls/hl_emscripten_wasm32.so',
  'cl_dlls/client_emscripten_wasm32.wasm',
];

export const DEFAULT_GAME = 'valve';
const XASH_BASE_DIR = '/rodir/';

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

    const increaseLoadedAmount = () => {
      loadingProgress.value++;
      if (loadingProgress.value >= maxLoadingAmount.value) {
        onEndLoading();
      }
    };

    const initXash = async () => {
      const launchArguments = getLaunchArgs();
      const xash = new Xash3D({
        module: {
          arguments: launchArguments,
          locateFile: (path: string) => {
            switch (path) {
              case 'xash.wasm':
                return xashURL;
              case 'filesystem_stdio.wasm':
                return filesystemURL;
              case 'cl_dlls/menu_emscripten_wasm32.wasm':
                return menuURL;
              case 'dlls/hl_emscripten_wasm32.so':
                return HLServerURL;
              case 'cl_dlls/client_emscripten_wasm32.wasm':
                return HLClientURL;
              case 'libref_webgl2.wasm':
                return webgl2URL;
              // Check this (not supported yet)
              case 'libvgui_support.wasm':
                return menuURL;
            }
            return path;
          },
        },
        canvas: xashCanvas.value,
        libraries: selectedGame.value.libraries,
        dynamicLibraries: DYNAMIC_LIBRARIES,
      });
      await xash.init();
      return xash;
    };

    // Common file processing logic
    const processFiles = async (filesArray: FilesWithPath[], xash: Xash3D) => {
      if (!filesArray?.length) {
        console.warn('No files selected to start Xash.');
        return;
      }

      onStartLoading();
      maxLoadingAmount.value = filesArray.length;

      xash.em.FS.mkdirTree(XASH_BASE_DIR);

      // Determine the root directory from the selected files so we can strip it from all paths.
      // This ensures the contents of the selected folder are placed directly in XASH_BASE_DIR.
      // e.g., if a file path is "Half-Life/valve/config.cfg", we want to remove "Half-Life/".
      const firstPath = filesArray[0].path;
      const rootDirEndIndex = firstPath.indexOf('/');
      const pathPrefixToRemove =
        rootDirEndIndex !== -1
          ? firstPath.substring(0, rootDirEndIndex + 1)
          : '';

      const allDirs = new Set<string>();

      // Collect directories first
      for (const entry of filesArray) {
        const relativePath = entry.path.substring(pathPrefixToRemove.length);
        if (!relativePath) continue;

        const path = XASH_BASE_DIR + relativePath;
        const dir = path.substring(0, path.lastIndexOf('/'));
        if (dir) {
          allDirs.add(dir);
        }
      }

      // Create directories
      for (const dir of allDirs) {
        xash.em.FS.mkdirTree(dir);
      }

      // Write files
      for (const entry of filesArray) {
        const relativePath = entry.path.substring(pathPrefixToRemove.length);
        if (!relativePath) {
          increaseLoadedAmount();
          continue;
        }

        const path = XASH_BASE_DIR + relativePath;
        const data = await entry.file.arrayBuffer();
        xash.em.FS.writeFile(path, new Uint8Array(data));
        increaseLoadedAmount();
      }

      xash.em.FS.chdir(XASH_BASE_DIR);
    };

    // Download and unzip logic
    const downloadZip = async (): Promise<ArrayBuffer | undefined> => {
      if (!selectedZip.value) return;
      return await getZip(
        selectedZip.value,
        selectedGame.value.publicDir,
        (progress: number) => (loadingProgress.value = progress),
      );
    };

    const startXashFiles = async (filesArray: FilesWithPath[]) => {
      if (!xashCanvas.value) {
        console.error('Xash canvas is not available.');
        return;
      }
      setCanvasLoading();

      const xash = await initXash();
      await processFiles(filesArray, xash);
      xash.main();
      await onAfterLoad(xash);
    };

    const startXashZip = async (zip?: ArrayBuffer | undefined) => {
      if (!xashCanvas.value) {
        console.error('Xash canvas is not available.');
        return;
      }
      onStartLoading();

      let zipBuffer = zip || undefined;

      if (!zipBuffer) {
        zipBuffer = await downloadZip();
      }

      if (!zipBuffer) {
        console.error('Failed to download the zip file.');
        return;
      }

      const xash = await initXash();
      const zipData = new Uint8Array(zipBuffer);
      const files = unzipSync(zipData);

      xash.em.FS.mkdirTree(XASH_BASE_DIR);

      for (const [filename, content] of Object.entries(files)) {
        const path = XASH_BASE_DIR + filename;
        if (filename.endsWith('/')) {
          xash.em.FS.mkdirTree(path);
        } else {
          const dir = path.substring(0, path.lastIndexOf('/'));
          if (dir) {
            xash.em.FS.mkdirTree(dir);
          }
          xash.em.FS.writeFile(path, content);
        }
      }

      xash.em.FS.chdir(XASH_BASE_DIR);
      xash.main();

      onEndLoading();
      await onAfterLoad(xash);
    };

    const onAfterLoad = async (xash: Xash3D) => {
      await delay(500); // Wait for xash to fully load first.

      SaveManager.init(xash);

      // @ts-ignore -- this works
      setupSaveCallback(selectedGame.value);

      // Determine the game ID for save transfer
      const gameId = customGameArg.value === DEFAULT_GAME_DIR
        ? selectedGame.value.name
        : customGameArg.value;

      await SaveManager.transferSavesToGame(gameId);

      if (enableCheats.value) {
        xash.Cmd_ExecuteString('sv_cheats 1');
      }

      // Init callbacks on console messages.
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
              await delay(500);
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

      // Prevent closing window when pressing ctrl+w
      window.addEventListener('beforeunload', function (e) {
        e.preventDefault();
        e.returnValue = '';
      });

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
      downloadZip,
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
