import { Em, Module } from './generated/xash';
import { EmNet } from "./net";
/**
 * Rendering library override options.
 */
export type RenderLibrariesOptions = {
    soft?: string;
    gles3compat?: string;
    gl4es?: string;
};
/**
 * Paths for core and optional engine libraries.
 */
export type LibrariesOptions = {
    filesystem?: string;
    server?: string;
    menu?: string;
    client?: string;
    xash?: string;
    render?: RenderLibrariesOptions;
};
/**
 * Supported renderer backends for Xash3D.
 */
export type Xash3DRenderer = 'gl4es' | 'gles3compat' | 'soft';
/**
 * Options for configuring a Xash3D instance.
 */
export type Xash3DOptions = {
    canvas?: HTMLCanvasElement;
    renderer?: Xash3DRenderer;
    filesMap?: Record<string, string>;
    arguments?: string[];
    libraries?: LibrariesOptions;
    dynamicLibraries?: string[];
    module?: Partial<Module>;
};
/**
 * Reads errno from the WASM runtime.
 * @param em - Emscripten interface
 * @returns errno value or 0 if unavailable
 */
export declare function ErrNoLocation(em?: Em): number;
/**
 * High-level wrapper around the Xash3D WebAssembly engine.
 */
export declare class Xash3D {
    /** Engine configuration */
    opts: Xash3DOptions;
    /** Optional networking backend */
    net?: EmNet;
    private _exited;
    /** Array of logs to wait */
    private waitLogs;
    /** Active timers used in waitLog */
    private waitTimers;
    /** Whether the engine has exited */
    get exited(): boolean;
    private set exited(value);
    private _running;
    /** Whether the engine main loop is running */
    get running(): boolean;
    private set running(value);
    /** Underlying Emscripten runtime */
    em?: Em;
    /** Promise resolved when WASM module is fully initialized */
    private emPromise?;
    /**
     * Create a new engine instance.
     * @param opts - Engine configuration
     */
    constructor(opts?: Xash3DOptions);
    /**
     * Execute a console command inside the engine.
     * @param cmd - Command string to execute
     */
    Cmd_ExecuteString(cmd: string): void;
    /**
     * Request engine termination via the `quit` command.
     * This sends the 'quit' command to the engine console.
     */
    Sys_Quit(): void;
    /**
     * Initialize the engine runtime asynchronously.
     * If already initialized, reuses the existing initialization promise.
     * On engine exit, triggers a quit.
     */
    init(): Promise<void>;
    /**
     * Start the main engine loop.
     * No-op if engine is already running or has exited.
     */
    main(): void;
    /**
     * Shut down the engine gracefully.
     * Clears all wait timers.
     * No-op if engine already exited or is not running.
     */
    quit(): void;
    /**
     * Resolve a file path via `filesMap` if a mapping exists,
     * otherwise return the original path.
     * @param path - Original file path
     * @returns Resolved path for loading
     */
    private locateFile;
    /**
     * Configure renderer-specific libraries and arguments based on selected renderer.
     * Maps libraries to `filesMap` and adds dynamic libraries accordingly.
     * @param render - Renderer type (default: 'gl4es')
     * @returns Array of command-line arguments for the engine
     */
    private initRender;
    /**
     * Map a provided library path into `filesMap` under a default WASM FS path.
     * @param library - Library key from options
     * @param defaultPath - Default file path name in WASM FS
     */
    initLibrary(library: keyof Omit<LibrariesOptions, 'render'>, defaultPath: string): void;
    /**
     * Retrieve the value of a console variable (cvar) asynchronously.
     * Waits for the engine to log the cvar value.
     * @param name - Cvar name
     * @param timeoutMs - Timeout in milliseconds to wait for variable (default 1000ms)
     * @returns The cvar value string or empty if not found
     */
    getCVar(name: string, timeoutMs?: number): Promise<string>;
    /**
     * Wait for a log message containing the specified substring.
     * Rejects after timeout.
     * @param subLog - Substring to search in logs
     * @param cmd - Optional command to execute
     * @param timeoutMs - Timeout in milliseconds (default 1000ms)
     * @returns Promise resolving with the log message containing substring
     */
    waitLog(subLog: string, cmd?: string, timeoutMs?: number): Promise<string>;
    private invokeWaitLogs;
    /**
     * Internal: bootstrap the WASM runtime.
     * - Initializes file mappings and dynamic libraries
     * - Configures canvas and renderer options
     * - Loads and initializes the Xash WASM module
     * - Sets up networking and filesystem directory
     */
    private runEm;
}
