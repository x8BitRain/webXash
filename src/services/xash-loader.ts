import type { Xash3D } from 'xash3d-fwgs';
import type { FilesWithPath } from '/@/utils/directory-open.ts';
import type { ConsoleCallback, Enumify } from '/@/types.ts';
import { unzipSync } from 'fflate';
import { getZip } from '/@/utils/zip-helpers';
import SaveManager from '/@/services/save-manager.ts';
import { delay } from '/@/utils/helpers.ts';
import { DEFAULT_GAME_DIR } from '/@/services/save-manager.ts';

// Xash WASM Imports
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

const XASH_BASE_DIR = '/rodir/';

const DYNAMIC_LIBRARIES = [
  'filesystem_stdio.wasm',
  'libref_webgl2.wasm',
  'cl_dlls/menu_emscripten_wasm32.wasm',
  'dlls/hl_emscripten_wasm32.so',
  'cl_dlls/client_emscripten_wasm32.wasm',
];

export interface GameLoaderOptions {
  canvas: HTMLCanvasElement;
  selectedGame: Enumify<typeof GAME_SETTINGS>;
  launchArgs: string[];
}

export interface LoadProgress {
  current: number;
  total: number;
}

export interface StartGameOptions extends GameLoaderOptions {
  onStartLoading?: () => void;
  onEndLoading?: () => void;
  onProgress?: (progress: LoadProgress) => void;
  setCanvasLoading?: () => void;
}

export interface PostLoadOptions {
  xash: Xash3D;
  selectedGame: Enumify<typeof GAME_SETTINGS>;
  customGameArg: string;
  enableCheats?: boolean;
}

export interface FullStartOptions {
  canvas: HTMLCanvasElement;
  selectedGame: Enumify<typeof GAME_SETTINGS>;
  selectedZip?: string;
  selectedLocalFolder?: string;
  launchOptions?: string;
  fullScreen?: boolean;
  enableConsole?: boolean;
  enableCheats?: boolean;
  onStartLoading?: () => void;
  onEndLoading?: () => void;
  onProgress?: (progress: LoadProgress) => void;
  setCanvasLoading?: () => void;
  setMaxLoadingAmount?: (amount: number) => void;
}

// Constants

const XASH_LIBS = {
  filesystem: filesystemURL,
  xash: xashURL,
  menu: menuURL,
};

// Perform these callbacks when the matching command is emitted from the xash console
export const BASE_GAME_SETTINGS = {
  consoleCallbacks: [
    {
      id: 'onExit',
      match: 'exit',
      callback: () => XashLoader.onExit(),
    },
    {
      id: 'onQuit',
      match: 'quit',
      callback: () => XashLoader.onExit(),
    },
    {
      id: 'onShutdown',
      match: 'CL_Shutdown()',
      callback: () => XashLoader.onExit(),
    },
    {
      id: 'onTest',
      match: 'test',
      callback: () => console.log('test'),
    },
    {
      id: 'onSave',
      match: 'save',
      callback: () => SaveManager.onSave(), // We set what this does after xash launches.
    },
  ] as ConsoleCallback[],
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

export const DEFAULT_GAME = 'valve';
const DEFAULT_ARGS = ['+hud_scale', '2.5', '+volume', '0.05', '-ref', 'webgl2'];
const WINDOW_ARGS = ['-windowed', ...DEFAULT_ARGS];
const FULLSCREEN_ARGS = ['-fullscreen', ...DEFAULT_ARGS];
const CONSOLE_ARG = '-console';

const onBeforeUnload = (event: Event) => {
  event.preventDefault();
  event.returnValue = false;
};

class XashLoader {
  constructor() {
    window.addEventListener('beforeunload', onBeforeUnload);
  }

  public async initXash(options: GameLoaderOptions): Promise<Xash3D> {
    const { Xash3D } = await import('xash3d-fwgs');

    const xash = new Xash3D({
      module: {
        arguments: options.launchArgs,
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
      canvas: options.canvas,
      libraries: options.selectedGame.libraries,
      dynamicLibraries: DYNAMIC_LIBRARIES,
    });

    await xash.init();
    return xash;
  }

  public async processFiles(
    filesArray: FilesWithPath[],
    xash: Xash3D,
    onProgress?: (progress: LoadProgress) => void,
  ): Promise<void> {
    if (!filesArray?.length) {
      console.warn('No files selected to start Xash.');
      return;
    }

    xash.em.FS.mkdirTree(XASH_BASE_DIR);

    // Determine the root directory from the selected files so we can strip it from all paths.
    // This ensures the contents of the selected folder are placed directly in XASH_BASE_DIR.
    // e.g., if a file path is "Half-Life/valve/config.cfg", we want to remove "Half-Life/".
    const firstPath = filesArray[0].path;
    const rootDirEndIndex = firstPath.indexOf('/');
    const pathPrefixToRemove =
      rootDirEndIndex !== -1 ? firstPath.substring(0, rootDirEndIndex + 1) : '';

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
    let current = 0;
    for (const entry of filesArray) {
      const relativePath = entry.path.substring(pathPrefixToRemove.length);
      if (!relativePath) {
        current++;
        onProgress?.({ current, total: filesArray.length });
        continue;
      }

      const path = XASH_BASE_DIR + relativePath;
      const data = await entry.file.arrayBuffer();
      xash.em.FS.writeFile(path, new Uint8Array(data));

      current++;
      onProgress?.({ current, total: filesArray.length });
    }

    xash.em.FS.chdir(XASH_BASE_DIR);
  }

  public async processZip(zipBuffer: ArrayBuffer, xash: Xash3D): Promise<void> {
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
  }

  public async startWithFiles(
    options: GameLoaderOptions,
    filesArray: FilesWithPath[],
    onProgress?: (progress: LoadProgress) => void,
  ): Promise<Xash3D> {
    const xash = await this.initXash(options);
    await this.processFiles(filesArray, xash, onProgress);
    xash.main();
    return xash;
  }

  public async startWithZip(
    options: GameLoaderOptions,
    zipBuffer: ArrayBuffer,
  ): Promise<Xash3D> {
    const xash = await this.initXash(options);
    await this.processZip(zipBuffer, xash);
    xash.main();
    return xash;
  }

  public async downloadZip(
    selectedZip: string,
    publicDir: string,
    onProgress?: (progress: number) => void,
  ): Promise<ArrayBuffer | undefined> {
    if (!selectedZip) return;
    return await getZip(selectedZip, publicDir, onProgress!);
  }

  public async startGameWithFiles(
    options: StartGameOptions,
    filesArray: FilesWithPath[],
  ): Promise<Xash3D> {
    if (!options.canvas) {
      throw new Error('Canvas is not available');
    }

    options.setCanvasLoading?.();
    options.onStartLoading?.();

    const xash = await this.startWithFiles(
      {
        canvas: options.canvas,
        selectedGame: options.selectedGame,
        launchArgs: options.launchArgs,
      },
      filesArray,
      options.onProgress,
    );

    options.onEndLoading?.();
    return xash;
  }

  public async startGameWithZip(
    options: StartGameOptions,
    zip?: ArrayBuffer,
    selectedZip?: string,
    publicDir?: string,
    onDownloadProgress?: (progress: number) => void,
  ): Promise<Xash3D> {
    if (!options.canvas) {
      throw new Error('Canvas is not available');
    }

    options.onStartLoading?.();

    let zipBuffer = zip;

    if (!zipBuffer && selectedZip && publicDir) {
      zipBuffer = await this.downloadZip(
        selectedZip,
        publicDir,
        onDownloadProgress,
      );
    }

    if (!zipBuffer) {
      throw new Error('Failed to download or provide zip file');
    }

    const xash = await this.startWithZip(
      {
        canvas: options.canvas,
        selectedGame: options.selectedGame,
        launchArgs: options.launchArgs,
      },
      zipBuffer,
    );

    options.onEndLoading?.();
    return xash;
  }

  public async initConsoleCallbacks(
    xash: Xash3D,
    callbacks: Array<{ match: string; callback: () => void }>,
  ): Promise<void> {
    await Promise.all(
      callbacks.map(async (callback) => {
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
      }),
    );
  }

  private _buildLaunchArgs(options: FullStartOptions): string[] {
    const baseArgs = options.fullScreen ? FULLSCREEN_ARGS : WINDOW_ARGS;
    const args = [
      ...options.selectedGame.launchArgs,
      ...baseArgs,
      ...(options.launchOptions?.split(' ').filter(Boolean) || []),
    ];

    if (options.enableConsole) {
      args.push(CONSOLE_ARG);
    }

    if (options.selectedLocalFolder) {
      args.push('-game');
      args.push(options.selectedLocalFolder);
    }

    return args;
  }

  public async startGameFiles(
    filesArray: FilesWithPath[],
    options: FullStartOptions,
  ): Promise<Xash3D> {
    if (!options.canvas) {
      throw new Error('Canvas is not available');
    }

    try {
      const launchArgs = this._buildLaunchArgs(options);

      const xash = await this.startGameWithFiles(
        {
          canvas: options.canvas,
          selectedGame: options.selectedGame,
          launchArgs,
          setCanvasLoading: options.setCanvasLoading,
          onStartLoading: () => {
            options.onStartLoading?.();
            options.setMaxLoadingAmount?.(filesArray.length);
          },
          onEndLoading: options.onEndLoading,
          onProgress: options.onProgress,
        },
        filesArray,
      );

      return xash;
    } catch (error) {
      console.error('Failed to start Xash with files:', error);
      options.onEndLoading?.();
      throw error;
    }
  }

  public async startGameZip(
    zip: ArrayBuffer | undefined,
    options: FullStartOptions,
  ): Promise<Xash3D> {
    if (!options.canvas) {
      throw new Error('Canvas is not available');
    }

    try {
      const launchArgs = this._buildLaunchArgs(options);

      const xash = await this.startGameWithZip(
        {
          canvas: options.canvas,
          selectedGame: options.selectedGame,
          launchArgs,
          onStartLoading: options.onStartLoading,
          onEndLoading: options.onEndLoading,
        },
        zip,
        options.selectedZip,
        options.selectedGame.publicDir,
        // @ts-ignore -- ignore type in this case.
        options.onProgress!,
      );

      return xash;
    } catch (error) {
      console.error('Failed to start Xash with zip:', error);
      options.onEndLoading?.();
      throw error;
    }
  }

  public async onAfterLoad(options: PostLoadOptions): Promise<void> {
    await delay(500); // Wait for xash to fully load first

    SaveManager.init(options.xash);

    // Determine the game ID for save transfer
    const gameId =
      options.customGameArg === DEFAULT_GAME_DIR
        ? options.selectedGame.name
        : options.customGameArg;

    await SaveManager.transferSavesToGame(gameId);

    if (options.enableCheats) {
      options.xash.Cmd_ExecuteString('sv_cheats 1');
    }
  }

  public static onExit() {
    window.removeEventListener('beforeunload', onBeforeUnload);
    window.location.reload();
  }
}

export default new XashLoader();
