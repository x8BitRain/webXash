import Xash from './generated/xash';
import { DEFAULT_CLIENT_LIBRARY, DEFAULT_FILESYSTEM_LIBRARY, DEFAULT_GL4ES_LIBRARY, DEFAULT_GLES3COMPAT_LIBRARY, DEFAULT_MENU_LIBRARY, DEFAULT_SERVER_LIBRARY, DEFAULT_SOFT_LIBRARY, DEFAULT_XASH_LIBRARY } from './constants';
/**
 * Reads errno from the WASM runtime.
 * @param em - Emscripten interface
 * @returns errno value or 0 if unavailable
 */
export function ErrNoLocation(em) {
    // Call WASM function to get pointer to errno location
    const ptr = em?.Module.ccall('getErrnoLocation', 'number', [], []);
    if (!ptr)
        return 0;
    // Read errno integer value from the pointer
    return em.getValue(ptr, 'i32');
}
/**
 * High-level wrapper around the Xash3D WebAssembly engine.
 */
export class Xash3D {
    /** Whether the engine has exited */
    get exited() {
        return this._exited;
    }
    set exited(value) {
        this._exited = value;
    }
    /** Whether the engine main loop is running */
    get running() {
        return this._running;
    }
    set running(value) {
        this._running = value;
    }
    /**
     * Create a new engine instance.
     * @param opts - Engine configuration
     */
    constructor(opts = {}) {
        this._exited = false;
        /** Array of logs to wait */
        this.waitLogs = [];
        /** Active timers used in waitLog */
        this.waitTimers = new Set;
        this._running = false;
        this.opts = opts;
    }
    /**
     * Execute a console command inside the engine.
     * @param cmd - Command string to execute
     */
    Cmd_ExecuteString(cmd) {
        this.em?.Module?.ccall('Cmd_ExecuteString', null, ['string'], [cmd]);
    }
    /**
     * Request engine termination via the `quit` command.
     * This sends the 'quit' command to the engine console.
     */
    Sys_Quit() {
        this.Cmd_ExecuteString('quit');
    }
    /**
     * Initialize the engine runtime asynchronously.
     * If already initialized, reuses the existing initialization promise.
     * On engine exit, triggers a quit.
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
     * Start the main engine loop.
     * No-op if engine is already running or has exited.
     */
    main() {
        if (!this.em || this.running || this.exited)
            return;
        this.running = true;
        this.em.start();
    }
    /**
     * Shut down the engine gracefully.
     * Clears all wait timers.
     * No-op if engine already exited or is not running.
     */
    quit() {
        this.waitTimers.forEach(t => {
            clearInterval(t);
        });
        if (this.exited || !this.running)
            return;
        this.exited = true;
        this.running = false;
        this.Sys_Quit();
    }
    /**
     * Resolve a file path via `filesMap` if a mapping exists,
     * otherwise return the original path.
     * @param path - Original file path
     * @returns Resolved path for loading
     */
    locateFile(path) {
        return this.opts.filesMap[path] ?? path;
    }
    /**
     * Configure renderer-specific libraries and arguments based on selected renderer.
     * Maps libraries to `filesMap` and adds dynamic libraries accordingly.
     * @param render - Renderer type (default: 'gl4es')
     * @returns Array of command-line arguments for the engine
     */
    initRender(render = 'gl4es') {
        switch (render) {
            case 'gl4es':
            case 'gles3compat':
                // If override paths provided, map them to dynamic libraries
                if (this.opts?.libraries?.render?.gles3compat) {
                    this.opts.filesMap[DEFAULT_GLES3COMPAT_LIBRARY] = this.opts.libraries.render.gles3compat;
                }
                if (this.opts?.libraries?.render?.gl4es) {
                    this.opts.filesMap[DEFAULT_GL4ES_LIBRARY] = this.opts.libraries.render.gl4es;
                }
                // Add GLES3Compat library to dynamic loading list
                this.opts.dynamicLibraries.push(DEFAULT_GLES3COMPAT_LIBRARY);
                // Return engine args to select WebGL2 renderer
                return ['-ref', 'webgl2', ...(this.opts.arguments || [])];
            default:
                // Map soft renderer library if overridden
                if (this.opts?.libraries?.render?.soft) {
                    this.opts.filesMap[DEFAULT_SOFT_LIBRARY] = this.opts.libraries.render.soft;
                }
                // Add software renderer library to dynamic loading list
                this.opts.dynamicLibraries.push(DEFAULT_SOFT_LIBRARY);
                // Return engine args to select software renderer
                return ['-ref', 'soft', ...(this.opts.arguments || [])];
        }
    }
    /**
     * Map a provided library path into `filesMap` under a default WASM FS path.
     * @param library - Library key from options
     * @param defaultPath - Default file path name in WASM FS
     */
    initLibrary(library, defaultPath) {
        if (this.opts.libraries?.[library]) {
            this.opts.filesMap[defaultPath] = this.opts.libraries[library];
        }
    }
    /**
     * Retrieve the value of a console variable (cvar) asynchronously.
     * Waits for the engine to log the cvar value.
     * @param name - Cvar name
     * @param timeoutMs - Timeout in milliseconds to wait for variable (default 1000ms)
     * @returns The cvar value string or empty if not found
     */
    async getCVar(name, timeoutMs = 1000) {
        const msg = await this.waitLog(`"${name}" is`, name, timeoutMs);
        const searchStr = `"${name}" is "`;
        const startIndex = msg.indexOf(searchStr);
        if (startIndex === -1)
            return '';
        const valueStart = startIndex + searchStr.length;
        const valueEnd = msg.indexOf('"', valueStart);
        if (valueEnd === -1)
            return '';
        return msg.slice(valueStart, valueEnd);
    }
    /**
     * Wait for a log message containing the specified substring.
     * Rejects after timeout.
     * @param subLog - Substring to search in logs
     * @param cmd - Optional command to execute
     * @param timeoutMs - Timeout in milliseconds (default 1000ms)
     * @returns Promise resolving with the log message containing substring
     */
    waitLog(subLog, cmd, timeoutMs = 1000) {
        return new Promise((resolve, reject) => {
            this.waitLogs.push({
                subLog,
                resolve,
                reject,
                timeoutMs,
                createdAt: Date.now()
            });
            if (cmd) {
                this.Cmd_ExecuteString(cmd);
            }
        });
    }
    invokeWaitLogs(log) {
        const now = Date.now();
        this.waitLogs = this.waitLogs.filter(l => {
            if (log.includes(l.subLog)) {
                l.resolve(log);
                return false;
            }
            if (now - l.createdAt > l.timeoutMs) {
                l.reject(new Error('timeout'));
                return false;
            }
            return true;
        });
    }
    /**
     * Internal: bootstrap the WASM runtime.
     * - Initializes file mappings and dynamic libraries
     * - Configures canvas and renderer options
     * - Loads and initializes the Xash WASM module
     * - Sets up networking and filesystem directory
     */
    async runEm() {
        // Ensure defaults for required options
        if (!this.opts.filesMap) {
            this.opts.filesMap = {};
        }
        if (!this.opts.dynamicLibraries) {
            this.opts.dynamicLibraries = [];
        }
        if (!this.opts.arguments) {
            this.opts.arguments = [];
        }
        // Map core libraries to filesMap if overrides provided
        this.initLibrary('filesystem', DEFAULT_FILESYSTEM_LIBRARY);
        this.initLibrary('client', DEFAULT_CLIENT_LIBRARY);
        this.initLibrary('server', DEFAULT_SERVER_LIBRARY);
        this.initLibrary('menu', DEFAULT_MENU_LIBRARY);
        // Map xash library if overridden
        if (this.opts.libraries?.xash) {
            this.opts.filesMap[DEFAULT_XASH_LIBRARY] = this.opts.libraries.xash;
        }
        const canvas = this.opts?.canvas;
        // Setup renderer-specific args and map libraries
        const args = this.initRender(this.opts.renderer);
        // Prepare the list of dynamic libraries to load
        const dynamicLibraries = [
            DEFAULT_FILESYSTEM_LIBRARY,
            DEFAULT_MENU_LIBRARY,
            DEFAULT_SERVER_LIBRARY,
            DEFAULT_CLIENT_LIBRARY,
            ...this.opts.dynamicLibraries,
        ];
        // Initialize the WASM module with configured options and hooks
        this.em = await Xash({
            canvas,
            dynamicLibraries,
            net: this.net,
            locateFile: path => this.locateFile(path),
            arguments: args,
            ...(this.opts.module ?? {}),
            print: (log) => {
                this.invokeWaitLogs(log);
                this.opts.module?.print?.(log);
            },
            printErr: (log) => {
                this.invokeWaitLogs(log);
                this.opts.module?.printErr?.(log);
            },
        });
        // Initialize networking backend if present
        if (this.net) {
            this.net.init(this.em);
        }
        // Create a writable directory in the virtual filesystem
        this.em.FS.mkdir('/rwdir');
    }
}
