import type { Xash3D } from 'xash3d-fwgs';
import type { FilesWithPath } from '/@/utils/directory-open.ts';
import type { Enumify } from '/@/types.ts';
import type { GAME_SETTINGS } from '/@/stores/store.ts';
import { unzipSync } from 'fflate';
import { getZip } from '/@/utils/zip-helpers';
import SaveManager from '/@/services/save-manager.ts';
import { delay } from '/@/utils/helpers.ts';
import { DEFAULT_GAME_DIR } from '/@/services/save-manager.ts';

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
  onSaveCallback?: () => void;
}

class XashLoader {
  /**
   * Initializes a new Xash3D instance with the provided configuration
   */
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

  /**
   * Processes and loads files into the Xash3D filesystem
   */
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

  /**
   * Processes and loads a zip file into the Xash3D filesystem
   */
  public async processZip(
    zipBuffer: ArrayBuffer,
    xash: Xash3D,
  ): Promise<void> {
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

  /**
   * Starts the Xash3D game with the provided files
   */
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

  /**
   * Starts the Xash3D game with the provided zip file
   */
  public async startWithZip(
    options: GameLoaderOptions,
    zipBuffer: ArrayBuffer,
  ): Promise<Xash3D> {
    const xash = await this.initXash(options);
    await this.processZip(zipBuffer, xash);
    xash.main();
    return xash;
  }

  /**
   * Downloads a zip file for the selected game
   */
  public async downloadZip(
    selectedZip: string,
    publicDir: string,
    onProgress?: (progress: number) => void,
  ): Promise<ArrayBuffer | undefined> {
    if (!selectedZip) return;
    return await getZip(selectedZip, publicDir, onProgress!);
  }

  /**
   * Complete workflow: Start Xash3D with file array
   */
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

  /**
   * Complete workflow: Start Xash3D with zip file
   */
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
      zipBuffer = await this.downloadZip(selectedZip, publicDir, onDownloadProgress);
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

  /**
   * Post-load setup: Initialize save manager, transfer saves, enable cheats, setup callbacks
   */
  public async onAfterLoad(options: PostLoadOptions): Promise<void> {
    await delay(500); // Wait for xash to fully load first

    SaveManager.init(options.xash);

    // Set up save callback if provided
    if (options.onSaveCallback) {
      options.onSaveCallback();
    }

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
}

export default new XashLoader();
