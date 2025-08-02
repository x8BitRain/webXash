import Xash from './generated/xash';
import { DEFAULT_CLIENT_LIBRARY, DEFAULT_SOFT_LIBRARY, DEFAULT_FILESYSTEM_LIBRARY, DEFAULT_MENU_LIBRARY, DEFAULT_SERVER_LIBRARY, DEFAULT_GLES3COMPAT_LIBRARY, DEFAULT_XASH_LIBRARY } from './constants';
/**
 * Xash3D WebAssembly engine wrapper for running and controlling the game engine.
 */
export class Xash3D {
    /** Indicates whether the engine has exited */
    get exited() {
        return this._exited;
    }
    set exited(value) {
        this._exited = value;
    }
    /** Indicates whether the engine is currently running */
    get running() {
        return this._running;
    }
    set running(value) {
        this._running = value;
    }
    /**
     * Creates a new instance of the Xash3D engine.
     * @param opts - Engine configuration options
     */
    constructor(opts = {}) {
        this._exited = false;
        this._running = false;
        this.opts = opts;
    }
    /**
     * Executes a command string within the engine.
     * @param cmd - The command string to execute
     */
    Cmd_ExecuteString(cmd) {
        this.em?.Module?.ccall('Cmd_ExecuteString', null, ['string'], [cmd]);
    }
    /**
     * Quits the engine by executing the `quit` command.
     */
    Sys_Quit() {
        this.Cmd_ExecuteString('quit');
    }
    /**
     * Initializes the engine asynchronously.
     * Awaits module setup and exits immediately if flagged.
     */
    async init() {
        if (!this.emPromise) {
            this.emPromise = this.runEm();
        }
        await this.emPromise;
        if (this.exited) {
            this.Sys_Quit();
            return;
        }
    }
    /**
     * Starts the main engine loop, if not already running or exited.
     */
    main() {
        if (!this.em || this.running || this.exited)
            return;
        this.running = true;
        this.em.start();
    }
    /**
     * Gracefully quits the engine, if running.
     */
    quit() {
        if (this.exited || !this.running)
            return;
        this.exited = true;
        this.running = false;
        this.Sys_Quit();
    }
    /**
     * Maps a given file path using the configured `filesMap`.
     * @param path - The original path
     * @returns Mapped path or original
     */
    locateFile(path) {
        return this.opts.filesMap[path] ?? path;
    }
    /**
     * Initializes rendering context and injects render-specific dynamic libraries.
     * @param canvas - HTMLCanvasElement used for rendering
     * @param render - Renderer type to initialize
     * @returns WebGL2RenderingContext or `null` for software rendering
     */
    initRender(canvas, render = 'gles3compat') {
        switch (render) {
            case 'gles3compat':
                if (this.opts?.libraries?.render?.gles3compat) {
                    this.opts.filesMap[DEFAULT_GLES3COMPAT_LIBRARY] = this.opts.libraries.render.gles3compat;
                }
                this.opts.dynamicLibraries.push(DEFAULT_GLES3COMPAT_LIBRARY);
                return canvas?.getContext('webgl2', {
                    alpha: false,
                    depth: true,
                    stencil: true,
                    antialias: true,
                }) ?? null;
            default:
                if (this.opts?.libraries?.render?.soft) {
                    this.opts.filesMap[DEFAULT_SOFT_LIBRARY] = this.opts.libraries.render.soft;
                }
                this.opts.dynamicLibraries.push(DEFAULT_SOFT_LIBRARY);
                return null;
        }
    }
    /**
     * Sets the path for a specific core engine library, if provided.
     * @param library - The name of the library to initialize
     * @param defaultPath - The default path to use if not overridden
     */
    initLibrary(library, defaultPath) {
        if (this.opts.libraries?.[library]) {
            this.opts.filesMap[defaultPath] = this.opts.libraries[library];
        }
    }
    /**
     * Internal method to initialize and run the WebAssembly module.
     * Loads dynamic libraries, sets up canvas and rendering, and connects networking.
     */
    async runEm() {
        if (!this.opts.filesMap) {
            this.opts.filesMap = {};
        }
        if (!this.opts.dynamicLibraries) {
            this.opts.dynamicLibraries = [];
        }
        this.initLibrary('filesystem', DEFAULT_FILESYSTEM_LIBRARY);
        this.initLibrary('client', DEFAULT_CLIENT_LIBRARY);
        this.initLibrary('server', DEFAULT_SERVER_LIBRARY);
        this.initLibrary('menu', DEFAULT_MENU_LIBRARY);
        if (this.opts.libraries?.xash) {
            this.opts.filesMap[DEFAULT_XASH_LIBRARY] = this.opts.libraries.xash;
        }
        const canvas = this.opts?.canvas;
        const ctx = this.initRender(canvas, this.opts.renderer);
        const dynamicLibraries = [
            DEFAULT_FILESYSTEM_LIBRARY,
            DEFAULT_MENU_LIBRARY,
            DEFAULT_SERVER_LIBRARY,
            DEFAULT_CLIENT_LIBRARY,
            ...this.opts.dynamicLibraries,
        ];
        this.em = await Xash({
            canvas,
            ctx,
            dynamicLibraries,
            sendto: this.net?.sendto,
            recvfrom: this.net?.recvfrom,
            locateFile: path => this.locateFile(path),
            ...(this.opts.module ?? {}),
        });
        if (this.net) {
            this.net.init(this.em);
        }
    }
}
