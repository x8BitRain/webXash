import { Em, Module } from './generated/xash';
import { Net } from "./net";
/**
 * Rendering library options.
 */
export type RenderLibrariesOptions = {
    soft?: string;
    gles3compat?: string;
};
/**
 * Configuration paths for libraries used by the engine.
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
 * Renderer types supported by Xash3D.
 */
export type Xash3DRenderer = 'gles3compat' | 'soft';
/**
 * Configuration options for the Xash3D instance.
 */
export type Xash3DOptions = {
    canvas?: HTMLCanvasElement;
    renderer?: Xash3DRenderer;
    filesMap?: Record<string, string>;
    libraries?: LibrariesOptions;
    dynamicLibraries?: string[];
    module?: Partial<Module>;
};
/**
 * Xash3D WebAssembly engine wrapper for running and controlling the game engine.
 */
export declare class Xash3D {
    /** User-defined configuration options */
    opts: Xash3DOptions;
    /** Optional networking interface */
    net?: Net;
    private _exited;
    /** Indicates whether the engine has exited */
    get exited(): boolean;
    private set exited(value);
    private _running;
    /** Indicates whether the engine is currently running */
    get running(): boolean;
    private set running(value);
    /** Internal Emscripten interface */
    em?: Em;
    /** Promise used to track module initialization */
    private emPromise?;
    /**
     * Creates a new instance of the Xash3D engine.
     * @param opts - Engine configuration options
     */
    constructor(opts?: Xash3DOptions);
    /**
     * Executes a command string within the engine.
     * @param cmd - The command string to execute
     */
    Cmd_ExecuteString(cmd: string): void;
    /**
     * Quits the engine by executing the `quit` command.
     */
    Sys_Quit(): void;
    /**
     * Initializes the engine asynchronously.
     * Awaits module setup and exits immediately if flagged.
     */
    init(): Promise<void>;
    /**
     * Starts the main engine loop, if not already running or exited.
     */
    main(): void;
    /**
     * Gracefully quits the engine, if running.
     */
    quit(): void;
    /**
     * Maps a given file path using the configured `filesMap`.
     * @param path - The original path
     * @returns Mapped path or original
     */
    private locateFile;
    /**
     * Initializes rendering context and injects render-specific dynamic libraries.
     * @param canvas - HTMLCanvasElement used for rendering
     * @param render - Renderer type to initialize
     * @returns WebGL2RenderingContext or `null` for software rendering
     */
    private initRender;
    /**
     * Sets the path for a specific core engine library, if provided.
     * @param library - The name of the library to initialize
     * @param defaultPath - The default path to use if not overridden
     */
    initLibrary(library: keyof Omit<LibrariesOptions, 'render'>, defaultPath: string): void;
    /**
     * Internal method to initialize and run the WebAssembly module.
     * Loads dynamic libraries, sets up canvas and rendering, and connects networking.
     */
    private runEm;
}
