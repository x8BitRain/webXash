var Xash3D = (() => {
    var _scriptName = typeof document != "undefined" ? document.currentScript?.src : undefined;
    return async function (moduleArg = {}) {
        var moduleRtn;
        var Module = moduleArg;
        var ENVIRONMENT_IS_WEB = true;
        var ENVIRONMENT_IS_WORKER = false;
        var ENVIRONMENT_IS_NODE = false;
        var ENVIRONMENT_IS_SHELL = false;
        var arguments_ = [];
        var thisProgram = "./this.program";
        var quit_ = (status, toThrow) => { throw toThrow; };
        var scriptDirectory = "";
        function locateFile(path) { if (Module["locateFile"]) {
            return Module["locateFile"](path, scriptDirectory);
        } return scriptDirectory + path; }
        var readAsync, readBinary;
        if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
            try {
                scriptDirectory = new URL(".", _scriptName).href;
            }
            catch { }
            {
                readAsync = async (url) => { var response = await fetch(url, { credentials: "same-origin" }); if (response.ok) {
                    return response.arrayBuffer();
                } throw new Error(response.status + " : " + response.url); };
            }
        }
        else { }
        var out = console.log.bind(console);
        var err = console.error.bind(console);
        var dynamicLibraries = [];
        var wasmBinary;
        var ABORT = false;
        var EXITSTATUS;
        function assert(condition, text) { if (!condition) {
            abort(text);
        } }
        var isFileURI = filename => filename.startsWith("file://");
        function writeStackCookie() { var max = _emscripten_stack_get_end(); if (max == 0) {
            max += 4;
        } HEAPU32[max >> 2] = 34821223; HEAPU32[max + 4 >> 2] = 2310721022; HEAPU32[0 >> 2] = 1668509029; }
        function checkStackCookie() { if (ABORT)
            return; var max = _emscripten_stack_get_end(); if (max == 0) {
            max += 4;
        } var cookie1 = HEAPU32[max >> 2]; var cookie2 = HEAPU32[max + 4 >> 2]; if (cookie1 != 34821223 || cookie2 != 2310721022) {
            abort(`Stack overflow! Stack cookie has been overwritten at ${ptrToString(max)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${ptrToString(cookie2)} ${ptrToString(cookie1)}`);
        } if (HEAPU32[0 >> 2] != 1668509029) {
            abort("Runtime error: The application has corrupted its heap memory area (address zero)!");
        } }
        var readyPromiseResolve, readyPromiseReject;
        var wasmMemory;
        var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
        var HEAP64, HEAPU64;
        var runtimeInitialized = false;
        function updateMemoryViews() { var b = wasmMemory.buffer; HEAP8 = new Int8Array(b); HEAP16 = new Int16Array(b); HEAPU8 = new Uint8Array(b); HEAPU16 = new Uint16Array(b); HEAP32 = new Int32Array(b); HEAPU32 = new Uint32Array(b); HEAPF32 = new Float32Array(b); HEAPF64 = new Float64Array(b); HEAP64 = new BigInt64Array(b); HEAPU64 = new BigUint64Array(b); }
        function initMemory() { if (Module["wasmMemory"]) {
            wasmMemory = Module["wasmMemory"];
        }
        else {
            var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 134217728;
            wasmMemory = new WebAssembly.Memory({ initial: INITIAL_MEMORY / 65536, maximum: 32768 });
        } updateMemoryViews(); }
        var __RELOC_FUNCS__ = [];
        function preRun() { if (Module["preRun"]) {
            if (typeof Module["preRun"] == "function")
                Module["preRun"] = [Module["preRun"]];
            while (Module["preRun"].length) {
                addOnPreRun(Module["preRun"].shift());
            }
        } callRuntimeCallbacks(onPreRuns); }
        function initRuntime() { runtimeInitialized = true; checkStackCookie(); callRuntimeCallbacks(__RELOC_FUNCS__); callRuntimeCallbacks(onInits); if (!Module["noFSInit"] && !FS.initialized)
            FS.init(); TTY.init(); SOCKFS.root = FS.mount(SOCKFS, {}, null); PIPEFS.root = FS.mount(PIPEFS, {}, null); wasmExports["__wasm_call_ctors"](); callRuntimeCallbacks(onPostCtors); FS.ignorePermissions = false; }
        function preMain() { checkStackCookie(); callRuntimeCallbacks(onMains); }
        function postRun() { checkStackCookie(); if (Module["postRun"]) {
            if (typeof Module["postRun"] == "function")
                Module["postRun"] = [Module["postRun"]];
            while (Module["postRun"].length) {
                addOnPostRun(Module["postRun"].shift());
            }
        } callRuntimeCallbacks(onPostRuns); }
        var runDependencies = 0;
        var dependenciesFulfilled = null;
        function addRunDependency(id) { runDependencies++; Module["monitorRunDependencies"]?.(runDependencies); }
        function removeRunDependency(id) { runDependencies--; Module["monitorRunDependencies"]?.(runDependencies); if (runDependencies == 0) {
            if (dependenciesFulfilled) {
                var callback = dependenciesFulfilled;
                dependenciesFulfilled = null;
                callback();
            }
        } }
        function abort(what) { Module["onAbort"]?.(what); what = "Aborted(" + what + ")"; err(what); ABORT = true; what += ". Build with -sASSERTIONS for more info."; var e = new WebAssembly.RuntimeError(what); readyPromiseReject?.(e); throw e; }
        var wasmBinaryFile;
        function findWasmBinary() { return locateFile("xash.wasm"); }
        function getBinarySync(file) { if (file == wasmBinaryFile && wasmBinary) {
            return new Uint8Array(wasmBinary);
        } if (readBinary) {
            return readBinary(file);
        } throw "both async and sync fetching of the wasm failed"; }
        async function getWasmBinary(binaryFile) { if (!wasmBinary) {
            try {
                var response = await readAsync(binaryFile);
                return new Uint8Array(response);
            }
            catch { }
        } return getBinarySync(binaryFile); }
        async function instantiateArrayBuffer(binaryFile, imports) { try {
            var binary = await getWasmBinary(binaryFile);
            var instance = await WebAssembly.instantiate(binary, imports);
            return instance;
        }
        catch (reason) {
            err(`failed to asynchronously prepare wasm: ${reason}`);
            abort(reason);
        } }
        async function instantiateAsync(binary, binaryFile, imports) { if (!binary && typeof WebAssembly.instantiateStreaming == "function") {
            try {
                var response = fetch(binaryFile, { credentials: "same-origin" });
                var instantiationResult = await WebAssembly.instantiateStreaming(response, imports);
                return instantiationResult;
            }
            catch (reason) {
                err(`wasm streaming compile failed: ${reason}`);
                err("falling back to ArrayBuffer instantiation");
            }
        } return instantiateArrayBuffer(binaryFile, imports); }
        function getWasmImports() { return { env: wasmImports, wasi_snapshot_preview1: wasmImports, "GOT.mem": new Proxy(wasmImports, GOTHandler), "GOT.func": new Proxy(wasmImports, GOTHandler) }; }
        async function createWasm() { function receiveInstance(instance, module) { wasmExports = instance.exports; wasmExports = relocateExports(wasmExports, 1024); var metadata = getDylinkMetadata(module); if (metadata.neededDynlibs) {
            dynamicLibraries = metadata.neededDynlibs.concat(dynamicLibraries);
        } mergeLibSymbols(wasmExports, "main"); LDSO.init(); loadDylibs(); __RELOC_FUNCS__.push(wasmExports["__wasm_apply_data_relocs"]); assignWasmExports(wasmExports); removeRunDependency("wasm-instantiate"); return wasmExports; } addRunDependency("wasm-instantiate"); function receiveInstantiationResult(result) { return receiveInstance(result["instance"], result["module"]); } var info = getWasmImports(); if (Module["instantiateWasm"]) {
            return new Promise((resolve, reject) => { Module["instantiateWasm"](info, (mod, inst) => { resolve(receiveInstance(mod, inst)); }); });
        } wasmBinaryFile ?? (wasmBinaryFile = findWasmBinary()); var result = await instantiateAsync(wasmBinary, wasmBinaryFile, info); var exports = receiveInstantiationResult(result); return exports; }
        class ExitStatus {
            constructor(status) {
                this.name = "ExitStatus";
                this.message = `Program terminated with exit(${status})`;
                this.status = status;
            }
        }
        var GOT = {};
        var currentModuleWeakSymbols = new Set(["__start___llvm_prf_data", "__stop___llvm_prf_data", "__start___llvm_prf_names", "__stop___llvm_prf_names", "__start___llvm_prf_vns", "__stop___llvm_prf_vns", "__start___llvm_prf_vtab", "__stop___llvm_prf_vtab", "__start___llvm_prf_cnts", "__stop___llvm_prf_cnts", "__start___llvm_prf_bits", "__stop___llvm_prf_bits", "__start___llvm_prf_vnds", "__stop___llvm_prf_vnds"]);
        var GOTHandler = { get(obj, symName) { var rtn = GOT[symName]; if (!rtn) {
                rtn = GOT[symName] = new WebAssembly.Global({ value: "i32", mutable: true });
            } if (!currentModuleWeakSymbols.has(symName)) {
                rtn.required = true;
            } return rtn; } };
        var callRuntimeCallbacks = callbacks => { while (callbacks.length > 0) {
            callbacks.shift()(Module);
        } };
        var onPostRuns = [];
        var addOnPostRun = cb => onPostRuns.push(cb);
        var onPreRuns = [];
        var addOnPreRun = cb => onPreRuns.push(cb);
        var UTF8Decoder = new TextDecoder;
        var findStringEnd = (heapOrArray, idx, maxBytesToRead, ignoreNul) => { var maxIdx = idx + maxBytesToRead; if (ignoreNul)
            return maxIdx; while (heapOrArray[idx] && !(idx >= maxIdx))
            ++idx; return idx; };
        var UTF8ArrayToString = (heapOrArray, idx = 0, maxBytesToRead, ignoreNul) => { var endPtr = findStringEnd(heapOrArray, idx, maxBytesToRead, ignoreNul); return UTF8Decoder.decode(heapOrArray.buffer ? heapOrArray.subarray(idx, endPtr) : new Uint8Array(heapOrArray.slice(idx, endPtr))); };
        var getDylinkMetadata = binary => { var offset = 0; var end = 0; function getU8() { return binary[offset++]; } function getLEB() { var ret = 0; var mul = 1; while (1) {
            var byte = binary[offset++];
            ret += (byte & 127) * mul;
            mul *= 128;
            if (!(byte & 128))
                break;
        } return ret; } function getString() { var len = getLEB(); offset += len; return UTF8ArrayToString(binary, offset - len, len); } function getStringList() { var count = getLEB(); var rtn = []; while (count--)
            rtn.push(getString()); return rtn; } function failIf(condition, message) { if (condition)
            throw new Error(message); } if (binary instanceof WebAssembly.Module) {
            var dylinkSection = WebAssembly.Module.customSections(binary, "dylink.0");
            failIf(dylinkSection.length === 0, "need dylink section");
            binary = new Uint8Array(dylinkSection[0]);
            end = binary.length;
        }
        else {
            var int32View = new Uint32Array(new Uint8Array(binary.subarray(0, 24)).buffer);
            var magicNumberFound = int32View[0] == 1836278016;
            failIf(!magicNumberFound, "need to see wasm magic number");
            failIf(binary[8] !== 0, "need the dylink section to be first");
            offset = 9;
            var section_size = getLEB();
            end = offset + section_size;
            var name = getString();
            failIf(name !== "dylink.0");
        } var customSection = { neededDynlibs: [], tlsExports: new Set, weakImports: new Set, runtimePaths: [] }; var WASM_DYLINK_MEM_INFO = 1; var WASM_DYLINK_NEEDED = 2; var WASM_DYLINK_EXPORT_INFO = 3; var WASM_DYLINK_IMPORT_INFO = 4; var WASM_DYLINK_RUNTIME_PATH = 5; var WASM_SYMBOL_TLS = 256; var WASM_SYMBOL_BINDING_MASK = 3; var WASM_SYMBOL_BINDING_WEAK = 1; while (offset < end) {
            var subsectionType = getU8();
            var subsectionSize = getLEB();
            if (subsectionType === WASM_DYLINK_MEM_INFO) {
                customSection.memorySize = getLEB();
                customSection.memoryAlign = getLEB();
                customSection.tableSize = getLEB();
                customSection.tableAlign = getLEB();
            }
            else if (subsectionType === WASM_DYLINK_NEEDED) {
                customSection.neededDynlibs = getStringList();
            }
            else if (subsectionType === WASM_DYLINK_EXPORT_INFO) {
                var count = getLEB();
                while (count--) {
                    var symname = getString();
                    var flags = getLEB();
                    if (flags & WASM_SYMBOL_TLS) {
                        customSection.tlsExports.add(symname);
                    }
                }
            }
            else if (subsectionType === WASM_DYLINK_IMPORT_INFO) {
                var count = getLEB();
                while (count--) {
                    var modname = getString();
                    var symname = getString();
                    var flags = getLEB();
                    if ((flags & WASM_SYMBOL_BINDING_MASK) == WASM_SYMBOL_BINDING_WEAK) {
                        customSection.weakImports.add(symname);
                    }
                }
            }
            else if (subsectionType === WASM_DYLINK_RUNTIME_PATH) {
                customSection.runtimePaths = getStringList();
            }
            else {
                offset += subsectionSize;
            }
        } return customSection; };
        function getValue(ptr, type = "i8") { if (type.endsWith("*"))
            type = "*"; switch (type) {
            case "i1": return HEAP8[ptr];
            case "i8": return HEAP8[ptr];
            case "i16": return HEAP16[ptr >> 1];
            case "i32": return HEAP32[ptr >> 2];
            case "i64": return HEAP64[ptr >> 3];
            case "float": return HEAPF32[ptr >> 2];
            case "double": return HEAPF64[ptr >> 3];
            case "*": return HEAPU32[ptr >> 2];
            default: abort(`invalid type for getValue: ${type}`);
        } }
        var newDSO = (name, handle, syms) => { var dso = { refcount: Infinity, name, exports: syms, global: true }; LDSO.loadedLibsByName[name] = dso; if (handle != undefined) {
            LDSO.loadedLibsByHandle[handle] = dso;
        } return dso; };
        var LDSO = { loadedLibsByName: {}, loadedLibsByHandle: {}, init() { newDSO("__main__", 0, wasmImports); } };
        var ___heap_base = 33286528;
        var alignMemory = (size, alignment) => Math.ceil(size / alignment) * alignment;
        var getMemory = size => { if (runtimeInitialized) {
            return _calloc(size, 1);
        } var ret = ___heap_base; var end = ret + alignMemory(size, 16); ___heap_base = end; GOT["__heap_base"].value = end; return ret; };
        var isInternalSym = symName => ["__cpp_exception", "__c_longjmp", "__wasm_apply_data_relocs", "__dso_handle", "__tls_size", "__tls_align", "__set_stack_limits", "_emscripten_tls_init", "__wasm_init_tls", "__wasm_call_ctors", "__start_em_asm", "__stop_em_asm", "__start_em_js", "__stop_em_js"].includes(symName) || symName.startsWith("__em_js__");
        var uleb128EncodeWithLen = arr => { const n = arr.length; return [n % 128 | 128, n >> 7, ...arr]; };
        var wasmTypeCodes = { i: 127, p: 127, j: 126, f: 125, d: 124, e: 111 };
        var generateTypePack = types => uleb128EncodeWithLen(Array.from(types, type => { var code = wasmTypeCodes[type]; return code; }));
        var convertJsFunctionToWasm = (func, sig) => { var bytes = Uint8Array.of(0, 97, 115, 109, 1, 0, 0, 0, 1, ...uleb128EncodeWithLen([1, 96, ...generateTypePack(sig.slice(1)), ...generateTypePack(sig[0] === "v" ? "" : sig[0])]), 2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0); var module = new WebAssembly.Module(bytes); var instance = new WebAssembly.Instance(module, { e: { f: func } }); var wrappedFunc = instance.exports["f"]; return wrappedFunc; };
        var wasmTable = new WebAssembly.Table({ initial: 2727, element: "anyfunc" });
        var getWasmTableEntry = funcPtr => wasmTable.get(funcPtr);
        var updateTableMap = (offset, count) => { if (functionsInTableMap) {
            for (var i = offset; i < offset + count; i++) {
                var item = getWasmTableEntry(i);
                if (item) {
                    functionsInTableMap.set(item, i);
                }
            }
        } };
        var functionsInTableMap;
        var getFunctionAddress = func => { if (!functionsInTableMap) {
            functionsInTableMap = new WeakMap;
            updateTableMap(0, wasmTable.length);
        } return functionsInTableMap.get(func) || 0; };
        var freeTableIndexes = [];
        var getEmptyTableSlot = () => { if (freeTableIndexes.length) {
            return freeTableIndexes.pop();
        } return wasmTable["grow"](1); };
        var setWasmTableEntry = (idx, func) => wasmTable.set(idx, func);
        var addFunction = (func, sig) => { var rtn = getFunctionAddress(func); if (rtn) {
            return rtn;
        } var ret = getEmptyTableSlot(); try {
            setWasmTableEntry(ret, func);
        }
        catch (err) {
            if (!(err instanceof TypeError)) {
                throw err;
            }
            var wrapped = convertJsFunctionToWasm(func, sig);
            setWasmTableEntry(ret, wrapped);
        } functionsInTableMap.set(func, ret); return ret; };
        var updateGOT = (exports, replace) => { for (var symName in exports) {
            if (isInternalSym(symName)) {
                continue;
            }
            var value = exports[symName];
            GOT[symName] || (GOT[symName] = new WebAssembly.Global({ value: "i32", mutable: true }));
            if (replace || GOT[symName].value == 0) {
                if (typeof value == "function") {
                    GOT[symName].value = addFunction(value);
                }
                else if (typeof value == "number") {
                    GOT[symName].value = value;
                }
                else {
                    err(`unhandled export type for '${symName}': ${typeof value}`);
                }
            }
        } };
        var relocateExports = (exports, memoryBase, replace) => { var relocated = {}; for (var e in exports) {
            var value = exports[e];
            if (typeof value == "object") {
                value = value.value;
            }
            if (typeof value == "number") {
                value += memoryBase;
            }
            relocated[e] = value;
        } updateGOT(relocated, replace); return relocated; };
        var isSymbolDefined = symName => { var existing = wasmImports[symName]; if (!existing || existing.stub) {
            return false;
        } return true; };
        var dynCall = (sig, ptr, args = [], promising = false) => { var func = getWasmTableEntry(ptr); var rtn = func(...args); function convert(rtn) { return rtn; } return convert(rtn); };
        var stackSave = () => _emscripten_stack_get_current();
        var stackRestore = val => __emscripten_stack_restore(val);
        var createInvokeFunction = sig => (ptr, ...args) => { var sp = stackSave(); try {
            return dynCall(sig, ptr, args);
        }
        catch (e) {
            stackRestore(sp);
            if (e !== e + 0)
                throw e;
            _setThrew(1, 0);
            if (sig[0] == "j")
                return 0n;
        } };
        var resolveGlobalSymbol = (symName, direct = false) => { var sym; if (isSymbolDefined(symName)) {
            sym = wasmImports[symName];
        }
        else if (symName.startsWith("invoke_")) {
            sym = wasmImports[symName] = createInvokeFunction(symName.split("_")[1]);
        } return { sym, name: symName }; };
        var onPostCtors = [];
        var addOnPostCtor = cb => onPostCtors.push(cb);
        var UTF8ToString = (ptr, maxBytesToRead, ignoreNul) => { if (!ptr)
            return ""; var end = findStringEnd(HEAPU8, ptr, maxBytesToRead, ignoreNul); return UTF8Decoder.decode(HEAPU8.subarray(ptr, end)); };
        var loadWebAssemblyModule = (binary, flags, libName, localScope, handle) => { var metadata = getDylinkMetadata(binary); currentModuleWeakSymbols = metadata.weakImports; function loadModule() { var memAlign = Math.pow(2, metadata.memoryAlign); var memoryBase = metadata.memorySize ? alignMemory(getMemory(metadata.memorySize + memAlign), memAlign) : 0; var tableBase = metadata.tableSize ? wasmTable.length : 0; if (handle) {
            HEAP8[handle + 8] = 1;
            HEAPU32[handle + 12 >> 2] = memoryBase;
            HEAP32[handle + 16 >> 2] = metadata.memorySize;
            HEAPU32[handle + 20 >> 2] = tableBase;
            HEAP32[handle + 24 >> 2] = metadata.tableSize;
        } if (metadata.tableSize) {
            wasmTable.grow(metadata.tableSize);
        } var moduleExports; function resolveSymbol(sym) { var resolved = resolveGlobalSymbol(sym).sym; if (!resolved && localScope) {
            resolved = localScope[sym];
        } if (!resolved) {
            resolved = moduleExports[sym];
        } return resolved; } var proxyHandler = { get(stubs, prop) { switch (prop) {
                case "__memory_base": return memoryBase;
                case "__table_base": return tableBase;
            } if (prop in wasmImports && !wasmImports[prop].stub) {
                var res = wasmImports[prop];
                return res;
            } if (!(prop in stubs)) {
                var resolved;
                stubs[prop] = (...args) => { resolved || (resolved = resolveSymbol(prop)); return resolved(...args); };
            } return stubs[prop]; } }; var proxy = new Proxy({}, proxyHandler); var info = { "GOT.mem": new Proxy({}, GOTHandler), "GOT.func": new Proxy({}, GOTHandler), env: proxy, wasi_snapshot_preview1: proxy }; function postInstantiation(module, instance) { updateTableMap(tableBase, metadata.tableSize); moduleExports = relocateExports(instance.exports, memoryBase); if (!flags.allowUndefined) {
            reportUndefinedSymbols();
        } function addEmAsm(addr, body) { var args = []; var arity = 0; for (; arity < 16; arity++) {
            if (body.indexOf("$" + arity) != -1) {
                args.push("$" + arity);
            }
            else {
                break;
            }
        } args = args.join(","); var func = `(${args}) => { ${body} };`; ASM_CONSTS[start] = eval(func); } if ("__start_em_asm" in moduleExports) {
            var start = moduleExports["__start_em_asm"];
            var stop = moduleExports["__stop_em_asm"];
            while (start < stop) {
                var jsString = UTF8ToString(start);
                addEmAsm(start, jsString);
                start = HEAPU8.indexOf(0, start) + 1;
            }
        } function addEmJs(name, cSig, body) { var jsArgs = []; cSig = cSig.slice(1, -1); if (cSig != "void") {
            cSig = cSig.split(",");
            for (var i in cSig) {
                var jsArg = cSig[i].split(" ").pop();
                jsArgs.push(jsArg.replace("*", ""));
            }
        } var func = `(${jsArgs}) => ${body};`; moduleExports[name] = eval(func); } for (var name in moduleExports) {
            if (name.startsWith("__em_js__")) {
                var start = moduleExports[name];
                var jsString = UTF8ToString(start);
                var parts = jsString.split("<::>");
                addEmJs(name.replace("__em_js__", ""), parts[0], parts[1]);
                delete moduleExports[name];
            }
        } var applyRelocs = moduleExports["__wasm_apply_data_relocs"]; if (applyRelocs) {
            if (runtimeInitialized) {
                applyRelocs();
            }
            else {
                __RELOC_FUNCS__.push(applyRelocs);
            }
        } var init = moduleExports["__wasm_call_ctors"]; if (init) {
            if (runtimeInitialized) {
                init();
            }
            else {
                addOnPostCtor(init);
            }
        } return moduleExports; } if (flags.loadAsync) {
            return (async () => { var instance; if (binary instanceof WebAssembly.Module) {
                instance = new WebAssembly.Instance(binary, info);
            }
            else {
                ({ module: binary, instance } = await WebAssembly.instantiate(binary, info));
            } return postInstantiation(binary, instance); })();
        } var module = binary instanceof WebAssembly.Module ? binary : new WebAssembly.Module(binary); var instance = new WebAssembly.Instance(module, info); return postInstantiation(module, instance); } flags = { ...flags, rpath: { parentLibPath: libName, paths: metadata.runtimePaths } }; if (flags.loadAsync) {
            return metadata.neededDynlibs.reduce((chain, dynNeeded) => chain.then(() => loadDynamicLibrary(dynNeeded, flags, localScope)), Promise.resolve()).then(loadModule);
        } metadata.neededDynlibs.forEach(needed => loadDynamicLibrary(needed, flags, localScope)); return loadModule(); };
        var mergeLibSymbols = (exports, libName) => { for (var [sym, exp] of Object.entries(exports)) {
            const setImport = target => { if (!isSymbolDefined(target)) {
                wasmImports[target] = exp;
            } };
            setImport(sym);
            const main_alias = "__main_argc_argv";
            if (sym == "main") {
                setImport(main_alias);
            }
            if (sym == main_alias) {
                setImport("main");
            }
        } };
        var asyncLoad = async (url) => { var arrayBuffer = await readAsync(url); return new Uint8Array(arrayBuffer); };
        var preloadPlugins = [];
        var registerWasmPlugin = () => { var wasmPlugin = { promiseChainEnd: Promise.resolve(), canHandle: name => !Module["noWasmDecoding"] && name.endsWith(".so"), handle: (byteArray, name, onload, onerror) => { wasmPlugin["promiseChainEnd"] = wasmPlugin["promiseChainEnd"].then(() => loadWebAssemblyModule(byteArray, { loadAsync: true, nodelete: true }, name, {})).then(exports => { preloadedWasm[name] = exports; onload(byteArray); }, error => { err(`failed to instantiate wasm: ${name}: ${error}`); onerror(); }); } }; preloadPlugins.push(wasmPlugin); };
        var preloadedWasm = {};
        var PATH = { isAbs: path => path.charAt(0) === "/", splitPath: filename => { var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/; return splitPathRe.exec(filename).slice(1); }, normalizeArray: (parts, allowAboveRoot) => { var up = 0; for (var i = parts.length - 1; i >= 0; i--) {
                var last = parts[i];
                if (last === ".") {
                    parts.splice(i, 1);
                }
                else if (last === "..") {
                    parts.splice(i, 1);
                    up++;
                }
                else if (up) {
                    parts.splice(i, 1);
                    up--;
                }
            } if (allowAboveRoot) {
                for (; up; up--) {
                    parts.unshift("..");
                }
            } return parts; }, normalize: path => { var isAbsolute = PATH.isAbs(path), trailingSlash = path.slice(-1) === "/"; path = PATH.normalizeArray(path.split("/").filter(p => !!p), !isAbsolute).join("/"); if (!path && !isAbsolute) {
                path = ".";
            } if (path && trailingSlash) {
                path += "/";
            } return (isAbsolute ? "/" : "") + path; }, dirname: path => { var result = PATH.splitPath(path), root = result[0], dir = result[1]; if (!root && !dir) {
                return ".";
            } if (dir) {
                dir = dir.slice(0, -1);
            } return root + dir; }, basename: path => path && path.match(/([^\/]+|\/)\/*$/)[1], join: (...paths) => PATH.normalize(paths.join("/")), join2: (l, r) => PATH.normalize(l + "/" + r) };
        var replaceORIGIN = (parentLibName, rpath) => { if (rpath.startsWith("$ORIGIN")) {
            var origin = PATH.dirname(parentLibName);
            return rpath.replace("$ORIGIN", origin);
        } return rpath; };
        var withStackSave = f => { var stack = stackSave(); var ret = f(); stackRestore(stack); return ret; };
        var stackAlloc = sz => __emscripten_stack_alloc(sz);
        var lengthBytesUTF8 = str => { var len = 0; for (var i = 0; i < str.length; ++i) {
            var c = str.charCodeAt(i);
            if (c <= 127) {
                len++;
            }
            else if (c <= 2047) {
                len += 2;
            }
            else if (c >= 55296 && c <= 57343) {
                len += 4;
                ++i;
            }
            else {
                len += 3;
            }
        } return len; };
        var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => { if (!(maxBytesToWrite > 0))
            return 0; var startIdx = outIdx; var endIdx = outIdx + maxBytesToWrite - 1; for (var i = 0; i < str.length; ++i) {
            var u = str.codePointAt(i);
            if (u <= 127) {
                if (outIdx >= endIdx)
                    break;
                heap[outIdx++] = u;
            }
            else if (u <= 2047) {
                if (outIdx + 1 >= endIdx)
                    break;
                heap[outIdx++] = 192 | u >> 6;
                heap[outIdx++] = 128 | u & 63;
            }
            else if (u <= 65535) {
                if (outIdx + 2 >= endIdx)
                    break;
                heap[outIdx++] = 224 | u >> 12;
                heap[outIdx++] = 128 | u >> 6 & 63;
                heap[outIdx++] = 128 | u & 63;
            }
            else {
                if (outIdx + 3 >= endIdx)
                    break;
                heap[outIdx++] = 240 | u >> 18;
                heap[outIdx++] = 128 | u >> 12 & 63;
                heap[outIdx++] = 128 | u >> 6 & 63;
                heap[outIdx++] = 128 | u & 63;
                i++;
            }
        } heap[outIdx] = 0; return outIdx - startIdx; };
        var stringToUTF8 = (str, outPtr, maxBytesToWrite) => stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
        var stringToUTF8OnStack = str => { var size = lengthBytesUTF8(str) + 1; var ret = stackAlloc(size); stringToUTF8(str, ret, size); return ret; };
        var initRandomFill = () => view => crypto.getRandomValues(view);
        var randomFill = view => { (randomFill = initRandomFill())(view); };
        var PATH_FS = { resolve: (...args) => { var resolvedPath = "", resolvedAbsolute = false; for (var i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
                var path = i >= 0 ? args[i] : FS.cwd();
                if (typeof path != "string") {
                    throw new TypeError("Arguments to path.resolve must be strings");
                }
                else if (!path) {
                    return "";
                }
                resolvedPath = path + "/" + resolvedPath;
                resolvedAbsolute = PATH.isAbs(path);
            } resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter(p => !!p), !resolvedAbsolute).join("/"); return (resolvedAbsolute ? "/" : "") + resolvedPath || "."; }, relative: (from, to) => { from = PATH_FS.resolve(from).slice(1); to = PATH_FS.resolve(to).slice(1); function trim(arr) { var start = 0; for (; start < arr.length; start++) {
                if (arr[start] !== "")
                    break;
            } var end = arr.length - 1; for (; end >= 0; end--) {
                if (arr[end] !== "")
                    break;
            } if (start > end)
                return []; return arr.slice(start, end - start + 1); } var fromParts = trim(from.split("/")); var toParts = trim(to.split("/")); var length = Math.min(fromParts.length, toParts.length); var samePartsLength = length; for (var i = 0; i < length; i++) {
                if (fromParts[i] !== toParts[i]) {
                    samePartsLength = i;
                    break;
                }
            } var outputParts = []; for (var i = samePartsLength; i < fromParts.length; i++) {
                outputParts.push("..");
            } outputParts = outputParts.concat(toParts.slice(samePartsLength)); return outputParts.join("/"); } };
        var FS_stdin_getChar_buffer = [];
        var intArrayFromString = (stringy, dontAddNull, length) => { var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1; var u8array = new Array(len); var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length); if (dontAddNull)
            u8array.length = numBytesWritten; return u8array; };
        var FS_stdin_getChar = () => { if (!FS_stdin_getChar_buffer.length) {
            var result = null;
            if (typeof window != "undefined" && typeof window.prompt == "function") {
                result = window.prompt("Input: ");
                if (result !== null) {
                    result += "\n";
                }
            }
            else { }
            if (!result) {
                return null;
            }
            FS_stdin_getChar_buffer = intArrayFromString(result, true);
        } return FS_stdin_getChar_buffer.shift(); };
        var TTY = { ttys: [], init() { }, shutdown() { }, register(dev, ops) { TTY.ttys[dev] = { input: [], output: [], ops }; FS.registerDevice(dev, TTY.stream_ops); }, stream_ops: { open(stream) { var tty = TTY.ttys[stream.node.rdev]; if (!tty) {
                    throw new FS.ErrnoError(43);
                } stream.tty = tty; stream.seekable = false; }, close(stream) { stream.tty.ops.fsync(stream.tty); }, fsync(stream) { stream.tty.ops.fsync(stream.tty); }, read(stream, buffer, offset, length, pos) { if (!stream.tty || !stream.tty.ops.get_char) {
                    throw new FS.ErrnoError(60);
                } var bytesRead = 0; for (var i = 0; i < length; i++) {
                    var result;
                    try {
                        result = stream.tty.ops.get_char(stream.tty);
                    }
                    catch (e) {
                        throw new FS.ErrnoError(29);
                    }
                    if (result === undefined && bytesRead === 0) {
                        throw new FS.ErrnoError(6);
                    }
                    if (result === null || result === undefined)
                        break;
                    bytesRead++;
                    buffer[offset + i] = result;
                } if (bytesRead) {
                    stream.node.atime = Date.now();
                } return bytesRead; }, write(stream, buffer, offset, length, pos) { if (!stream.tty || !stream.tty.ops.put_char) {
                    throw new FS.ErrnoError(60);
                } try {
                    for (var i = 0; i < length; i++) {
                        stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
                    }
                }
                catch (e) {
                    throw new FS.ErrnoError(29);
                } if (length) {
                    stream.node.mtime = stream.node.ctime = Date.now();
                } return i; } }, default_tty_ops: { get_char(tty) { return FS_stdin_getChar(); }, put_char(tty, val) { if (val === null || val === 10) {
                    out(UTF8ArrayToString(tty.output));
                    tty.output = [];
                }
                else {
                    if (val != 0)
                        tty.output.push(val);
                } }, fsync(tty) { if (tty.output?.length > 0) {
                    out(UTF8ArrayToString(tty.output));
                    tty.output = [];
                } }, ioctl_tcgets(tty) { return { c_iflag: 25856, c_oflag: 5, c_cflag: 191, c_lflag: 35387, c_cc: [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }; }, ioctl_tcsets(tty, optional_actions, data) { return 0; }, ioctl_tiocgwinsz(tty) { return [24, 80]; } }, default_tty1_ops: { put_char(tty, val) { if (val === null || val === 10) {
                    err(UTF8ArrayToString(tty.output));
                    tty.output = [];
                }
                else {
                    if (val != 0)
                        tty.output.push(val);
                } }, fsync(tty) { if (tty.output?.length > 0) {
                    err(UTF8ArrayToString(tty.output));
                    tty.output = [];
                } } } };
        var zeroMemory = (ptr, size) => HEAPU8.fill(0, ptr, ptr + size);
        var mmapAlloc = size => { size = alignMemory(size, 65536); var ptr = _emscripten_builtin_memalign(65536, size); if (ptr)
            zeroMemory(ptr, size); return ptr; };
        var MEMFS = { ops_table: null, mount(mount) { return MEMFS.createNode(null, "/", 16895, 0); }, createNode(parent, name, mode, dev) { if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
                throw new FS.ErrnoError(63);
            } MEMFS.ops_table || (MEMFS.ops_table = { dir: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr, lookup: MEMFS.node_ops.lookup, mknod: MEMFS.node_ops.mknod, rename: MEMFS.node_ops.rename, unlink: MEMFS.node_ops.unlink, rmdir: MEMFS.node_ops.rmdir, readdir: MEMFS.node_ops.readdir, symlink: MEMFS.node_ops.symlink }, stream: { llseek: MEMFS.stream_ops.llseek } }, file: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr }, stream: { llseek: MEMFS.stream_ops.llseek, read: MEMFS.stream_ops.read, write: MEMFS.stream_ops.write, mmap: MEMFS.stream_ops.mmap, msync: MEMFS.stream_ops.msync } }, link: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr, readlink: MEMFS.node_ops.readlink }, stream: {} }, chrdev: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr }, stream: FS.chrdev_stream_ops } }); var node = FS.createNode(parent, name, mode, dev); if (FS.isDir(node.mode)) {
                node.node_ops = MEMFS.ops_table.dir.node;
                node.stream_ops = MEMFS.ops_table.dir.stream;
                node.contents = {};
            }
            else if (FS.isFile(node.mode)) {
                node.node_ops = MEMFS.ops_table.file.node;
                node.stream_ops = MEMFS.ops_table.file.stream;
                node.usedBytes = 0;
                node.contents = null;
            }
            else if (FS.isLink(node.mode)) {
                node.node_ops = MEMFS.ops_table.link.node;
                node.stream_ops = MEMFS.ops_table.link.stream;
            }
            else if (FS.isChrdev(node.mode)) {
                node.node_ops = MEMFS.ops_table.chrdev.node;
                node.stream_ops = MEMFS.ops_table.chrdev.stream;
            } node.atime = node.mtime = node.ctime = Date.now(); if (parent) {
                parent.contents[name] = node;
                parent.atime = parent.mtime = parent.ctime = node.atime;
            } return node; }, getFileDataAsTypedArray(node) { if (!node.contents)
                return new Uint8Array(0); if (node.contents.subarray)
                return node.contents.subarray(0, node.usedBytes); return new Uint8Array(node.contents); }, expandFileStorage(node, newCapacity) { var prevCapacity = node.contents ? node.contents.length : 0; if (prevCapacity >= newCapacity)
                return; var CAPACITY_DOUBLING_MAX = 1024 * 1024; newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) >>> 0); if (prevCapacity != 0)
                newCapacity = Math.max(newCapacity, 256); var oldContents = node.contents; node.contents = new Uint8Array(newCapacity); if (node.usedBytes > 0)
                node.contents.set(oldContents.subarray(0, node.usedBytes), 0); }, resizeFileStorage(node, newSize) { if (node.usedBytes == newSize)
                return; if (newSize == 0) {
                node.contents = null;
                node.usedBytes = 0;
            }
            else {
                var oldContents = node.contents;
                node.contents = new Uint8Array(newSize);
                if (oldContents) {
                    node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
                }
                node.usedBytes = newSize;
            } }, node_ops: { getattr(node) { var attr = {}; attr.dev = FS.isChrdev(node.mode) ? node.id : 1; attr.ino = node.id; attr.mode = node.mode; attr.nlink = 1; attr.uid = 0; attr.gid = 0; attr.rdev = node.rdev; if (FS.isDir(node.mode)) {
                    attr.size = 4096;
                }
                else if (FS.isFile(node.mode)) {
                    attr.size = node.usedBytes;
                }
                else if (FS.isLink(node.mode)) {
                    attr.size = node.link.length;
                }
                else {
                    attr.size = 0;
                } attr.atime = new Date(node.atime); attr.mtime = new Date(node.mtime); attr.ctime = new Date(node.ctime); attr.blksize = 4096; attr.blocks = Math.ceil(attr.size / attr.blksize); return attr; }, setattr(node, attr) { for (const key of ["mode", "atime", "mtime", "ctime"]) {
                    if (attr[key] != null) {
                        node[key] = attr[key];
                    }
                } if (attr.size !== undefined) {
                    MEMFS.resizeFileStorage(node, attr.size);
                } }, lookup(parent, name) { if (!MEMFS.doesNotExistError) {
                    MEMFS.doesNotExistError = new FS.ErrnoError(44);
                    MEMFS.doesNotExistError.stack = "<generic error, no stack>";
                } throw MEMFS.doesNotExistError; }, mknod(parent, name, mode, dev) { return MEMFS.createNode(parent, name, mode, dev); }, rename(old_node, new_dir, new_name) { var new_node; try {
                    new_node = FS.lookupNode(new_dir, new_name);
                }
                catch (e) { } if (new_node) {
                    if (FS.isDir(old_node.mode)) {
                        for (var i in new_node.contents) {
                            throw new FS.ErrnoError(55);
                        }
                    }
                    FS.hashRemoveNode(new_node);
                } delete old_node.parent.contents[old_node.name]; new_dir.contents[new_name] = old_node; old_node.name = new_name; new_dir.ctime = new_dir.mtime = old_node.parent.ctime = old_node.parent.mtime = Date.now(); }, unlink(parent, name) { delete parent.contents[name]; parent.ctime = parent.mtime = Date.now(); }, rmdir(parent, name) { var node = FS.lookupNode(parent, name); for (var i in node.contents) {
                    throw new FS.ErrnoError(55);
                } delete parent.contents[name]; parent.ctime = parent.mtime = Date.now(); }, readdir(node) { return [".", "..", ...Object.keys(node.contents)]; }, symlink(parent, newname, oldpath) { var node = MEMFS.createNode(parent, newname, 511 | 40960, 0); node.link = oldpath; return node; }, readlink(node) { if (!FS.isLink(node.mode)) {
                    throw new FS.ErrnoError(28);
                } return node.link; } }, stream_ops: { read(stream, buffer, offset, length, position) { var contents = stream.node.contents; if (position >= stream.node.usedBytes)
                    return 0; var size = Math.min(stream.node.usedBytes - position, length); if (size > 8 && contents.subarray) {
                    buffer.set(contents.subarray(position, position + size), offset);
                }
                else {
                    for (var i = 0; i < size; i++)
                        buffer[offset + i] = contents[position + i];
                } return size; }, write(stream, buffer, offset, length, position, canOwn) { if (buffer.buffer === HEAP8.buffer) {
                    canOwn = false;
                } if (!length)
                    return 0; var node = stream.node; node.mtime = node.ctime = Date.now(); if (buffer.subarray && (!node.contents || node.contents.subarray)) {
                    if (canOwn) {
                        node.contents = buffer.subarray(offset, offset + length);
                        node.usedBytes = length;
                        return length;
                    }
                    else if (node.usedBytes === 0 && position === 0) {
                        node.contents = buffer.slice(offset, offset + length);
                        node.usedBytes = length;
                        return length;
                    }
                    else if (position + length <= node.usedBytes) {
                        node.contents.set(buffer.subarray(offset, offset + length), position);
                        return length;
                    }
                } MEMFS.expandFileStorage(node, position + length); if (node.contents.subarray && buffer.subarray) {
                    node.contents.set(buffer.subarray(offset, offset + length), position);
                }
                else {
                    for (var i = 0; i < length; i++) {
                        node.contents[position + i] = buffer[offset + i];
                    }
                } node.usedBytes = Math.max(node.usedBytes, position + length); return length; }, llseek(stream, offset, whence) { var position = offset; if (whence === 1) {
                    position += stream.position;
                }
                else if (whence === 2) {
                    if (FS.isFile(stream.node.mode)) {
                        position += stream.node.usedBytes;
                    }
                } if (position < 0) {
                    throw new FS.ErrnoError(28);
                } return position; }, mmap(stream, length, position, prot, flags) { if (!FS.isFile(stream.node.mode)) {
                    throw new FS.ErrnoError(43);
                } var ptr; var allocated; var contents = stream.node.contents; if (!(flags & 2) && contents && contents.buffer === HEAP8.buffer) {
                    allocated = false;
                    ptr = contents.byteOffset;
                }
                else {
                    allocated = true;
                    ptr = mmapAlloc(length);
                    if (!ptr) {
                        throw new FS.ErrnoError(48);
                    }
                    if (contents) {
                        if (position > 0 || position + length < contents.length) {
                            if (contents.subarray) {
                                contents = contents.subarray(position, position + length);
                            }
                            else {
                                contents = Array.prototype.slice.call(contents, position, position + length);
                            }
                        }
                        HEAP8.set(contents, ptr);
                    }
                } return { ptr, allocated }; }, msync(stream, buffer, offset, length, mmapFlags) { MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false); return 0; } } };
        var FS_createDataFile = (...args) => FS.createDataFile(...args);
        var getUniqueRunDependency = id => id;
        var FS_handledByPreloadPlugin = (byteArray, fullname, finish, onerror) => { if (typeof Browser != "undefined")
            Browser.init(); var handled = false; preloadPlugins.forEach(plugin => { if (handled)
            return; if (plugin["canHandle"](fullname)) {
            plugin["handle"](byteArray, fullname, finish, onerror);
            handled = true;
        } }); return handled; };
        var FS_createPreloadedFile = (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => { var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent; var dep = getUniqueRunDependency(`cp ${fullname}`); function processData(byteArray) { function finish(byteArray) { preFinish?.(); if (!dontCreateFile) {
            FS_createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
        } onload?.(); removeRunDependency(dep); } if (FS_handledByPreloadPlugin(byteArray, fullname, finish, () => { onerror?.(); removeRunDependency(dep); })) {
            return;
        } finish(byteArray); } addRunDependency(dep); if (typeof url == "string") {
            asyncLoad(url).then(processData, onerror);
        }
        else {
            processData(url);
        } };
        var FS_modeStringToFlags = str => { var flagModes = { r: 0, "r+": 2, w: 512 | 64 | 1, "w+": 512 | 64 | 2, a: 1024 | 64 | 1, "a+": 1024 | 64 | 2 }; var flags = flagModes[str]; if (typeof flags == "undefined") {
            throw new Error(`Unknown file open mode: ${str}`);
        } return flags; };
        var FS_getMode = (canRead, canWrite) => { var mode = 0; if (canRead)
            mode |= 292 | 73; if (canWrite)
            mode |= 146; return mode; };
        var FS = { root: null, mounts: [], devices: {}, streams: [], nextInode: 1, nameTable: null, currentPath: "/", initialized: false, ignorePermissions: true, filesystems: null, syncFSRequests: 0, readFiles: {}, ErrnoError: class {
                constructor(errno) {
                    this.name = "ErrnoError";
                    this.errno = errno;
                }
            }, FSStream: class {
                constructor() {
                    this.shared = {};
                }
                get object() { return this.node; }
                set object(val) { this.node = val; }
                get isRead() { return (this.flags & 2097155) !== 1; }
                get isWrite() { return (this.flags & 2097155) !== 0; }
                get isAppend() { return this.flags & 1024; }
                get flags() { return this.shared.flags; }
                set flags(val) { this.shared.flags = val; }
                get position() { return this.shared.position; }
                set position(val) { this.shared.position = val; }
            }, FSNode: class {
                constructor(parent, name, mode, rdev) {
                    this.node_ops = {};
                    this.stream_ops = {};
                    this.readMode = 292 | 73;
                    this.writeMode = 146;
                    this.mounted = null;
                    if (!parent) {
                        parent = this;
                    }
                    this.parent = parent;
                    this.mount = parent.mount;
                    this.id = FS.nextInode++;
                    this.name = name;
                    this.mode = mode;
                    this.rdev = rdev;
                    this.atime = this.mtime = this.ctime = Date.now();
                }
                get read() { return (this.mode & this.readMode) === this.readMode; }
                set read(val) { val ? this.mode |= this.readMode : this.mode &= ~this.readMode; }
                get write() { return (this.mode & this.writeMode) === this.writeMode; }
                set write(val) { val ? this.mode |= this.writeMode : this.mode &= ~this.writeMode; }
                get isFolder() { return FS.isDir(this.mode); }
                get isDevice() { return FS.isChrdev(this.mode); }
            }, lookupPath(path, opts = {}) { if (!path) {
                throw new FS.ErrnoError(44);
            } opts.follow_mount ?? (opts.follow_mount = true); if (!PATH.isAbs(path)) {
                path = FS.cwd() + "/" + path;
            } linkloop: for (var nlinks = 0; nlinks < 40; nlinks++) {
                var parts = path.split("/").filter(p => !!p);
                var current = FS.root;
                var current_path = "/";
                for (var i = 0; i < parts.length; i++) {
                    var islast = i === parts.length - 1;
                    if (islast && opts.parent) {
                        break;
                    }
                    if (parts[i] === ".") {
                        continue;
                    }
                    if (parts[i] === "..") {
                        current_path = PATH.dirname(current_path);
                        if (FS.isRoot(current)) {
                            path = current_path + "/" + parts.slice(i + 1).join("/");
                            nlinks--;
                            continue linkloop;
                        }
                        else {
                            current = current.parent;
                        }
                        continue;
                    }
                    current_path = PATH.join2(current_path, parts[i]);
                    try {
                        current = FS.lookupNode(current, parts[i]);
                    }
                    catch (e) {
                        if (e?.errno === 44 && islast && opts.noent_okay) {
                            return { path: current_path };
                        }
                        throw e;
                    }
                    if (FS.isMountpoint(current) && (!islast || opts.follow_mount)) {
                        current = current.mounted.root;
                    }
                    if (FS.isLink(current.mode) && (!islast || opts.follow)) {
                        if (!current.node_ops.readlink) {
                            throw new FS.ErrnoError(52);
                        }
                        var link = current.node_ops.readlink(current);
                        if (!PATH.isAbs(link)) {
                            link = PATH.dirname(current_path) + "/" + link;
                        }
                        path = link + "/" + parts.slice(i + 1).join("/");
                        continue linkloop;
                    }
                }
                return { path: current_path, node: current };
            } throw new FS.ErrnoError(32); }, getPath(node) { var path; while (true) {
                if (FS.isRoot(node)) {
                    var mount = node.mount.mountpoint;
                    if (!path)
                        return mount;
                    return mount[mount.length - 1] !== "/" ? `${mount}/${path}` : mount + path;
                }
                path = path ? `${node.name}/${path}` : node.name;
                node = node.parent;
            } }, hashName(parentid, name) { var hash = 0; for (var i = 0; i < name.length; i++) {
                hash = (hash << 5) - hash + name.charCodeAt(i) | 0;
            } return (parentid + hash >>> 0) % FS.nameTable.length; }, hashAddNode(node) { var hash = FS.hashName(node.parent.id, node.name); node.name_next = FS.nameTable[hash]; FS.nameTable[hash] = node; }, hashRemoveNode(node) { var hash = FS.hashName(node.parent.id, node.name); if (FS.nameTable[hash] === node) {
                FS.nameTable[hash] = node.name_next;
            }
            else {
                var current = FS.nameTable[hash];
                while (current) {
                    if (current.name_next === node) {
                        current.name_next = node.name_next;
                        break;
                    }
                    current = current.name_next;
                }
            } }, lookupNode(parent, name) { var errCode = FS.mayLookup(parent); if (errCode) {
                throw new FS.ErrnoError(errCode);
            } var hash = FS.hashName(parent.id, name); for (var node = FS.nameTable[hash]; node; node = node.name_next) {
                var nodeName = node.name;
                if (node.parent.id === parent.id && nodeName === name) {
                    return node;
                }
            } return FS.lookup(parent, name); }, createNode(parent, name, mode, rdev) { var node = new FS.FSNode(parent, name, mode, rdev); FS.hashAddNode(node); return node; }, destroyNode(node) { FS.hashRemoveNode(node); }, isRoot(node) { return node === node.parent; }, isMountpoint(node) { return !!node.mounted; }, isFile(mode) { return (mode & 61440) === 32768; }, isDir(mode) { return (mode & 61440) === 16384; }, isLink(mode) { return (mode & 61440) === 40960; }, isChrdev(mode) { return (mode & 61440) === 8192; }, isBlkdev(mode) { return (mode & 61440) === 24576; }, isFIFO(mode) { return (mode & 61440) === 4096; }, isSocket(mode) { return (mode & 49152) === 49152; }, flagsToPermissionString(flag) { var perms = ["r", "w", "rw"][flag & 3]; if (flag & 512) {
                perms += "w";
            } return perms; }, nodePermissions(node, perms) { if (FS.ignorePermissions) {
                return 0;
            } if (perms.includes("r") && !(node.mode & 292)) {
                return 2;
            }
            else if (perms.includes("w") && !(node.mode & 146)) {
                return 2;
            }
            else if (perms.includes("x") && !(node.mode & 73)) {
                return 2;
            } return 0; }, mayLookup(dir) { if (!FS.isDir(dir.mode))
                return 54; var errCode = FS.nodePermissions(dir, "x"); if (errCode)
                return errCode; if (!dir.node_ops.lookup)
                return 2; return 0; }, mayCreate(dir, name) { if (!FS.isDir(dir.mode)) {
                return 54;
            } try {
                var node = FS.lookupNode(dir, name);
                return 20;
            }
            catch (e) { } return FS.nodePermissions(dir, "wx"); }, mayDelete(dir, name, isdir) { var node; try {
                node = FS.lookupNode(dir, name);
            }
            catch (e) {
                return e.errno;
            } var errCode = FS.nodePermissions(dir, "wx"); if (errCode) {
                return errCode;
            } if (isdir) {
                if (!FS.isDir(node.mode)) {
                    return 54;
                }
                if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
                    return 10;
                }
            }
            else {
                if (FS.isDir(node.mode)) {
                    return 31;
                }
            } return 0; }, mayOpen(node, flags) { if (!node) {
                return 44;
            } if (FS.isLink(node.mode)) {
                return 32;
            }
            else if (FS.isDir(node.mode)) {
                if (FS.flagsToPermissionString(flags) !== "r" || flags & (512 | 64)) {
                    return 31;
                }
            } return FS.nodePermissions(node, FS.flagsToPermissionString(flags)); }, checkOpExists(op, err) { if (!op) {
                throw new FS.ErrnoError(err);
            } return op; }, MAX_OPEN_FDS: 4096, nextfd() { for (var fd = 0; fd <= FS.MAX_OPEN_FDS; fd++) {
                if (!FS.streams[fd]) {
                    return fd;
                }
            } throw new FS.ErrnoError(33); }, getStreamChecked(fd) { var stream = FS.getStream(fd); if (!stream) {
                throw new FS.ErrnoError(8);
            } return stream; }, getStream: fd => FS.streams[fd], createStream(stream, fd = -1) { stream = Object.assign(new FS.FSStream, stream); if (fd == -1) {
                fd = FS.nextfd();
            } stream.fd = fd; FS.streams[fd] = stream; return stream; }, closeStream(fd) { FS.streams[fd] = null; }, dupStream(origStream, fd = -1) { var stream = FS.createStream(origStream, fd); stream.stream_ops?.dup?.(stream); return stream; }, doSetAttr(stream, node, attr) { var setattr = stream?.stream_ops.setattr; var arg = setattr ? stream : node; setattr ?? (setattr = node.node_ops.setattr); FS.checkOpExists(setattr, 63); setattr(arg, attr); }, chrdev_stream_ops: { open(stream) { var device = FS.getDevice(stream.node.rdev); stream.stream_ops = device.stream_ops; stream.stream_ops.open?.(stream); }, llseek() { throw new FS.ErrnoError(70); } }, major: dev => dev >> 8, minor: dev => dev & 255, makedev: (ma, mi) => ma << 8 | mi, registerDevice(dev, ops) { FS.devices[dev] = { stream_ops: ops }; }, getDevice: dev => FS.devices[dev], getMounts(mount) { var mounts = []; var check = [mount]; while (check.length) {
                var m = check.pop();
                mounts.push(m);
                check.push(...m.mounts);
            } return mounts; }, syncfs(populate, callback) { if (typeof populate == "function") {
                callback = populate;
                populate = false;
            } FS.syncFSRequests++; if (FS.syncFSRequests > 1) {
                err(`warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);
            } var mounts = FS.getMounts(FS.root.mount); var completed = 0; function doCallback(errCode) { FS.syncFSRequests--; return callback(errCode); } function done(errCode) { if (errCode) {
                if (!done.errored) {
                    done.errored = true;
                    return doCallback(errCode);
                }
                return;
            } if (++completed >= mounts.length) {
                doCallback(null);
            } } mounts.forEach(mount => { if (!mount.type.syncfs) {
                return done(null);
            } mount.type.syncfs(mount, populate, done); }); }, mount(type, opts, mountpoint) { var root = mountpoint === "/"; var pseudo = !mountpoint; var node; if (root && FS.root) {
                throw new FS.ErrnoError(10);
            }
            else if (!root && !pseudo) {
                var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
                mountpoint = lookup.path;
                node = lookup.node;
                if (FS.isMountpoint(node)) {
                    throw new FS.ErrnoError(10);
                }
                if (!FS.isDir(node.mode)) {
                    throw new FS.ErrnoError(54);
                }
            } var mount = { type, opts, mountpoint, mounts: [] }; var mountRoot = type.mount(mount); mountRoot.mount = mount; mount.root = mountRoot; if (root) {
                FS.root = mountRoot;
            }
            else if (node) {
                node.mounted = mount;
                if (node.mount) {
                    node.mount.mounts.push(mount);
                }
            } return mountRoot; }, unmount(mountpoint) { var lookup = FS.lookupPath(mountpoint, { follow_mount: false }); if (!FS.isMountpoint(lookup.node)) {
                throw new FS.ErrnoError(28);
            } var node = lookup.node; var mount = node.mounted; var mounts = FS.getMounts(mount); Object.keys(FS.nameTable).forEach(hash => { var current = FS.nameTable[hash]; while (current) {
                var next = current.name_next;
                if (mounts.includes(current.mount)) {
                    FS.destroyNode(current);
                }
                current = next;
            } }); node.mounted = null; var idx = node.mount.mounts.indexOf(mount); node.mount.mounts.splice(idx, 1); }, lookup(parent, name) { return parent.node_ops.lookup(parent, name); }, mknod(path, mode, dev) { var lookup = FS.lookupPath(path, { parent: true }); var parent = lookup.node; var name = PATH.basename(path); if (!name) {
                throw new FS.ErrnoError(28);
            } if (name === "." || name === "..") {
                throw new FS.ErrnoError(20);
            } var errCode = FS.mayCreate(parent, name); if (errCode) {
                throw new FS.ErrnoError(errCode);
            } if (!parent.node_ops.mknod) {
                throw new FS.ErrnoError(63);
            } return parent.node_ops.mknod(parent, name, mode, dev); }, statfs(path) { return FS.statfsNode(FS.lookupPath(path, { follow: true }).node); }, statfsStream(stream) { return FS.statfsNode(stream.node); }, statfsNode(node) { var rtn = { bsize: 4096, frsize: 4096, blocks: 1e6, bfree: 5e5, bavail: 5e5, files: FS.nextInode, ffree: FS.nextInode - 1, fsid: 42, flags: 2, namelen: 255 }; if (node.node_ops.statfs) {
                Object.assign(rtn, node.node_ops.statfs(node.mount.opts.root));
            } return rtn; }, create(path, mode = 438) { mode &= 4095; mode |= 32768; return FS.mknod(path, mode, 0); }, mkdir(path, mode = 511) { mode &= 511 | 512; mode |= 16384; return FS.mknod(path, mode, 0); }, mkdirTree(path, mode) { var dirs = path.split("/"); var d = ""; for (var dir of dirs) {
                if (!dir)
                    continue;
                if (d || PATH.isAbs(path))
                    d += "/";
                d += dir;
                try {
                    FS.mkdir(d, mode);
                }
                catch (e) {
                    if (e.errno != 20)
                        throw e;
                }
            } }, mkdev(path, mode, dev) { if (typeof dev == "undefined") {
                dev = mode;
                mode = 438;
            } mode |= 8192; return FS.mknod(path, mode, dev); }, symlink(oldpath, newpath) { if (!PATH_FS.resolve(oldpath)) {
                throw new FS.ErrnoError(44);
            } var lookup = FS.lookupPath(newpath, { parent: true }); var parent = lookup.node; if (!parent) {
                throw new FS.ErrnoError(44);
            } var newname = PATH.basename(newpath); var errCode = FS.mayCreate(parent, newname); if (errCode) {
                throw new FS.ErrnoError(errCode);
            } if (!parent.node_ops.symlink) {
                throw new FS.ErrnoError(63);
            } return parent.node_ops.symlink(parent, newname, oldpath); }, rename(old_path, new_path) { var old_dirname = PATH.dirname(old_path); var new_dirname = PATH.dirname(new_path); var old_name = PATH.basename(old_path); var new_name = PATH.basename(new_path); var lookup, old_dir, new_dir; lookup = FS.lookupPath(old_path, { parent: true }); old_dir = lookup.node; lookup = FS.lookupPath(new_path, { parent: true }); new_dir = lookup.node; if (!old_dir || !new_dir)
                throw new FS.ErrnoError(44); if (old_dir.mount !== new_dir.mount) {
                throw new FS.ErrnoError(75);
            } var old_node = FS.lookupNode(old_dir, old_name); var relative = PATH_FS.relative(old_path, new_dirname); if (relative.charAt(0) !== ".") {
                throw new FS.ErrnoError(28);
            } relative = PATH_FS.relative(new_path, old_dirname); if (relative.charAt(0) !== ".") {
                throw new FS.ErrnoError(55);
            } var new_node; try {
                new_node = FS.lookupNode(new_dir, new_name);
            }
            catch (e) { } if (old_node === new_node) {
                return;
            } var isdir = FS.isDir(old_node.mode); var errCode = FS.mayDelete(old_dir, old_name, isdir); if (errCode) {
                throw new FS.ErrnoError(errCode);
            } errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name); if (errCode) {
                throw new FS.ErrnoError(errCode);
            } if (!old_dir.node_ops.rename) {
                throw new FS.ErrnoError(63);
            } if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
                throw new FS.ErrnoError(10);
            } if (new_dir !== old_dir) {
                errCode = FS.nodePermissions(old_dir, "w");
                if (errCode) {
                    throw new FS.ErrnoError(errCode);
                }
            } FS.hashRemoveNode(old_node); try {
                old_dir.node_ops.rename(old_node, new_dir, new_name);
                old_node.parent = new_dir;
            }
            catch (e) {
                throw e;
            }
            finally {
                FS.hashAddNode(old_node);
            } }, rmdir(path) { var lookup = FS.lookupPath(path, { parent: true }); var parent = lookup.node; var name = PATH.basename(path); var node = FS.lookupNode(parent, name); var errCode = FS.mayDelete(parent, name, true); if (errCode) {
                throw new FS.ErrnoError(errCode);
            } if (!parent.node_ops.rmdir) {
                throw new FS.ErrnoError(63);
            } if (FS.isMountpoint(node)) {
                throw new FS.ErrnoError(10);
            } parent.node_ops.rmdir(parent, name); FS.destroyNode(node); }, readdir(path) { var lookup = FS.lookupPath(path, { follow: true }); var node = lookup.node; var readdir = FS.checkOpExists(node.node_ops.readdir, 54); return readdir(node); }, unlink(path) { var lookup = FS.lookupPath(path, { parent: true }); var parent = lookup.node; if (!parent) {
                throw new FS.ErrnoError(44);
            } var name = PATH.basename(path); var node = FS.lookupNode(parent, name); var errCode = FS.mayDelete(parent, name, false); if (errCode) {
                throw new FS.ErrnoError(errCode);
            } if (!parent.node_ops.unlink) {
                throw new FS.ErrnoError(63);
            } if (FS.isMountpoint(node)) {
                throw new FS.ErrnoError(10);
            } parent.node_ops.unlink(parent, name); FS.destroyNode(node); }, readlink(path) { var lookup = FS.lookupPath(path); var link = lookup.node; if (!link) {
                throw new FS.ErrnoError(44);
            } if (!link.node_ops.readlink) {
                throw new FS.ErrnoError(28);
            } return link.node_ops.readlink(link); }, stat(path, dontFollow) { var lookup = FS.lookupPath(path, { follow: !dontFollow }); var node = lookup.node; var getattr = FS.checkOpExists(node.node_ops.getattr, 63); return getattr(node); }, fstat(fd) { var stream = FS.getStreamChecked(fd); var node = stream.node; var getattr = stream.stream_ops.getattr; var arg = getattr ? stream : node; getattr ?? (getattr = node.node_ops.getattr); FS.checkOpExists(getattr, 63); return getattr(arg); }, lstat(path) { return FS.stat(path, true); }, doChmod(stream, node, mode, dontFollow) { FS.doSetAttr(stream, node, { mode: mode & 4095 | node.mode & ~4095, ctime: Date.now(), dontFollow }); }, chmod(path, mode, dontFollow) { var node; if (typeof path == "string") {
                var lookup = FS.lookupPath(path, { follow: !dontFollow });
                node = lookup.node;
            }
            else {
                node = path;
            } FS.doChmod(null, node, mode, dontFollow); }, lchmod(path, mode) { FS.chmod(path, mode, true); }, fchmod(fd, mode) { var stream = FS.getStreamChecked(fd); FS.doChmod(stream, stream.node, mode, false); }, doChown(stream, node, dontFollow) { FS.doSetAttr(stream, node, { timestamp: Date.now(), dontFollow }); }, chown(path, uid, gid, dontFollow) { var node; if (typeof path == "string") {
                var lookup = FS.lookupPath(path, { follow: !dontFollow });
                node = lookup.node;
            }
            else {
                node = path;
            } FS.doChown(null, node, dontFollow); }, lchown(path, uid, gid) { FS.chown(path, uid, gid, true); }, fchown(fd, uid, gid) { var stream = FS.getStreamChecked(fd); FS.doChown(stream, stream.node, false); }, doTruncate(stream, node, len) { if (FS.isDir(node.mode)) {
                throw new FS.ErrnoError(31);
            } if (!FS.isFile(node.mode)) {
                throw new FS.ErrnoError(28);
            } var errCode = FS.nodePermissions(node, "w"); if (errCode) {
                throw new FS.ErrnoError(errCode);
            } FS.doSetAttr(stream, node, { size: len, timestamp: Date.now() }); }, truncate(path, len) { if (len < 0) {
                throw new FS.ErrnoError(28);
            } var node; if (typeof path == "string") {
                var lookup = FS.lookupPath(path, { follow: true });
                node = lookup.node;
            }
            else {
                node = path;
            } FS.doTruncate(null, node, len); }, ftruncate(fd, len) { var stream = FS.getStreamChecked(fd); if (len < 0 || (stream.flags & 2097155) === 0) {
                throw new FS.ErrnoError(28);
            } FS.doTruncate(stream, stream.node, len); }, utime(path, atime, mtime) { var lookup = FS.lookupPath(path, { follow: true }); var node = lookup.node; var setattr = FS.checkOpExists(node.node_ops.setattr, 63); setattr(node, { atime, mtime }); }, open(path, flags, mode = 438) { if (path === "") {
                throw new FS.ErrnoError(44);
            } flags = typeof flags == "string" ? FS_modeStringToFlags(flags) : flags; if (flags & 64) {
                mode = mode & 4095 | 32768;
            }
            else {
                mode = 0;
            } var node; var isDirPath; if (typeof path == "object") {
                node = path;
            }
            else {
                isDirPath = path.endsWith("/");
                var lookup = FS.lookupPath(path, { follow: !(flags & 131072), noent_okay: true });
                node = lookup.node;
                path = lookup.path;
            } var created = false; if (flags & 64) {
                if (node) {
                    if (flags & 128) {
                        throw new FS.ErrnoError(20);
                    }
                }
                else if (isDirPath) {
                    throw new FS.ErrnoError(31);
                }
                else {
                    node = FS.mknod(path, mode | 511, 0);
                    created = true;
                }
            } if (!node) {
                throw new FS.ErrnoError(44);
            } if (FS.isChrdev(node.mode)) {
                flags &= ~512;
            } if (flags & 65536 && !FS.isDir(node.mode)) {
                throw new FS.ErrnoError(54);
            } if (!created) {
                var errCode = FS.mayOpen(node, flags);
                if (errCode) {
                    throw new FS.ErrnoError(errCode);
                }
            } if (flags & 512 && !created) {
                FS.truncate(node, 0);
            } flags &= ~(128 | 512 | 131072); var stream = FS.createStream({ node, path: FS.getPath(node), flags, seekable: true, position: 0, stream_ops: node.stream_ops, ungotten: [], error: false }); if (stream.stream_ops.open) {
                stream.stream_ops.open(stream);
            } if (created) {
                FS.chmod(node, mode & 511);
            } if (Module["logReadFiles"] && !(flags & 1)) {
                if (!(path in FS.readFiles)) {
                    FS.readFiles[path] = 1;
                }
            } return stream; }, close(stream) { if (FS.isClosed(stream)) {
                throw new FS.ErrnoError(8);
            } if (stream.getdents)
                stream.getdents = null; try {
                if (stream.stream_ops.close) {
                    stream.stream_ops.close(stream);
                }
            }
            catch (e) {
                throw e;
            }
            finally {
                FS.closeStream(stream.fd);
            } stream.fd = null; }, isClosed(stream) { return stream.fd === null; }, llseek(stream, offset, whence) { if (FS.isClosed(stream)) {
                throw new FS.ErrnoError(8);
            } if (!stream.seekable || !stream.stream_ops.llseek) {
                throw new FS.ErrnoError(70);
            } if (whence != 0 && whence != 1 && whence != 2) {
                throw new FS.ErrnoError(28);
            } stream.position = stream.stream_ops.llseek(stream, offset, whence); stream.ungotten = []; return stream.position; }, read(stream, buffer, offset, length, position) { if (length < 0 || position < 0) {
                throw new FS.ErrnoError(28);
            } if (FS.isClosed(stream)) {
                throw new FS.ErrnoError(8);
            } if ((stream.flags & 2097155) === 1) {
                throw new FS.ErrnoError(8);
            } if (FS.isDir(stream.node.mode)) {
                throw new FS.ErrnoError(31);
            } if (!stream.stream_ops.read) {
                throw new FS.ErrnoError(28);
            } var seeking = typeof position != "undefined"; if (!seeking) {
                position = stream.position;
            }
            else if (!stream.seekable) {
                throw new FS.ErrnoError(70);
            } var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position); if (!seeking)
                stream.position += bytesRead; return bytesRead; }, write(stream, buffer, offset, length, position, canOwn) { if (length < 0 || position < 0) {
                throw new FS.ErrnoError(28);
            } if (FS.isClosed(stream)) {
                throw new FS.ErrnoError(8);
            } if ((stream.flags & 2097155) === 0) {
                throw new FS.ErrnoError(8);
            } if (FS.isDir(stream.node.mode)) {
                throw new FS.ErrnoError(31);
            } if (!stream.stream_ops.write) {
                throw new FS.ErrnoError(28);
            } if (stream.seekable && stream.flags & 1024) {
                FS.llseek(stream, 0, 2);
            } var seeking = typeof position != "undefined"; if (!seeking) {
                position = stream.position;
            }
            else if (!stream.seekable) {
                throw new FS.ErrnoError(70);
            } var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn); if (!seeking)
                stream.position += bytesWritten; return bytesWritten; }, mmap(stream, length, position, prot, flags) { if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
                throw new FS.ErrnoError(2);
            } if ((stream.flags & 2097155) === 1) {
                throw new FS.ErrnoError(2);
            } if (!stream.stream_ops.mmap) {
                throw new FS.ErrnoError(43);
            } if (!length) {
                throw new FS.ErrnoError(28);
            } return stream.stream_ops.mmap(stream, length, position, prot, flags); }, msync(stream, buffer, offset, length, mmapFlags) { if (!stream.stream_ops.msync) {
                return 0;
            } return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags); }, ioctl(stream, cmd, arg) { if (!stream.stream_ops.ioctl) {
                throw new FS.ErrnoError(59);
            } return stream.stream_ops.ioctl(stream, cmd, arg); }, readFile(path, opts = {}) { opts.flags = opts.flags || 0; opts.encoding = opts.encoding || "binary"; if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
                throw new Error(`Invalid encoding type "${opts.encoding}"`);
            } var stream = FS.open(path, opts.flags); var stat = FS.stat(path); var length = stat.size; var buf = new Uint8Array(length); FS.read(stream, buf, 0, length, 0); if (opts.encoding === "utf8") {
                buf = UTF8ArrayToString(buf);
            } FS.close(stream); return buf; }, writeFile(path, data, opts = {}) { opts.flags = opts.flags || 577; var stream = FS.open(path, opts.flags, opts.mode); if (typeof data == "string") {
                data = new Uint8Array(intArrayFromString(data, true));
            } if (ArrayBuffer.isView(data)) {
                FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
            }
            else {
                throw new Error("Unsupported data type");
            } FS.close(stream); }, cwd: () => FS.currentPath, chdir(path) { var lookup = FS.lookupPath(path, { follow: true }); if (lookup.node === null) {
                throw new FS.ErrnoError(44);
            } if (!FS.isDir(lookup.node.mode)) {
                throw new FS.ErrnoError(54);
            } var errCode = FS.nodePermissions(lookup.node, "x"); if (errCode) {
                throw new FS.ErrnoError(errCode);
            } FS.currentPath = lookup.path; }, createDefaultDirectories() { FS.mkdir("/tmp"); FS.mkdir("/home"); FS.mkdir("/home/web_user"); }, createDefaultDevices() { FS.mkdir("/dev"); FS.registerDevice(FS.makedev(1, 3), { read: () => 0, write: (stream, buffer, offset, length, pos) => length, llseek: () => 0 }); FS.mkdev("/dev/null", FS.makedev(1, 3)); TTY.register(FS.makedev(5, 0), TTY.default_tty_ops); TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops); FS.mkdev("/dev/tty", FS.makedev(5, 0)); FS.mkdev("/dev/tty1", FS.makedev(6, 0)); var randomBuffer = new Uint8Array(1024), randomLeft = 0; var randomByte = () => { if (randomLeft === 0) {
                randomFill(randomBuffer);
                randomLeft = randomBuffer.byteLength;
            } return randomBuffer[--randomLeft]; }; FS.createDevice("/dev", "random", randomByte); FS.createDevice("/dev", "urandom", randomByte); FS.mkdir("/dev/shm"); FS.mkdir("/dev/shm/tmp"); }, createSpecialDirectories() { FS.mkdir("/proc"); var proc_self = FS.mkdir("/proc/self"); FS.mkdir("/proc/self/fd"); FS.mount({ mount() { var node = FS.createNode(proc_self, "fd", 16895, 73); node.stream_ops = { llseek: MEMFS.stream_ops.llseek }; node.node_ops = { lookup(parent, name) { var fd = +name; var stream = FS.getStreamChecked(fd); var ret = { parent: null, mount: { mountpoint: "fake" }, node_ops: { readlink: () => stream.path }, id: fd + 1 }; ret.parent = ret; return ret; }, readdir() { return Array.from(FS.streams.entries()).filter(([k, v]) => v).map(([k, v]) => k.toString()); } }; return node; } }, {}, "/proc/self/fd"); }, createStandardStreams(input, output, error) { if (input) {
                FS.createDevice("/dev", "stdin", input);
            }
            else {
                FS.symlink("/dev/tty", "/dev/stdin");
            } if (output) {
                FS.createDevice("/dev", "stdout", null, output);
            }
            else {
                FS.symlink("/dev/tty", "/dev/stdout");
            } if (error) {
                FS.createDevice("/dev", "stderr", null, error);
            }
            else {
                FS.symlink("/dev/tty1", "/dev/stderr");
            } var stdin = FS.open("/dev/stdin", 0); var stdout = FS.open("/dev/stdout", 1); var stderr = FS.open("/dev/stderr", 1); }, staticInit() { FS.nameTable = new Array(4096); FS.mount(MEMFS, {}, "/"); FS.createDefaultDirectories(); FS.createDefaultDevices(); FS.createSpecialDirectories(); FS.filesystems = { MEMFS }; }, init(input, output, error) { FS.initialized = true; input ?? (input = Module["stdin"]); output ?? (output = Module["stdout"]); error ?? (error = Module["stderr"]); FS.createStandardStreams(input, output, error); }, quit() { FS.initialized = false; for (var stream of FS.streams) {
                if (stream) {
                    FS.close(stream);
                }
            } }, findObject(path, dontResolveLastLink) { var ret = FS.analyzePath(path, dontResolveLastLink); if (!ret.exists) {
                return null;
            } return ret.object; }, analyzePath(path, dontResolveLastLink) { try {
                var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
                path = lookup.path;
            }
            catch (e) { } var ret = { isRoot: false, exists: false, error: 0, name: null, path: null, object: null, parentExists: false, parentPath: null, parentObject: null }; try {
                var lookup = FS.lookupPath(path, { parent: true });
                ret.parentExists = true;
                ret.parentPath = lookup.path;
                ret.parentObject = lookup.node;
                ret.name = PATH.basename(path);
                lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
                ret.exists = true;
                ret.path = lookup.path;
                ret.object = lookup.node;
                ret.name = lookup.node.name;
                ret.isRoot = lookup.path === "/";
            }
            catch (e) {
                ret.error = e.errno;
            } return ret; }, createPath(parent, path, canRead, canWrite) { parent = typeof parent == "string" ? parent : FS.getPath(parent); var parts = path.split("/").reverse(); while (parts.length) {
                var part = parts.pop();
                if (!part)
                    continue;
                var current = PATH.join2(parent, part);
                try {
                    FS.mkdir(current);
                }
                catch (e) {
                    if (e.errno != 20)
                        throw e;
                }
                parent = current;
            } return current; }, createFile(parent, name, properties, canRead, canWrite) { var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name); var mode = FS_getMode(canRead, canWrite); return FS.create(path, mode); }, createDataFile(parent, name, data, canRead, canWrite, canOwn) { var path = name; if (parent) {
                parent = typeof parent == "string" ? parent : FS.getPath(parent);
                path = name ? PATH.join2(parent, name) : parent;
            } var mode = FS_getMode(canRead, canWrite); var node = FS.create(path, mode); if (data) {
                if (typeof data == "string") {
                    var arr = new Array(data.length);
                    for (var i = 0, len = data.length; i < len; ++i)
                        arr[i] = data.charCodeAt(i);
                    data = arr;
                }
                FS.chmod(node, mode | 146);
                var stream = FS.open(node, 577);
                FS.write(stream, data, 0, data.length, 0, canOwn);
                FS.close(stream);
                FS.chmod(node, mode);
            } }, createDevice(parent, name, input, output) { var _a; var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name); var mode = FS_getMode(!!input, !!output); (_a = FS.createDevice).major ?? (_a.major = 64); var dev = FS.makedev(FS.createDevice.major++, 0); FS.registerDevice(dev, { open(stream) { stream.seekable = false; }, close(stream) { if (output?.buffer?.length) {
                    output(10);
                } }, read(stream, buffer, offset, length, pos) { var bytesRead = 0; for (var i = 0; i < length; i++) {
                    var result;
                    try {
                        result = input();
                    }
                    catch (e) {
                        throw new FS.ErrnoError(29);
                    }
                    if (result === undefined && bytesRead === 0) {
                        throw new FS.ErrnoError(6);
                    }
                    if (result === null || result === undefined)
                        break;
                    bytesRead++;
                    buffer[offset + i] = result;
                } if (bytesRead) {
                    stream.node.atime = Date.now();
                } return bytesRead; }, write(stream, buffer, offset, length, pos) { for (var i = 0; i < length; i++) {
                    try {
                        output(buffer[offset + i]);
                    }
                    catch (e) {
                        throw new FS.ErrnoError(29);
                    }
                } if (length) {
                    stream.node.mtime = stream.node.ctime = Date.now();
                } return i; } }); return FS.mkdev(path, mode, dev); }, forceLoadFile(obj) { if (obj.isDevice || obj.isFolder || obj.link || obj.contents)
                return true; if (typeof XMLHttpRequest != "undefined") {
                throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
            }
            else {
                try {
                    obj.contents = readBinary(obj.url);
                    obj.usedBytes = obj.contents.length;
                }
                catch (e) {
                    throw new FS.ErrnoError(29);
                }
            } }, createLazyFile(parent, name, url, canRead, canWrite) { class LazyUint8Array {
                constructor() {
                    this.lengthKnown = false;
                    this.chunks = [];
                }
                get(idx) { if (idx > this.length - 1 || idx < 0) {
                    return undefined;
                } var chunkOffset = idx % this.chunkSize; var chunkNum = idx / this.chunkSize | 0; return this.getter(chunkNum)[chunkOffset]; }
                setDataGetter(getter) { this.getter = getter; }
                cacheLength() { var xhr = new XMLHttpRequest; xhr.open("HEAD", url, false); xhr.send(null); if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304))
                    throw new Error("Couldn't load " + url + ". Status: " + xhr.status); var datalength = Number(xhr.getResponseHeader("Content-length")); var header; var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes"; var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip"; var chunkSize = 1024 * 1024; if (!hasByteServing)
                    chunkSize = datalength; var doXHR = (from, to) => { if (from > to)
                    throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!"); if (to > datalength - 1)
                    throw new Error("only " + datalength + " bytes available! programmer error!"); var xhr = new XMLHttpRequest; xhr.open("GET", url, false); if (datalength !== chunkSize)
                    xhr.setRequestHeader("Range", "bytes=" + from + "-" + to); xhr.responseType = "arraybuffer"; if (xhr.overrideMimeType) {
                    xhr.overrideMimeType("text/plain; charset=x-user-defined");
                } xhr.send(null); if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304))
                    throw new Error("Couldn't load " + url + ". Status: " + xhr.status); if (xhr.response !== undefined) {
                    return new Uint8Array(xhr.response || []);
                } return intArrayFromString(xhr.responseText || "", true); }; var lazyArray = this; lazyArray.setDataGetter(chunkNum => { var start = chunkNum * chunkSize; var end = (chunkNum + 1) * chunkSize - 1; end = Math.min(end, datalength - 1); if (typeof lazyArray.chunks[chunkNum] == "undefined") {
                    lazyArray.chunks[chunkNum] = doXHR(start, end);
                } if (typeof lazyArray.chunks[chunkNum] == "undefined")
                    throw new Error("doXHR failed!"); return lazyArray.chunks[chunkNum]; }); if (usesGzip || !datalength) {
                    chunkSize = datalength = 1;
                    datalength = this.getter(0).length;
                    chunkSize = datalength;
                    out("LazyFiles on gzip forces download of the whole file when length is accessed");
                } this._length = datalength; this._chunkSize = chunkSize; this.lengthKnown = true; }
                get length() { if (!this.lengthKnown) {
                    this.cacheLength();
                } return this._length; }
                get chunkSize() { if (!this.lengthKnown) {
                    this.cacheLength();
                } return this._chunkSize; }
            } if (typeof XMLHttpRequest != "undefined") {
                if (!ENVIRONMENT_IS_WORKER)
                    throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
                var lazyArray = new LazyUint8Array;
                var properties = { isDevice: false, contents: lazyArray };
            }
            else {
                var properties = { isDevice: false, url };
            } var node = FS.createFile(parent, name, properties, canRead, canWrite); if (properties.contents) {
                node.contents = properties.contents;
            }
            else if (properties.url) {
                node.contents = null;
                node.url = properties.url;
            } Object.defineProperties(node, { usedBytes: { get: function () { return this.contents.length; } } }); var stream_ops = {}; var keys = Object.keys(node.stream_ops); keys.forEach(key => { var fn = node.stream_ops[key]; stream_ops[key] = (...args) => { FS.forceLoadFile(node); return fn(...args); }; }); function writeChunks(stream, buffer, offset, length, position) { var contents = stream.node.contents; if (position >= contents.length)
                return 0; var size = Math.min(contents.length - position, length); if (contents.slice) {
                for (var i = 0; i < size; i++) {
                    buffer[offset + i] = contents[position + i];
                }
            }
            else {
                for (var i = 0; i < size; i++) {
                    buffer[offset + i] = contents.get(position + i);
                }
            } return size; } stream_ops.read = (stream, buffer, offset, length, position) => { FS.forceLoadFile(node); return writeChunks(stream, buffer, offset, length, position); }; stream_ops.mmap = (stream, length, position, prot, flags) => { FS.forceLoadFile(node); var ptr = mmapAlloc(length); if (!ptr) {
                throw new FS.ErrnoError(48);
            } writeChunks(stream, HEAP8, ptr, length, position); return { ptr, allocated: true }; }; node.stream_ops = stream_ops; return node; } };
        var findLibraryFS = (libName, rpath) => { if (!runtimeInitialized) {
            return undefined;
        } if (PATH.isAbs(libName)) {
            try {
                FS.lookupPath(libName);
                return libName;
            }
            catch (e) {
                return undefined;
            }
        } var rpathResolved = (rpath?.paths || []).map(p => replaceORIGIN(rpath?.parentLibPath, p)); return withStackSave(() => { var bufSize = 2 * 255 + 2; var buf = stackAlloc(bufSize); var rpathC = stringToUTF8OnStack(rpathResolved.join(":")); var libNameC = stringToUTF8OnStack(libName); var resLibNameC = __emscripten_find_dylib(buf, rpathC, libNameC, bufSize); return resLibNameC ? UTF8ToString(resLibNameC) : undefined; }); };
        function loadDynamicLibrary(libName, flags = { global: true, nodelete: true }, localScope, handle) { var dso = LDSO.loadedLibsByName[libName]; if (dso) {
            if (!flags.global) {
                if (localScope) {
                    Object.assign(localScope, dso.exports);
                }
            }
            else if (!dso.global) {
                dso.global = true;
                mergeLibSymbols(dso.exports, libName);
            }
            if (flags.nodelete && dso.refcount !== Infinity) {
                dso.refcount = Infinity;
            }
            dso.refcount++;
            if (handle) {
                LDSO.loadedLibsByHandle[handle] = dso;
            }
            return flags.loadAsync ? Promise.resolve(true) : true;
        } dso = newDSO(libName, handle, "loading"); dso.refcount = flags.nodelete ? Infinity : 1; dso.global = flags.global; function loadLibData() { if (handle) {
            var data = HEAPU32[handle + 28 >> 2];
            var dataSize = HEAPU32[handle + 32 >> 2];
            if (data && dataSize) {
                var libData = HEAP8.slice(data, data + dataSize);
                return flags.loadAsync ? Promise.resolve(libData) : libData;
            }
        } var f = findLibraryFS(libName, flags.rpath); if (f) {
            var libData = FS.readFile(f, { encoding: "binary" });
            return flags.loadAsync ? Promise.resolve(libData) : libData;
        } var libFile = locateFile(libName); if (flags.loadAsync) {
            return asyncLoad(libFile);
        } if (!readBinary) {
            throw new Error(`${libFile}: file not found, and synchronous loading of external files is not available`);
        } return readBinary(libFile); } function getExports() { var preloaded = preloadedWasm[libName]; if (preloaded) {
            return flags.loadAsync ? Promise.resolve(preloaded) : preloaded;
        } if (flags.loadAsync) {
            return loadLibData().then(libData => loadWebAssemblyModule(libData, flags, libName, localScope, handle));
        } return loadWebAssemblyModule(loadLibData(), flags, libName, localScope, handle); } function moduleLoaded(exports) { if (dso.global) {
            mergeLibSymbols(exports, libName);
        }
        else if (localScope) {
            Object.assign(localScope, exports);
        } dso.exports = exports; } if (flags.loadAsync) {
            return getExports().then(exports => { moduleLoaded(exports); return true; });
        } moduleLoaded(getExports()); return true; }
        var reportUndefinedSymbols = () => { for (var [symName, entry] of Object.entries(GOT)) {
            if (entry.value == 0) {
                var value = resolveGlobalSymbol(symName, true).sym;
                if (!value && !entry.required) {
                    continue;
                }
                if (typeof value == "function") {
                    entry.value = addFunction(value, value.sig);
                }
                else if (typeof value == "number") {
                    entry.value = value;
                }
                else {
                    throw new Error(`bad export type for '${symName}': ${typeof value}`);
                }
            }
        } };
        var loadDylibs = () => { if (!dynamicLibraries.length) {
            reportUndefinedSymbols();
            return;
        } addRunDependency("loadDylibs"); dynamicLibraries.reduce((chain, lib) => chain.then(() => loadDynamicLibrary(lib, { loadAsync: true, global: true, nodelete: true, allowUndefined: true })), Promise.resolve()).then(() => { reportUndefinedSymbols(); removeRunDependency("loadDylibs"); }); };
        var noExitRuntime = true;
        var ptrToString = ptr => { ptr >>>= 0; return "0x" + ptr.toString(16).padStart(8, "0"); };
        function setValue(ptr, value, type = "i8") { if (type.endsWith("*"))
            type = "*"; switch (type) {
            case "i1":
                HEAP8[ptr] = value;
                break;
            case "i8":
                HEAP8[ptr] = value;
                break;
            case "i16":
                HEAP16[ptr >> 1] = value;
                break;
            case "i32":
                HEAP32[ptr >> 2] = value;
                break;
            case "i64":
                HEAP64[ptr >> 3] = BigInt(value);
                break;
            case "float":
                HEAPF32[ptr >> 2] = value;
                break;
            case "double":
                HEAPF64[ptr >> 3] = value;
                break;
            case "*":
                HEAPU32[ptr >> 2] = value;
                break;
            default: abort(`invalid type for setValue: ${type}`);
        } }
        var ___assert_fail = (condition, filename, line, func) => abort(`Assertion failed: ${UTF8ToString(condition)}, at: ` + [filename ? UTF8ToString(filename) : "unknown filename", line, func ? UTF8ToString(func) : "unknown function"]);
        ___assert_fail.sig = "vppip";
        var ___call_sighandler = (fp, sig) => getWasmTableEntry(fp)(sig);
        ___call_sighandler.sig = "vpi";
        var ___memory_base = new WebAssembly.Global({ value: "i32", mutable: false }, 1024);
        var ___stack_high = 33286528;
        var ___stack_low = 16509312;
        var ___stack_pointer = new WebAssembly.Global({ value: "i32", mutable: true }, 33286528);
        var SYSCALLS = { DEFAULT_POLLMASK: 5, calculateAt(dirfd, path, allowEmpty) { if (PATH.isAbs(path)) {
                return path;
            } var dir; if (dirfd === -100) {
                dir = FS.cwd();
            }
            else {
                var dirstream = SYSCALLS.getStreamFromFD(dirfd);
                dir = dirstream.path;
            } if (path.length == 0) {
                if (!allowEmpty) {
                    throw new FS.ErrnoError(44);
                }
                return dir;
            } return dir + "/" + path; }, writeStat(buf, stat) { HEAP32[buf >> 2] = stat.dev; HEAP32[buf + 4 >> 2] = stat.mode; HEAPU32[buf + 8 >> 2] = stat.nlink; HEAP32[buf + 12 >> 2] = stat.uid; HEAP32[buf + 16 >> 2] = stat.gid; HEAP32[buf + 20 >> 2] = stat.rdev; HEAP64[buf + 24 >> 3] = BigInt(stat.size); HEAP32[buf + 32 >> 2] = 4096; HEAP32[buf + 36 >> 2] = stat.blocks; var atime = stat.atime.getTime(); var mtime = stat.mtime.getTime(); var ctime = stat.ctime.getTime(); HEAP64[buf + 40 >> 3] = BigInt(Math.floor(atime / 1e3)); HEAPU32[buf + 48 >> 2] = atime % 1e3 * 1e3 * 1e3; HEAP64[buf + 56 >> 3] = BigInt(Math.floor(mtime / 1e3)); HEAPU32[buf + 64 >> 2] = mtime % 1e3 * 1e3 * 1e3; HEAP64[buf + 72 >> 3] = BigInt(Math.floor(ctime / 1e3)); HEAPU32[buf + 80 >> 2] = ctime % 1e3 * 1e3 * 1e3; HEAP64[buf + 88 >> 3] = BigInt(stat.ino); return 0; }, writeStatFs(buf, stats) { HEAP32[buf + 4 >> 2] = stats.bsize; HEAP32[buf + 40 >> 2] = stats.bsize; HEAP32[buf + 8 >> 2] = stats.blocks; HEAP32[buf + 12 >> 2] = stats.bfree; HEAP32[buf + 16 >> 2] = stats.bavail; HEAP32[buf + 20 >> 2] = stats.files; HEAP32[buf + 24 >> 2] = stats.ffree; HEAP32[buf + 28 >> 2] = stats.fsid; HEAP32[buf + 44 >> 2] = stats.flags; HEAP32[buf + 36 >> 2] = stats.namelen; }, doMsync(addr, stream, len, flags, offset) { if (!FS.isFile(stream.node.mode)) {
                throw new FS.ErrnoError(43);
            } if (flags & 2) {
                return 0;
            } var buffer = HEAPU8.slice(addr, addr + len); FS.msync(stream, buffer, offset, len, flags); }, getStreamFromFD(fd) { var stream = FS.getStreamChecked(fd); return stream; }, varargs: undefined, getStr(ptr) { var ret = UTF8ToString(ptr); return ret; } };
        var ___syscall__newselect = function (nfds, readfds, writefds, exceptfds, timeout) { try {
            var total = 0;
            var srcReadLow = readfds ? HEAP32[readfds >> 2] : 0, srcReadHigh = readfds ? HEAP32[readfds + 4 >> 2] : 0;
            var srcWriteLow = writefds ? HEAP32[writefds >> 2] : 0, srcWriteHigh = writefds ? HEAP32[writefds + 4 >> 2] : 0;
            var srcExceptLow = exceptfds ? HEAP32[exceptfds >> 2] : 0, srcExceptHigh = exceptfds ? HEAP32[exceptfds + 4 >> 2] : 0;
            var dstReadLow = 0, dstReadHigh = 0;
            var dstWriteLow = 0, dstWriteHigh = 0;
            var dstExceptLow = 0, dstExceptHigh = 0;
            var allLow = (readfds ? HEAP32[readfds >> 2] : 0) | (writefds ? HEAP32[writefds >> 2] : 0) | (exceptfds ? HEAP32[exceptfds >> 2] : 0);
            var allHigh = (readfds ? HEAP32[readfds + 4 >> 2] : 0) | (writefds ? HEAP32[writefds + 4 >> 2] : 0) | (exceptfds ? HEAP32[exceptfds + 4 >> 2] : 0);
            var check = (fd, low, high, val) => fd < 32 ? low & val : high & val;
            for (var fd = 0; fd < nfds; fd++) {
                var mask = 1 << fd % 32;
                if (!check(fd, allLow, allHigh, mask)) {
                    continue;
                }
                var stream = SYSCALLS.getStreamFromFD(fd);
                var flags = SYSCALLS.DEFAULT_POLLMASK;
                if (stream.stream_ops.poll) {
                    var timeoutInMillis = -1;
                    if (timeout) {
                        var tv_sec = readfds ? HEAP32[timeout >> 2] : 0, tv_usec = readfds ? HEAP32[timeout + 4 >> 2] : 0;
                        timeoutInMillis = (tv_sec + tv_usec / 1e6) * 1e3;
                    }
                    flags = stream.stream_ops.poll(stream, timeoutInMillis);
                }
                if (flags & 1 && check(fd, srcReadLow, srcReadHigh, mask)) {
                    fd < 32 ? dstReadLow = dstReadLow | mask : dstReadHigh = dstReadHigh | mask;
                    total++;
                }
                if (flags & 4 && check(fd, srcWriteLow, srcWriteHigh, mask)) {
                    fd < 32 ? dstWriteLow = dstWriteLow | mask : dstWriteHigh = dstWriteHigh | mask;
                    total++;
                }
                if (flags & 2 && check(fd, srcExceptLow, srcExceptHigh, mask)) {
                    fd < 32 ? dstExceptLow = dstExceptLow | mask : dstExceptHigh = dstExceptHigh | mask;
                    total++;
                }
            }
            if (readfds) {
                HEAP32[readfds >> 2] = dstReadLow;
                HEAP32[readfds + 4 >> 2] = dstReadHigh;
            }
            if (writefds) {
                HEAP32[writefds >> 2] = dstWriteLow;
                HEAP32[writefds + 4 >> 2] = dstWriteHigh;
            }
            if (exceptfds) {
                HEAP32[exceptfds >> 2] = dstExceptLow;
                HEAP32[exceptfds + 4 >> 2] = dstExceptHigh;
            }
            return total;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } };
        ___syscall__newselect.sig = "iipppp";
        var SOCKFS = { websocketArgs: {}, callbacks: {}, on(event, callback) { SOCKFS.callbacks[event] = callback; }, emit(event, param) { SOCKFS.callbacks[event]?.(param); }, mount(mount) { SOCKFS.websocketArgs = Module["websocket"] || {}; (Module["websocket"] ?? (Module["websocket"] = {}))["on"] = SOCKFS.on; return FS.createNode(null, "/", 16895, 0); }, createSocket(family, type, protocol) { if (family != 2) {
                throw new FS.ErrnoError(5);
            } type &= ~526336; if (type != 1 && type != 2) {
                throw new FS.ErrnoError(28);
            } var streaming = type == 1; if (streaming && protocol && protocol != 6) {
                throw new FS.ErrnoError(66);
            } var sock = { family, type, protocol, server: null, error: null, peers: {}, pending: [], recv_queue: [], sock_ops: SOCKFS.websocket_sock_ops }; var name = SOCKFS.nextname(); var node = FS.createNode(SOCKFS.root, name, 49152, 0); node.sock = sock; var stream = FS.createStream({ path: name, node, flags: 2, seekable: false, stream_ops: SOCKFS.stream_ops }); sock.stream = stream; return sock; }, getSocket(fd) { var stream = FS.getStream(fd); if (!stream || !FS.isSocket(stream.node.mode)) {
                return null;
            } return stream.node.sock; }, stream_ops: { poll(stream) { var sock = stream.node.sock; return sock.sock_ops.poll(sock); }, ioctl(stream, request, varargs) { var sock = stream.node.sock; return sock.sock_ops.ioctl(sock, request, varargs); }, read(stream, buffer, offset, length, position) { var sock = stream.node.sock; var msg = sock.sock_ops.recvmsg(sock, length); if (!msg) {
                    return 0;
                } buffer.set(msg.buffer, offset); return msg.buffer.length; }, write(stream, buffer, offset, length, position) { var sock = stream.node.sock; return sock.sock_ops.sendmsg(sock, buffer, offset, length); }, close(stream) { var sock = stream.node.sock; sock.sock_ops.close(sock); } }, nextname() { if (!SOCKFS.nextname.current) {
                SOCKFS.nextname.current = 0;
            } return `socket[${SOCKFS.nextname.current++}]`; }, websocket_sock_ops: { createPeer(sock, addr, port) { var ws; if (typeof addr == "object") {
                    ws = addr;
                    addr = null;
                    port = null;
                } if (ws) {
                    if (ws._socket) {
                        addr = ws._socket.remoteAddress;
                        port = ws._socket.remotePort;
                    }
                    else {
                        var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
                        if (!result) {
                            throw new Error("WebSocket URL must be in the format ws(s)://address:port");
                        }
                        addr = result[1];
                        port = parseInt(result[2], 10);
                    }
                }
                else {
                    try {
                        var url = "ws://".replace("#", "//");
                        var subProtocols = "binary";
                        var opts = undefined;
                        if (SOCKFS.websocketArgs["url"]) {
                            url = SOCKFS.websocketArgs["url"];
                        }
                        if (SOCKFS.websocketArgs["subprotocol"]) {
                            subProtocols = SOCKFS.websocketArgs["subprotocol"];
                        }
                        else if (SOCKFS.websocketArgs["subprotocol"] === null) {
                            subProtocols = "null";
                        }
                        if (url === "ws://" || url === "wss://") {
                            var parts = addr.split("/");
                            url = url + parts[0] + ":" + port + "/" + parts.slice(1).join("/");
                        }
                        if (subProtocols !== "null") {
                            subProtocols = subProtocols.replace(/^ +| +$/g, "").split(/ *, */);
                            opts = subProtocols;
                        }
                        var WebSocketConstructor;
                        {
                            WebSocketConstructor = WebSocket;
                        }
                        ws = new WebSocketConstructor(url, opts);
                        ws.binaryType = "arraybuffer";
                    }
                    catch (e) {
                        throw new FS.ErrnoError(23);
                    }
                } var peer = { addr, port, socket: ws, msg_send_queue: [] }; SOCKFS.websocket_sock_ops.addPeer(sock, peer); SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer); if (sock.type === 2 && typeof sock.sport != "undefined") {
                    peer.msg_send_queue.push(new Uint8Array([255, 255, 255, 255, "p".charCodeAt(0), "o".charCodeAt(0), "r".charCodeAt(0), "t".charCodeAt(0), (sock.sport & 65280) >> 8, sock.sport & 255]));
                } return peer; }, getPeer(sock, addr, port) { return sock.peers[addr + ":" + port]; }, addPeer(sock, peer) { sock.peers[peer.addr + ":" + peer.port] = peer; }, removePeer(sock, peer) { delete sock.peers[peer.addr + ":" + peer.port]; }, handlePeerEvents(sock, peer) { var first = true; var handleOpen = function () { sock.connecting = false; SOCKFS.emit("open", sock.stream.fd); try {
                    var queued = peer.msg_send_queue.shift();
                    while (queued) {
                        peer.socket.send(queued);
                        queued = peer.msg_send_queue.shift();
                    }
                }
                catch (e) {
                    peer.socket.close();
                } }; function handleMessage(data) { if (typeof data == "string") {
                    var encoder = new TextEncoder;
                    data = encoder.encode(data);
                }
                else {
                    assert(data.byteLength !== undefined);
                    if (data.byteLength == 0) {
                        return;
                    }
                    data = new Uint8Array(data);
                } var wasfirst = first; first = false; if (wasfirst && data.length === 10 && data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 && data[4] === "p".charCodeAt(0) && data[5] === "o".charCodeAt(0) && data[6] === "r".charCodeAt(0) && data[7] === "t".charCodeAt(0)) {
                    var newport = data[8] << 8 | data[9];
                    SOCKFS.websocket_sock_ops.removePeer(sock, peer);
                    peer.port = newport;
                    SOCKFS.websocket_sock_ops.addPeer(sock, peer);
                    return;
                } sock.recv_queue.push({ addr: peer.addr, port: peer.port, data }); SOCKFS.emit("message", sock.stream.fd); } if (ENVIRONMENT_IS_NODE) {
                    peer.socket.on("open", handleOpen);
                    peer.socket.on("message", function (data, isBinary) { if (!isBinary) {
                        return;
                    } handleMessage(new Uint8Array(data).buffer); });
                    peer.socket.on("close", function () { SOCKFS.emit("close", sock.stream.fd); });
                    peer.socket.on("error", function (error) { sock.error = 14; SOCKFS.emit("error", [sock.stream.fd, sock.error, "ECONNREFUSED: Connection refused"]); });
                }
                else {
                    peer.socket.onopen = handleOpen;
                    peer.socket.onclose = function () { SOCKFS.emit("close", sock.stream.fd); };
                    peer.socket.onmessage = function peer_socket_onmessage(event) { handleMessage(event.data); };
                    peer.socket.onerror = function (error) { sock.error = 14; SOCKFS.emit("error", [sock.stream.fd, sock.error, "ECONNREFUSED: Connection refused"]); };
                } }, poll(sock) { if (sock.type === 1 && sock.server) {
                    return sock.pending.length ? 64 | 1 : 0;
                } var mask = 0; var dest = sock.type === 1 ? SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) : null; if (sock.recv_queue.length || !dest || dest && dest.socket.readyState === dest.socket.CLOSING || dest && dest.socket.readyState === dest.socket.CLOSED) {
                    mask |= 64 | 1;
                } if (!dest || dest && dest.socket.readyState === dest.socket.OPEN) {
                    mask |= 4;
                } if (dest && dest.socket.readyState === dest.socket.CLOSING || dest && dest.socket.readyState === dest.socket.CLOSED) {
                    if (sock.connecting) {
                        mask |= 4;
                    }
                    else {
                        mask |= 16;
                    }
                } return mask; }, ioctl(sock, request, arg) { switch (request) {
                    case 21531:
                        var bytes = 0;
                        if (sock.recv_queue.length) {
                            bytes = sock.recv_queue[0].data.length;
                        }
                        HEAP32[arg >> 2] = bytes;
                        return 0;
                    case 21537:
                        var on = HEAP32[arg >> 2];
                        if (on) {
                            sock.stream.flags |= 2048;
                        }
                        else {
                            sock.stream.flags &= ~2048;
                        }
                        return 0;
                    default: return 28;
                } }, close(sock) { if (sock.server) {
                    try {
                        sock.server.close();
                    }
                    catch (e) { }
                    sock.server = null;
                } for (var peer of Object.values(sock.peers)) {
                    try {
                        peer.socket.close();
                    }
                    catch (e) { }
                    SOCKFS.websocket_sock_ops.removePeer(sock, peer);
                } return 0; }, bind(sock, addr, port) { if (typeof sock.saddr != "undefined" || typeof sock.sport != "undefined") {
                    throw new FS.ErrnoError(28);
                } sock.saddr = addr; sock.sport = port; if (sock.type === 2) {
                    if (sock.server) {
                        sock.server.close();
                        sock.server = null;
                    }
                    try {
                        sock.sock_ops.listen(sock, 0);
                    }
                    catch (e) {
                        if (!(e.name === "ErrnoError"))
                            throw e;
                        if (e.errno !== 138)
                            throw e;
                    }
                } }, connect(sock, addr, port) { if (sock.server) {
                    throw new FS.ErrnoError(138);
                } if (typeof sock.daddr != "undefined" && typeof sock.dport != "undefined") {
                    var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
                    if (dest) {
                        if (dest.socket.readyState === dest.socket.CONNECTING) {
                            throw new FS.ErrnoError(7);
                        }
                        else {
                            throw new FS.ErrnoError(30);
                        }
                    }
                } var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port); sock.daddr = peer.addr; sock.dport = peer.port; sock.connecting = true; }, listen(sock, backlog) { if (!ENVIRONMENT_IS_NODE) {
                    throw new FS.ErrnoError(138);
                } }, accept(listensock) { if (!listensock.server || !listensock.pending.length) {
                    throw new FS.ErrnoError(28);
                } var newsock = listensock.pending.shift(); newsock.stream.flags = listensock.stream.flags; return newsock; }, getname(sock, peer) { var addr, port; if (peer) {
                    if (sock.daddr === undefined || sock.dport === undefined) {
                        throw new FS.ErrnoError(53);
                    }
                    addr = sock.daddr;
                    port = sock.dport;
                }
                else {
                    addr = sock.saddr || 0;
                    port = sock.sport || 0;
                } return { addr, port }; }, sendmsg(sock, buffer, offset, length, addr, port) { if (sock.type === 2) {
                    if (addr === undefined || port === undefined) {
                        addr = sock.daddr;
                        port = sock.dport;
                    }
                    if (addr === undefined || port === undefined) {
                        throw new FS.ErrnoError(17);
                    }
                }
                else {
                    addr = sock.daddr;
                    port = sock.dport;
                } var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port); if (sock.type === 1) {
                    if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                        throw new FS.ErrnoError(53);
                    }
                } if (ArrayBuffer.isView(buffer)) {
                    offset += buffer.byteOffset;
                    buffer = buffer.buffer;
                } var data = buffer.slice(offset, offset + length); if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
                    if (sock.type === 2) {
                        if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                            dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
                        }
                    }
                    dest.msg_send_queue.push(data);
                    return length;
                } try {
                    dest.socket.send(data);
                    return length;
                }
                catch (e) {
                    throw new FS.ErrnoError(28);
                } }, recvmsg(sock, length) { if (sock.type === 1 && sock.server) {
                    throw new FS.ErrnoError(53);
                } var queued = sock.recv_queue.shift(); if (!queued) {
                    if (sock.type === 1) {
                        var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
                        if (!dest) {
                            throw new FS.ErrnoError(53);
                        }
                        if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                            return null;
                        }
                        throw new FS.ErrnoError(6);
                    }
                    throw new FS.ErrnoError(6);
                } var queuedLength = queued.data.byteLength || queued.data.length; var queuedOffset = queued.data.byteOffset || 0; var queuedBuffer = queued.data.buffer || queued.data; var bytesRead = Math.min(length, queuedLength); var res = { buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead), addr: queued.addr, port: queued.port }; if (sock.type === 1 && bytesRead < queuedLength) {
                    var bytesRemaining = queuedLength - bytesRead;
                    queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
                    sock.recv_queue.unshift(queued);
                } return res; } } };
        var getSocketFromFD = fd => { var socket = SOCKFS.getSocket(fd); if (!socket)
            throw new FS.ErrnoError(8); return socket; };
        var inetPton4 = str => { var b = str.split("."); for (var i = 0; i < 4; i++) {
            var tmp = Number(b[i]);
            if (isNaN(tmp))
                return null;
            b[i] = tmp;
        } return (b[0] | b[1] << 8 | b[2] << 16 | b[3] << 24) >>> 0; };
        var inetPton6 = str => { var words; var w, offset, z, i; var valid6regx = /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i; var parts = []; if (!valid6regx.test(str)) {
            return null;
        } if (str === "::") {
            return [0, 0, 0, 0, 0, 0, 0, 0];
        } if (str.startsWith("::")) {
            str = str.replace("::", "Z:");
        }
        else {
            str = str.replace("::", ":Z:");
        } if (str.indexOf(".") > 0) {
            str = str.replace(new RegExp("[.]", "g"), ":");
            words = str.split(":");
            words[words.length - 4] = Number(words[words.length - 4]) + Number(words[words.length - 3]) * 256;
            words[words.length - 3] = Number(words[words.length - 2]) + Number(words[words.length - 1]) * 256;
            words = words.slice(0, words.length - 2);
        }
        else {
            words = str.split(":");
        } offset = 0; z = 0; for (w = 0; w < words.length; w++) {
            if (typeof words[w] == "string") {
                if (words[w] === "Z") {
                    for (z = 0; z < 8 - words.length + 1; z++) {
                        parts[w + z] = 0;
                    }
                    offset = z - 1;
                }
                else {
                    parts[w + offset] = _htons(parseInt(words[w], 16));
                }
            }
            else {
                parts[w + offset] = words[w];
            }
        } return [parts[1] << 16 | parts[0], parts[3] << 16 | parts[2], parts[5] << 16 | parts[4], parts[7] << 16 | parts[6]]; };
        var writeSockaddr = (sa, family, addr, port, addrlen) => { switch (family) {
            case 2:
                addr = inetPton4(addr);
                zeroMemory(sa, 16);
                if (addrlen) {
                    HEAP32[addrlen >> 2] = 16;
                }
                HEAP16[sa >> 1] = family;
                HEAP32[sa + 4 >> 2] = addr;
                HEAP16[sa + 2 >> 1] = _htons(port);
                break;
            case 10:
                addr = inetPton6(addr);
                zeroMemory(sa, 28);
                if (addrlen) {
                    HEAP32[addrlen >> 2] = 28;
                }
                HEAP32[sa >> 2] = family;
                HEAP32[sa + 8 >> 2] = addr[0];
                HEAP32[sa + 12 >> 2] = addr[1];
                HEAP32[sa + 16 >> 2] = addr[2];
                HEAP32[sa + 20 >> 2] = addr[3];
                HEAP16[sa + 2 >> 1] = _htons(port);
                break;
            default: return 5;
        } return 0; };
        var DNS = { address_map: { id: 1, addrs: {}, names: {} }, lookup_name(name) { var res = inetPton4(name); if (res !== null) {
                return name;
            } res = inetPton6(name); if (res !== null) {
                return name;
            } var addr; if (DNS.address_map.addrs[name]) {
                addr = DNS.address_map.addrs[name];
            }
            else {
                var id = DNS.address_map.id++;
                assert(id < 65535, "exceeded max address mappings of 65535");
                addr = "172.29." + (id & 255) + "." + (id & 65280);
                DNS.address_map.names[addr] = name;
                DNS.address_map.addrs[name] = addr;
            } return addr; }, lookup_addr(addr) { if (DNS.address_map.names[addr]) {
                return DNS.address_map.names[addr];
            } return null; } };
        function ___syscall_accept4(fd, addr, addrlen, flags, d1, d2) { try {
            var sock = getSocketFromFD(fd);
            var newsock = sock.sock_ops.accept(sock);
            if (addr) {
                var errno = writeSockaddr(addr, newsock.family, DNS.lookup_name(newsock.daddr), newsock.dport, addrlen);
            }
            return newsock.stream.fd;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_accept4.sig = "iippiii";
        var inetNtop4 = addr => (addr & 255) + "." + (addr >> 8 & 255) + "." + (addr >> 16 & 255) + "." + (addr >> 24 & 255);
        var inetNtop6 = ints => { var str = ""; var word = 0; var longest = 0; var lastzero = 0; var zstart = 0; var len = 0; var i = 0; var parts = [ints[0] & 65535, ints[0] >> 16, ints[1] & 65535, ints[1] >> 16, ints[2] & 65535, ints[2] >> 16, ints[3] & 65535, ints[3] >> 16]; var hasipv4 = true; var v4part = ""; for (i = 0; i < 5; i++) {
            if (parts[i] !== 0) {
                hasipv4 = false;
                break;
            }
        } if (hasipv4) {
            v4part = inetNtop4(parts[6] | parts[7] << 16);
            if (parts[5] === -1) {
                str = "::ffff:";
                str += v4part;
                return str;
            }
            if (parts[5] === 0) {
                str = "::";
                if (v4part === "0.0.0.0")
                    v4part = "";
                if (v4part === "0.0.0.1")
                    v4part = "1";
                str += v4part;
                return str;
            }
        } for (word = 0; word < 8; word++) {
            if (parts[word] === 0) {
                if (word - lastzero > 1) {
                    len = 0;
                }
                lastzero = word;
                len++;
            }
            if (len > longest) {
                longest = len;
                zstart = word - longest + 1;
            }
        } for (word = 0; word < 8; word++) {
            if (longest > 1) {
                if (parts[word] === 0 && word >= zstart && word < zstart + longest) {
                    if (word === zstart) {
                        str += ":";
                        if (zstart === 0)
                            str += ":";
                    }
                    continue;
                }
            }
            str += Number(_ntohs(parts[word] & 65535)).toString(16);
            str += word < 7 ? ":" : "";
        } return str; };
        var readSockaddr = (sa, salen) => { var family = HEAP16[sa >> 1]; var port = _ntohs(HEAPU16[sa + 2 >> 1]); var addr; switch (family) {
            case 2:
                if (salen !== 16) {
                    return { errno: 28 };
                }
                addr = HEAP32[sa + 4 >> 2];
                addr = inetNtop4(addr);
                break;
            case 10:
                if (salen !== 28) {
                    return { errno: 28 };
                }
                addr = [HEAP32[sa + 8 >> 2], HEAP32[sa + 12 >> 2], HEAP32[sa + 16 >> 2], HEAP32[sa + 20 >> 2]];
                addr = inetNtop6(addr);
                break;
            default: return { errno: 5 };
        } return { family, addr, port }; };
        var getSocketAddress = (addrp, addrlen) => { var info = readSockaddr(addrp, addrlen); if (info.errno)
            throw new FS.ErrnoError(info.errno); info.addr = DNS.lookup_addr(info.addr) || info.addr; return info; };
        function ___syscall_bind(fd, addr, addrlen, d1, d2, d3) { try {
            var sock = getSocketFromFD(fd);
            var info = getSocketAddress(addr, addrlen);
            sock.sock_ops.bind(sock, info.addr, info.port);
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_bind.sig = "iippiii";
        function ___syscall_chdir(path) { try {
            path = SYSCALLS.getStr(path);
            FS.chdir(path);
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_chdir.sig = "ip";
        function ___syscall_chmod(path, mode) { try {
            path = SYSCALLS.getStr(path);
            FS.chmod(path, mode);
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_chmod.sig = "ipi";
        function ___syscall_connect(fd, addr, addrlen, d1, d2, d3) { try {
            var sock = getSocketFromFD(fd);
            var info = getSocketAddress(addr, addrlen);
            sock.sock_ops.connect(sock, info.addr, info.port);
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_connect.sig = "iippiii";
        function ___syscall_dup(fd) { try {
            var old = SYSCALLS.getStreamFromFD(fd);
            return FS.dupStream(old).fd;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_dup.sig = "ii";
        function ___syscall_dup3(fd, newfd, flags) { try {
            var old = SYSCALLS.getStreamFromFD(fd);
            if (old.fd === newfd)
                return -28;
            if (newfd < 0 || newfd >= FS.MAX_OPEN_FDS)
                return -8;
            var existing = FS.getStream(newfd);
            if (existing)
                FS.close(existing);
            return FS.dupStream(old, newfd).fd;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_dup3.sig = "iiii";
        function ___syscall_faccessat(dirfd, path, amode, flags) { try {
            path = SYSCALLS.getStr(path);
            path = SYSCALLS.calculateAt(dirfd, path);
            if (amode & ~7) {
                return -28;
            }
            var lookup = FS.lookupPath(path, { follow: true });
            var node = lookup.node;
            if (!node) {
                return -44;
            }
            var perms = "";
            if (amode & 4)
                perms += "r";
            if (amode & 2)
                perms += "w";
            if (amode & 1)
                perms += "x";
            if (perms && FS.nodePermissions(node, perms)) {
                return -2;
            }
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_faccessat.sig = "iipii";
        var ___syscall_fadvise64 = (fd, offset, len, advice) => 0;
        ___syscall_fadvise64.sig = "iijji";
        var INT53_MAX = 9007199254740992;
        var INT53_MIN = -9007199254740992;
        var bigintToI53Checked = num => num < INT53_MIN || num > INT53_MAX ? NaN : Number(num);
        function ___syscall_fallocate(fd, mode, offset, len) { offset = bigintToI53Checked(offset); len = bigintToI53Checked(len); try {
            if (isNaN(offset) || isNaN(len))
                return -61;
            if (mode != 0) {
                return -138;
            }
            if (offset < 0 || len < 0) {
                return -28;
            }
            var oldSize = FS.fstat(fd).size;
            var newSize = offset + len;
            if (newSize > oldSize) {
                FS.ftruncate(fd, newSize);
            }
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_fallocate.sig = "iiijj";
        function ___syscall_fchdir(fd) { try {
            var stream = SYSCALLS.getStreamFromFD(fd);
            FS.chdir(stream.path);
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_fchdir.sig = "ii";
        function ___syscall_fchmod(fd, mode) { try {
            FS.fchmod(fd, mode);
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_fchmod.sig = "iii";
        function ___syscall_fchmodat2(dirfd, path, mode, flags) { try {
            var nofollow = flags & 256;
            path = SYSCALLS.getStr(path);
            path = SYSCALLS.calculateAt(dirfd, path);
            FS.chmod(path, mode, nofollow);
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_fchmodat2.sig = "iipii";
        function ___syscall_fchown32(fd, owner, group) { try {
            FS.fchown(fd, owner, group);
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_fchown32.sig = "iiii";
        function ___syscall_fchownat(dirfd, path, owner, group, flags) { try {
            path = SYSCALLS.getStr(path);
            var nofollow = flags & 256;
            flags = flags & ~256;
            path = SYSCALLS.calculateAt(dirfd, path);
            (nofollow ? FS.lchown : FS.chown)(path, owner, group);
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_fchownat.sig = "iipiii";
        var syscallGetVarargI = () => { var ret = HEAP32[+SYSCALLS.varargs >> 2]; SYSCALLS.varargs += 4; return ret; };
        var syscallGetVarargP = syscallGetVarargI;
        function ___syscall_fcntl64(fd, cmd, varargs) { SYSCALLS.varargs = varargs; try {
            var stream = SYSCALLS.getStreamFromFD(fd);
            switch (cmd) {
                case 0: {
                    var arg = syscallGetVarargI();
                    if (arg < 0) {
                        return -28;
                    }
                    while (FS.streams[arg]) {
                        arg++;
                    }
                    var newStream;
                    newStream = FS.dupStream(stream, arg);
                    return newStream.fd;
                }
                case 1:
                case 2: return 0;
                case 3: return stream.flags;
                case 4: {
                    var arg = syscallGetVarargI();
                    stream.flags |= arg;
                    return 0;
                }
                case 12: {
                    var arg = syscallGetVarargP();
                    var offset = 0;
                    HEAP16[arg + offset >> 1] = 2;
                    return 0;
                }
                case 13:
                case 14: return 0;
            }
            return -28;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_fcntl64.sig = "iiip";
        function ___syscall_fdatasync(fd) { try {
            var stream = SYSCALLS.getStreamFromFD(fd);
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_fdatasync.sig = "ii";
        function ___syscall_fstat64(fd, buf) { try {
            return SYSCALLS.writeStat(buf, FS.fstat(fd));
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_fstat64.sig = "iip";
        function ___syscall_fstatfs64(fd, size, buf) { try {
            var stream = SYSCALLS.getStreamFromFD(fd);
            SYSCALLS.writeStatFs(buf, FS.statfsStream(stream));
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_fstatfs64.sig = "iipp";
        function ___syscall_ftruncate64(fd, length) { length = bigintToI53Checked(length); try {
            if (isNaN(length))
                return -61;
            FS.ftruncate(fd, length);
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_ftruncate64.sig = "iij";
        function ___syscall_getcwd(buf, size) { try {
            if (size === 0)
                return -28;
            var cwd = FS.cwd();
            var cwdLengthInBytes = lengthBytesUTF8(cwd) + 1;
            if (size < cwdLengthInBytes)
                return -68;
            stringToUTF8(cwd, buf, size);
            return cwdLengthInBytes;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_getcwd.sig = "ipp";
        function ___syscall_getdents64(fd, dirp, count) { try {
            var stream = SYSCALLS.getStreamFromFD(fd);
            stream.getdents || (stream.getdents = FS.readdir(stream.path));
            var struct_size = 280;
            var pos = 0;
            var off = FS.llseek(stream, 0, 1);
            var startIdx = Math.floor(off / struct_size);
            var endIdx = Math.min(stream.getdents.length, startIdx + Math.floor(count / struct_size));
            for (var idx = startIdx; idx < endIdx; idx++) {
                var id;
                var type;
                var name = stream.getdents[idx];
                if (name === ".") {
                    id = stream.node.id;
                    type = 4;
                }
                else if (name === "..") {
                    var lookup = FS.lookupPath(stream.path, { parent: true });
                    id = lookup.node.id;
                    type = 4;
                }
                else {
                    var child;
                    try {
                        child = FS.lookupNode(stream.node, name);
                    }
                    catch (e) {
                        if (e?.errno === 28) {
                            continue;
                        }
                        throw e;
                    }
                    id = child.id;
                    type = FS.isChrdev(child.mode) ? 2 : FS.isDir(child.mode) ? 4 : FS.isLink(child.mode) ? 10 : 8;
                }
                HEAP64[dirp + pos >> 3] = BigInt(id);
                HEAP64[dirp + pos + 8 >> 3] = BigInt((idx + 1) * struct_size);
                HEAP16[dirp + pos + 16 >> 1] = 280;
                HEAP8[dirp + pos + 18] = type;
                stringToUTF8(name, dirp + pos + 19, 256);
                pos += struct_size;
            }
            FS.llseek(stream, idx * struct_size, 0);
            return pos;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_getdents64.sig = "iipp";
        function ___syscall_getpeername(fd, addr, addrlen, d1, d2, d3) { try {
            var sock = getSocketFromFD(fd);
            if (!sock.daddr) {
                return -53;
            }
            var errno = writeSockaddr(addr, sock.family, DNS.lookup_name(sock.daddr), sock.dport, addrlen);
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_getpeername.sig = "iippiii";
        function ___syscall_getsockname(fd, addr, addrlen, d1, d2, d3) { try {
            var sock = getSocketFromFD(fd);
            var errno = writeSockaddr(addr, sock.family, DNS.lookup_name(sock.saddr || "0.0.0.0"), sock.sport, addrlen);
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_getsockname.sig = "iippiii";
        function ___syscall_getsockopt(fd, level, optname, optval, optlen, d1) { try {
            var sock = getSocketFromFD(fd);
            if (level === 1) {
                if (optname === 4) {
                    HEAP32[optval >> 2] = sock.error;
                    HEAP32[optlen >> 2] = 4;
                    sock.error = null;
                    return 0;
                }
            }
            return -50;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_getsockopt.sig = "iiiippi";
        function ___syscall_ioctl(fd, op, varargs) { SYSCALLS.varargs = varargs; try {
            var stream = SYSCALLS.getStreamFromFD(fd);
            switch (op) {
                case 21509: {
                    if (!stream.tty)
                        return -59;
                    return 0;
                }
                case 21505: {
                    if (!stream.tty)
                        return -59;
                    if (stream.tty.ops.ioctl_tcgets) {
                        var termios = stream.tty.ops.ioctl_tcgets(stream);
                        var argp = syscallGetVarargP();
                        HEAP32[argp >> 2] = termios.c_iflag || 0;
                        HEAP32[argp + 4 >> 2] = termios.c_oflag || 0;
                        HEAP32[argp + 8 >> 2] = termios.c_cflag || 0;
                        HEAP32[argp + 12 >> 2] = termios.c_lflag || 0;
                        for (var i = 0; i < 32; i++) {
                            HEAP8[argp + i + 17] = termios.c_cc[i] || 0;
                        }
                        return 0;
                    }
                    return 0;
                }
                case 21510:
                case 21511:
                case 21512: {
                    if (!stream.tty)
                        return -59;
                    return 0;
                }
                case 21506:
                case 21507:
                case 21508: {
                    if (!stream.tty)
                        return -59;
                    if (stream.tty.ops.ioctl_tcsets) {
                        var argp = syscallGetVarargP();
                        var c_iflag = HEAP32[argp >> 2];
                        var c_oflag = HEAP32[argp + 4 >> 2];
                        var c_cflag = HEAP32[argp + 8 >> 2];
                        var c_lflag = HEAP32[argp + 12 >> 2];
                        var c_cc = [];
                        for (var i = 0; i < 32; i++) {
                            c_cc.push(HEAP8[argp + i + 17]);
                        }
                        return stream.tty.ops.ioctl_tcsets(stream.tty, op, { c_iflag, c_oflag, c_cflag, c_lflag, c_cc });
                    }
                    return 0;
                }
                case 21519: {
                    if (!stream.tty)
                        return -59;
                    var argp = syscallGetVarargP();
                    HEAP32[argp >> 2] = 0;
                    return 0;
                }
                case 21520: {
                    if (!stream.tty)
                        return -59;
                    return -28;
                }
                case 21537:
                case 21531: {
                    var argp = syscallGetVarargP();
                    return FS.ioctl(stream, op, argp);
                }
                case 21523: {
                    if (!stream.tty)
                        return -59;
                    if (stream.tty.ops.ioctl_tiocgwinsz) {
                        var winsize = stream.tty.ops.ioctl_tiocgwinsz(stream.tty);
                        var argp = syscallGetVarargP();
                        HEAP16[argp >> 1] = winsize[0];
                        HEAP16[argp + 2 >> 1] = winsize[1];
                    }
                    return 0;
                }
                case 21524: {
                    if (!stream.tty)
                        return -59;
                    return 0;
                }
                case 21515: {
                    if (!stream.tty)
                        return -59;
                    return 0;
                }
                default: return -28;
            }
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_ioctl.sig = "iiip";
        function ___syscall_listen(fd, backlog) { try {
            var sock = getSocketFromFD(fd);
            sock.sock_ops.listen(sock, backlog);
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_listen.sig = "iiiiiii";
        function ___syscall_lstat64(path, buf) { try {
            path = SYSCALLS.getStr(path);
            return SYSCALLS.writeStat(buf, FS.lstat(path));
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_lstat64.sig = "ipp";
        function ___syscall_mkdirat(dirfd, path, mode) { try {
            path = SYSCALLS.getStr(path);
            path = SYSCALLS.calculateAt(dirfd, path);
            FS.mkdir(path, mode, 0);
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_mkdirat.sig = "iipi";
        function ___syscall_mknodat(dirfd, path, mode, dev) { try {
            path = SYSCALLS.getStr(path);
            path = SYSCALLS.calculateAt(dirfd, path);
            switch (mode & 61440) {
                case 32768:
                case 8192:
                case 24576:
                case 4096:
                case 49152: break;
                default: return -28;
            }
            FS.mknod(path, mode, dev);
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_mknodat.sig = "iipii";
        function ___syscall_newfstatat(dirfd, path, buf, flags) { try {
            path = SYSCALLS.getStr(path);
            var nofollow = flags & 256;
            var allowEmpty = flags & 4096;
            flags = flags & ~6400;
            path = SYSCALLS.calculateAt(dirfd, path, allowEmpty);
            return SYSCALLS.writeStat(buf, nofollow ? FS.lstat(path) : FS.stat(path));
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_newfstatat.sig = "iippi";
        function ___syscall_openat(dirfd, path, flags, varargs) { SYSCALLS.varargs = varargs; try {
            path = SYSCALLS.getStr(path);
            path = SYSCALLS.calculateAt(dirfd, path);
            var mode = varargs ? syscallGetVarargI() : 0;
            return FS.open(path, flags, mode).fd;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_openat.sig = "iipip";
        var PIPEFS = { BUCKET_BUFFER_SIZE: 8192, mount(mount) { return FS.createNode(null, "/", 16384 | 511, 0); }, createPipe() { var pipe = { buckets: [], refcnt: 2, timestamp: new Date }; pipe.buckets.push({ buffer: new Uint8Array(PIPEFS.BUCKET_BUFFER_SIZE), offset: 0, roffset: 0 }); var rName = PIPEFS.nextname(); var wName = PIPEFS.nextname(); var rNode = FS.createNode(PIPEFS.root, rName, 4096, 0); var wNode = FS.createNode(PIPEFS.root, wName, 4096, 0); rNode.pipe = pipe; wNode.pipe = pipe; var readableStream = FS.createStream({ path: rName, node: rNode, flags: 0, seekable: false, stream_ops: PIPEFS.stream_ops }); rNode.stream = readableStream; var writableStream = FS.createStream({ path: wName, node: wNode, flags: 1, seekable: false, stream_ops: PIPEFS.stream_ops }); wNode.stream = writableStream; return { readable_fd: readableStream.fd, writable_fd: writableStream.fd }; }, stream_ops: { getattr(stream) { var node = stream.node; var timestamp = node.pipe.timestamp; return { dev: 14, ino: node.id, mode: 4480, nlink: 1, uid: 0, gid: 0, rdev: 0, size: 0, atime: timestamp, mtime: timestamp, ctime: timestamp, blksize: 4096, blocks: 0 }; }, poll(stream) { var pipe = stream.node.pipe; if ((stream.flags & 2097155) === 1) {
                    return 256 | 4;
                } for (var bucket of pipe.buckets) {
                    if (bucket.offset - bucket.roffset > 0) {
                        return 64 | 1;
                    }
                } return 0; }, dup(stream) { stream.node.pipe.refcnt++; }, ioctl(stream, request, varargs) { return 28; }, fsync(stream) { return 28; }, read(stream, buffer, offset, length, position) { var pipe = stream.node.pipe; var currentLength = 0; for (var bucket of pipe.buckets) {
                    currentLength += bucket.offset - bucket.roffset;
                } var data = buffer.subarray(offset, offset + length); if (length <= 0) {
                    return 0;
                } if (currentLength == 0) {
                    throw new FS.ErrnoError(6);
                } var toRead = Math.min(currentLength, length); var totalRead = toRead; var toRemove = 0; for (var bucket of pipe.buckets) {
                    var bucketSize = bucket.offset - bucket.roffset;
                    if (toRead <= bucketSize) {
                        var tmpSlice = bucket.buffer.subarray(bucket.roffset, bucket.offset);
                        if (toRead < bucketSize) {
                            tmpSlice = tmpSlice.subarray(0, toRead);
                            bucket.roffset += toRead;
                        }
                        else {
                            toRemove++;
                        }
                        data.set(tmpSlice);
                        break;
                    }
                    else {
                        var tmpSlice = bucket.buffer.subarray(bucket.roffset, bucket.offset);
                        data.set(tmpSlice);
                        data = data.subarray(tmpSlice.byteLength);
                        toRead -= tmpSlice.byteLength;
                        toRemove++;
                    }
                } if (toRemove && toRemove == pipe.buckets.length) {
                    toRemove--;
                    pipe.buckets[toRemove].offset = 0;
                    pipe.buckets[toRemove].roffset = 0;
                } pipe.buckets.splice(0, toRemove); return totalRead; }, write(stream, buffer, offset, length, position) { var pipe = stream.node.pipe; var data = buffer.subarray(offset, offset + length); var dataLen = data.byteLength; if (dataLen <= 0) {
                    return 0;
                } var currBucket = null; if (pipe.buckets.length == 0) {
                    currBucket = { buffer: new Uint8Array(PIPEFS.BUCKET_BUFFER_SIZE), offset: 0, roffset: 0 };
                    pipe.buckets.push(currBucket);
                }
                else {
                    currBucket = pipe.buckets[pipe.buckets.length - 1];
                } assert(currBucket.offset <= PIPEFS.BUCKET_BUFFER_SIZE); var freeBytesInCurrBuffer = PIPEFS.BUCKET_BUFFER_SIZE - currBucket.offset; if (freeBytesInCurrBuffer >= dataLen) {
                    currBucket.buffer.set(data, currBucket.offset);
                    currBucket.offset += dataLen;
                    return dataLen;
                }
                else if (freeBytesInCurrBuffer > 0) {
                    currBucket.buffer.set(data.subarray(0, freeBytesInCurrBuffer), currBucket.offset);
                    currBucket.offset += freeBytesInCurrBuffer;
                    data = data.subarray(freeBytesInCurrBuffer, data.byteLength);
                } var numBuckets = data.byteLength / PIPEFS.BUCKET_BUFFER_SIZE | 0; var remElements = data.byteLength % PIPEFS.BUCKET_BUFFER_SIZE; for (var i = 0; i < numBuckets; i++) {
                    var newBucket = { buffer: new Uint8Array(PIPEFS.BUCKET_BUFFER_SIZE), offset: PIPEFS.BUCKET_BUFFER_SIZE, roffset: 0 };
                    pipe.buckets.push(newBucket);
                    newBucket.buffer.set(data.subarray(0, PIPEFS.BUCKET_BUFFER_SIZE));
                    data = data.subarray(PIPEFS.BUCKET_BUFFER_SIZE, data.byteLength);
                } if (remElements > 0) {
                    var newBucket = { buffer: new Uint8Array(PIPEFS.BUCKET_BUFFER_SIZE), offset: data.byteLength, roffset: 0 };
                    pipe.buckets.push(newBucket);
                    newBucket.buffer.set(data);
                } return dataLen; }, close(stream) { var pipe = stream.node.pipe; pipe.refcnt--; if (pipe.refcnt === 0) {
                    pipe.buckets = null;
                } } }, nextname() { if (!PIPEFS.nextname.current) {
                PIPEFS.nextname.current = 0;
            } return "pipe[" + PIPEFS.nextname.current++ + "]"; } };
        function ___syscall_pipe(fdPtr) { try {
            if (fdPtr == 0) {
                throw new FS.ErrnoError(21);
            }
            var res = PIPEFS.createPipe();
            HEAP32[fdPtr >> 2] = res.readable_fd;
            HEAP32[fdPtr + 4 >> 2] = res.writable_fd;
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_pipe.sig = "ip";
        function ___syscall_poll(fds, nfds, timeout) { try {
            var nonzero = 0;
            for (var i = 0; i < nfds; i++) {
                var pollfd = fds + 8 * i;
                var fd = HEAP32[pollfd >> 2];
                var events = HEAP16[pollfd + 4 >> 1];
                var mask = 32;
                var stream = FS.getStream(fd);
                if (stream) {
                    mask = SYSCALLS.DEFAULT_POLLMASK;
                    if (stream.stream_ops.poll) {
                        mask = stream.stream_ops.poll(stream, -1);
                    }
                }
                mask &= events | 8 | 16;
                if (mask)
                    nonzero++;
                HEAP16[pollfd + 6 >> 1] = mask;
            }
            return nonzero;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_poll.sig = "ipii";
        function ___syscall_readlinkat(dirfd, path, buf, bufsize) { try {
            path = SYSCALLS.getStr(path);
            path = SYSCALLS.calculateAt(dirfd, path);
            if (bufsize <= 0)
                return -28;
            var ret = FS.readlink(path);
            var len = Math.min(bufsize, lengthBytesUTF8(ret));
            var endChar = HEAP8[buf + len];
            stringToUTF8(ret, buf, bufsize + 1);
            HEAP8[buf + len] = endChar;
            return len;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_readlinkat.sig = "iippp";
        function ___syscall_recvfrom(fd, buf, len, flags, addr, addrlen) { try {
            var sock = getSocketFromFD(fd);
            var msg = sock.sock_ops.recvmsg(sock, len);
            if (!msg)
                return 0;
            if (addr) {
                var errno = writeSockaddr(addr, sock.family, DNS.lookup_name(msg.addr), msg.port, addrlen);
            }
            HEAPU8.set(msg.buffer, buf);
            return msg.buffer.byteLength;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_recvfrom.sig = "iippipp";
        function ___syscall_recvmsg(fd, message, flags, d1, d2, d3) { try {
            var sock = getSocketFromFD(fd);
            var iov = HEAPU32[message + 8 >> 2];
            var num = HEAP32[message + 12 >> 2];
            var total = 0;
            for (var i = 0; i < num; i++) {
                total += HEAP32[iov + (8 * i + 4) >> 2];
            }
            var msg = sock.sock_ops.recvmsg(sock, total);
            if (!msg)
                return 0;
            var name = HEAPU32[message >> 2];
            if (name) {
                var errno = writeSockaddr(name, sock.family, DNS.lookup_name(msg.addr), msg.port);
            }
            var bytesRead = 0;
            var bytesRemaining = msg.buffer.byteLength;
            for (var i = 0; bytesRemaining > 0 && i < num; i++) {
                var iovbase = HEAPU32[iov + (8 * i + 0) >> 2];
                var iovlen = HEAP32[iov + (8 * i + 4) >> 2];
                if (!iovlen) {
                    continue;
                }
                var length = Math.min(iovlen, bytesRemaining);
                var buf = msg.buffer.subarray(bytesRead, bytesRead + length);
                HEAPU8.set(buf, iovbase + bytesRead);
                bytesRead += length;
                bytesRemaining -= length;
            }
            return bytesRead;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_recvmsg.sig = "iipiiii";
        function ___syscall_renameat(olddirfd, oldpath, newdirfd, newpath) { try {
            oldpath = SYSCALLS.getStr(oldpath);
            newpath = SYSCALLS.getStr(newpath);
            oldpath = SYSCALLS.calculateAt(olddirfd, oldpath);
            newpath = SYSCALLS.calculateAt(newdirfd, newpath);
            FS.rename(oldpath, newpath);
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_renameat.sig = "iipip";
        function ___syscall_rmdir(path) { try {
            path = SYSCALLS.getStr(path);
            FS.rmdir(path);
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_rmdir.sig = "ip";
        function ___syscall_sendmsg(fd, message, flags, d1, d2, d3) { try {
            var sock = getSocketFromFD(fd);
            var iov = HEAPU32[message + 8 >> 2];
            var num = HEAP32[message + 12 >> 2];
            var addr, port;
            var name = HEAPU32[message >> 2];
            var namelen = HEAP32[message + 4 >> 2];
            if (name) {
                var info = getSocketAddress(name, namelen);
                port = info.port;
                addr = info.addr;
            }
            var total = 0;
            for (var i = 0; i < num; i++) {
                total += HEAP32[iov + (8 * i + 4) >> 2];
            }
            var view = new Uint8Array(total);
            var offset = 0;
            for (var i = 0; i < num; i++) {
                var iovbase = HEAPU32[iov + (8 * i + 0) >> 2];
                var iovlen = HEAP32[iov + (8 * i + 4) >> 2];
                for (var j = 0; j < iovlen; j++) {
                    view[offset++] = HEAP8[iovbase + j];
                }
            }
            return sock.sock_ops.sendmsg(sock, view, 0, total, addr, port);
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_sendmsg.sig = "iipippi";
        function ___syscall_sendto(fd, message, length, flags, addr, addr_len) { try {
            var sock = getSocketFromFD(fd);
            if (!addr) {
                return FS.write(sock.stream, HEAP8, message, length);
            }
            var dest = getSocketAddress(addr, addr_len);
            return sock.sock_ops.sendmsg(sock, HEAP8, message, length, dest.addr, dest.port);
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_sendto.sig = "iippipp";
        function ___syscall_socket(domain, type, protocol) { try {
            var sock = SOCKFS.createSocket(domain, type, protocol);
            return sock.stream.fd;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_socket.sig = "iiiiiii";
        function ___syscall_stat64(path, buf) { try {
            path = SYSCALLS.getStr(path);
            return SYSCALLS.writeStat(buf, FS.stat(path));
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_stat64.sig = "ipp";
        function ___syscall_statfs64(path, size, buf) { try {
            SYSCALLS.writeStatFs(buf, FS.statfs(SYSCALLS.getStr(path)));
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_statfs64.sig = "ippp";
        function ___syscall_symlinkat(target, dirfd, linkpath) { try {
            target = SYSCALLS.getStr(target);
            linkpath = SYSCALLS.getStr(linkpath);
            linkpath = SYSCALLS.calculateAt(dirfd, linkpath);
            FS.symlink(target, linkpath);
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_symlinkat.sig = "ipip";
        function ___syscall_truncate64(path, length) { length = bigintToI53Checked(length); try {
            if (isNaN(length))
                return -61;
            path = SYSCALLS.getStr(path);
            FS.truncate(path, length);
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_truncate64.sig = "ipj";
        function ___syscall_unlinkat(dirfd, path, flags) { try {
            path = SYSCALLS.getStr(path);
            path = SYSCALLS.calculateAt(dirfd, path);
            if (!flags) {
                FS.unlink(path);
            }
            else if (flags === 512) {
                FS.rmdir(path);
            }
            else {
                return -28;
            }
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_unlinkat.sig = "iipi";
        var readI53FromI64 = ptr => HEAPU32[ptr >> 2] + HEAP32[ptr + 4 >> 2] * 4294967296;
        function ___syscall_utimensat(dirfd, path, times, flags) { try {
            path = SYSCALLS.getStr(path);
            path = SYSCALLS.calculateAt(dirfd, path, true);
            var now = Date.now(), atime, mtime;
            if (!times) {
                atime = now;
                mtime = now;
            }
            else {
                var seconds = readI53FromI64(times);
                var nanoseconds = HEAP32[times + 8 >> 2];
                if (nanoseconds == 1073741823) {
                    atime = now;
                }
                else if (nanoseconds == 1073741822) {
                    atime = null;
                }
                else {
                    atime = seconds * 1e3 + nanoseconds / (1e3 * 1e3);
                }
                times += 16;
                seconds = readI53FromI64(times);
                nanoseconds = HEAP32[times + 8 >> 2];
                if (nanoseconds == 1073741823) {
                    mtime = now;
                }
                else if (nanoseconds == 1073741822) {
                    mtime = null;
                }
                else {
                    mtime = seconds * 1e3 + nanoseconds / (1e3 * 1e3);
                }
            }
            if ((mtime ?? atime) !== null) {
                FS.utime(path, atime, mtime);
            }
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_utimensat.sig = "iippi";
        var ___table_base = new WebAssembly.Global({ value: "i32", mutable: false }, 1);
        var __abort_js = () => abort("");
        __abort_js.sig = "v";
        var dlSetError = msg => { var sp = stackSave(); var cmsg = stringToUTF8OnStack(msg); ___dl_seterr(cmsg, 0); stackRestore(sp); };
        var dlopenInternal = (handle, jsflags) => { var filename = UTF8ToString(handle + 36); var flags = HEAP32[handle + 4 >> 2]; filename = PATH.normalize(filename); var searchpaths = []; var global = Boolean(flags & 256); var localScope = global ? null : {}; var combinedFlags = { global, nodelete: Boolean(flags & 4096), loadAsync: jsflags.loadAsync }; if (jsflags.loadAsync) {
            return loadDynamicLibrary(filename, combinedFlags, localScope, handle);
        } try {
            return loadDynamicLibrary(filename, combinedFlags, localScope, handle);
        }
        catch (e) {
            dlSetError(`Could not load dynamic lib: ${filename}\n${e}`);
            return 0;
        } };
        var __dlopen_js = handle => dlopenInternal(handle, { loadAsync: false });
        __dlopen_js.sig = "pp";
        var __dlsym_js = (handle, symbol, symbolIndex) => { symbol = UTF8ToString(symbol); var result; var newSymIndex; var lib = LDSO.loadedLibsByHandle[handle]; if (!lib.exports.hasOwnProperty(symbol) || lib.exports[symbol].stub) {
            dlSetError(`Tried to lookup unknown symbol "${symbol}" in dynamic lib: ${lib.name}`);
            return 0;
        } newSymIndex = Object.keys(lib.exports).indexOf(symbol); result = lib.exports[symbol]; if (typeof result == "function") {
            var addr = getFunctionAddress(result);
            if (addr) {
                result = addr;
            }
            else {
                result = addFunction(result, result.sig);
                HEAPU32[symbolIndex >> 2] = newSymIndex;
            }
        } return result; };
        __dlsym_js.sig = "pppp";
        var handleException = e => { if (e instanceof ExitStatus || e == "unwind") {
            return EXITSTATUS;
        } checkStackCookie(); if (e instanceof WebAssembly.RuntimeError) {
            if (_emscripten_stack_get_current() <= 0) {
                err("Stack overflow detected.  You can try increasing -sSTACK_SIZE (currently set to 16777216)");
            }
        } quit_(1, e); };
        var runtimeKeepaliveCounter = 0;
        var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;
        var _proc_exit = code => { EXITSTATUS = code; if (!keepRuntimeAlive()) {
            Module["onExit"]?.(code);
            ABORT = true;
        } quit_(code, new ExitStatus(code)); };
        _proc_exit.sig = "vi";
        var exitJS = (status, implicit) => { EXITSTATUS = status; _proc_exit(status); };
        var _exit = exitJS;
        _exit.sig = "vi";
        var maybeExit = () => { if (!keepRuntimeAlive()) {
            try {
                _exit(EXITSTATUS);
            }
            catch (e) {
                handleException(e);
            }
        } };
        var callUserCallback = func => { if (ABORT) {
            return;
        } try {
            func();
            maybeExit();
        }
        catch (e) {
            handleException(e);
        } };
        var __emscripten_dlopen_js = (handle, onsuccess, onerror, user_data) => { function errorCallback(e) { var filename = UTF8ToString(handle + 36); dlSetError(`'Could not load dynamic lib: ${filename}\n${e}`); callUserCallback(() => getWasmTableEntry(onerror)(handle, user_data)); } function successCallback() { callUserCallback(() => getWasmTableEntry(onsuccess)(handle, user_data)); } var promise = dlopenInternal(handle, { loadAsync: true }); if (promise) {
            promise.then(successCallback, errorCallback);
        }
        else {
            errorCallback();
        } };
        __emscripten_dlopen_js.sig = "vpppp";
        var getExecutableName = () => thisProgram || "./this.program";
        var __emscripten_get_progname = (str, len) => stringToUTF8(getExecutableName(), str, len);
        __emscripten_get_progname.sig = "vpi";
        var jsStackTrace = () => (new Error).stack.toString();
        var getCallstack = flags => { var callstack = jsStackTrace(); var lines = callstack.split("\n"); callstack = ""; var firefoxRe = new RegExp("\\s*(.*?)@(.*?):([0-9]+):([0-9]+)"); var chromeRe = new RegExp("\\s*at (.*?) \\((.*):(.*):(.*)\\)"); for (var line of lines) {
            var symbolName = "";
            var file = "";
            var lineno = 0;
            var column = 0;
            var parts = chromeRe.exec(line);
            if (parts?.length == 5) {
                symbolName = parts[1];
                file = parts[2];
                lineno = parts[3];
                column = parts[4];
            }
            else {
                parts = firefoxRe.exec(line);
                if (parts?.length >= 4) {
                    symbolName = parts[1];
                    file = parts[2];
                    lineno = parts[3];
                    column = parts[4] | 0;
                }
                else {
                    callstack += line + "\n";
                    continue;
                }
            }
            if (symbolName == "_emscripten_log" || symbolName == "_emscripten_get_callstack") {
                callstack = "";
                continue;
            }
            if (flags & 24) {
                if (flags & 64) {
                    file = file.substring(file.replace(/\\/g, "/").lastIndexOf("/") + 1);
                }
                callstack += `    at ${symbolName} (${file}:${lineno}:${column})\n`;
            }
        } callstack = callstack.replace(/\s+$/, ""); return callstack; };
        var __emscripten_log_formatted = (flags, str) => { str = UTF8ToString(str); if (flags & 24) {
            str = str.replace(/\s+$/, "");
            str += (str.length > 0 ? "\n" : "") + getCallstack(flags);
        } if (flags & 1) {
            if (flags & 4) {
                console.error(str);
            }
            else if (flags & 2) {
                console.warn(str);
            }
            else if (flags & 512) {
                console.info(str);
            }
            else if (flags & 256) {
                console.debug(str);
            }
            else {
                console.log(str);
            }
        }
        else if (flags & 6) {
            err(str);
        }
        else {
            out(str);
        } };
        __emscripten_log_formatted.sig = "vip";
        var __emscripten_lookup_name = name => { var nameString = UTF8ToString(name); return inetPton4(DNS.lookup_name(nameString)); };
        __emscripten_lookup_name.sig = "ip";
        var __emscripten_runtime_keepalive_clear = () => { noExitRuntime = false; runtimeKeepaliveCounter = 0; };
        __emscripten_runtime_keepalive_clear.sig = "v";
        var __emscripten_system = command => { if (!command)
            return 0; return -52; };
        __emscripten_system.sig = "ip";
        var __emscripten_throw_longjmp = () => { throw Infinity; };
        __emscripten_throw_longjmp.sig = "v";
        function __gmtime_js(time, tmPtr) { time = bigintToI53Checked(time); var date = new Date(time * 1e3); HEAP32[tmPtr >> 2] = date.getUTCSeconds(); HEAP32[tmPtr + 4 >> 2] = date.getUTCMinutes(); HEAP32[tmPtr + 8 >> 2] = date.getUTCHours(); HEAP32[tmPtr + 12 >> 2] = date.getUTCDate(); HEAP32[tmPtr + 16 >> 2] = date.getUTCMonth(); HEAP32[tmPtr + 20 >> 2] = date.getUTCFullYear() - 1900; HEAP32[tmPtr + 24 >> 2] = date.getUTCDay(); var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0); var yday = (date.getTime() - start) / (1e3 * 60 * 60 * 24) | 0; HEAP32[tmPtr + 28 >> 2] = yday; }
        __gmtime_js.sig = "vjp";
        var isLeapYear = year => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
        var MONTH_DAYS_LEAP_CUMULATIVE = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
        var MONTH_DAYS_REGULAR_CUMULATIVE = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        var ydayFromDate = date => { var leap = isLeapYear(date.getFullYear()); var monthDaysCumulative = leap ? MONTH_DAYS_LEAP_CUMULATIVE : MONTH_DAYS_REGULAR_CUMULATIVE; var yday = monthDaysCumulative[date.getMonth()] + date.getDate() - 1; return yday; };
        function __localtime_js(time, tmPtr) { time = bigintToI53Checked(time); var date = new Date(time * 1e3); HEAP32[tmPtr >> 2] = date.getSeconds(); HEAP32[tmPtr + 4 >> 2] = date.getMinutes(); HEAP32[tmPtr + 8 >> 2] = date.getHours(); HEAP32[tmPtr + 12 >> 2] = date.getDate(); HEAP32[tmPtr + 16 >> 2] = date.getMonth(); HEAP32[tmPtr + 20 >> 2] = date.getFullYear() - 1900; HEAP32[tmPtr + 24 >> 2] = date.getDay(); var yday = ydayFromDate(date) | 0; HEAP32[tmPtr + 28 >> 2] = yday; HEAP32[tmPtr + 36 >> 2] = -(date.getTimezoneOffset() * 60); var start = new Date(date.getFullYear(), 0, 1); var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset(); var winterOffset = start.getTimezoneOffset(); var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0; HEAP32[tmPtr + 32 >> 2] = dst; }
        __localtime_js.sig = "vjp";
        var __mktime_js = function (tmPtr) { var ret = (() => { var date = new Date(HEAP32[tmPtr + 20 >> 2] + 1900, HEAP32[tmPtr + 16 >> 2], HEAP32[tmPtr + 12 >> 2], HEAP32[tmPtr + 8 >> 2], HEAP32[tmPtr + 4 >> 2], HEAP32[tmPtr >> 2], 0); var dst = HEAP32[tmPtr + 32 >> 2]; var guessedOffset = date.getTimezoneOffset(); var start = new Date(date.getFullYear(), 0, 1); var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset(); var winterOffset = start.getTimezoneOffset(); var dstOffset = Math.min(winterOffset, summerOffset); if (dst < 0) {
            HEAP32[tmPtr + 32 >> 2] = Number(summerOffset != winterOffset && dstOffset == guessedOffset);
        }
        else if (dst > 0 != (dstOffset == guessedOffset)) {
            var nonDstOffset = Math.max(winterOffset, summerOffset);
            var trueOffset = dst > 0 ? dstOffset : nonDstOffset;
            date.setTime(date.getTime() + (trueOffset - guessedOffset) * 6e4);
        } HEAP32[tmPtr + 24 >> 2] = date.getDay(); var yday = ydayFromDate(date) | 0; HEAP32[tmPtr + 28 >> 2] = yday; HEAP32[tmPtr >> 2] = date.getSeconds(); HEAP32[tmPtr + 4 >> 2] = date.getMinutes(); HEAP32[tmPtr + 8 >> 2] = date.getHours(); HEAP32[tmPtr + 12 >> 2] = date.getDate(); HEAP32[tmPtr + 16 >> 2] = date.getMonth(); HEAP32[tmPtr + 20 >> 2] = date.getYear(); var timeMs = date.getTime(); if (isNaN(timeMs)) {
            return -1;
        } return timeMs / 1e3; })(); return BigInt(ret); };
        __mktime_js.sig = "jp";
        function __mmap_js(len, prot, flags, fd, offset, allocated, addr) { offset = bigintToI53Checked(offset); try {
            var stream = SYSCALLS.getStreamFromFD(fd);
            var res = FS.mmap(stream, len, offset, prot, flags);
            var ptr = res.ptr;
            HEAP32[allocated >> 2] = res.allocated;
            HEAPU32[addr >> 2] = ptr;
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        __mmap_js.sig = "ipiiijpp";
        function __msync_js(addr, len, prot, flags, fd, offset) { offset = bigintToI53Checked(offset); try {
            if (isNaN(offset))
                return -61;
            SYSCALLS.doMsync(addr, SYSCALLS.getStreamFromFD(fd), len, flags, offset);
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        __msync_js.sig = "ippiiij";
        function __munmap_js(addr, len, prot, flags, fd, offset) { offset = bigintToI53Checked(offset); try {
            var stream = SYSCALLS.getStreamFromFD(fd);
            if (prot & 2) {
                SYSCALLS.doMsync(addr, stream, len, flags, offset);
            }
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        __munmap_js.sig = "ippiiij";
        var timers = {};
        var _emscripten_get_now = () => performance.now();
        _emscripten_get_now.sig = "d";
        var __setitimer_js = (which, timeout_ms) => { if (timers[which]) {
            clearTimeout(timers[which].id);
            delete timers[which];
        } if (!timeout_ms)
            return 0; var id = setTimeout(() => { delete timers[which]; callUserCallback(() => __emscripten_timeout(which, _emscripten_get_now())); }, timeout_ms); timers[which] = { id, timeout_ms }; return 0; };
        __setitimer_js.sig = "iid";
        var __timegm_js = function (tmPtr) { var ret = (() => { var time = Date.UTC(HEAP32[tmPtr + 20 >> 2] + 1900, HEAP32[tmPtr + 16 >> 2], HEAP32[tmPtr + 12 >> 2], HEAP32[tmPtr + 8 >> 2], HEAP32[tmPtr + 4 >> 2], HEAP32[tmPtr >> 2], 0); var date = new Date(time); HEAP32[tmPtr + 24 >> 2] = date.getUTCDay(); var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0); var yday = (date.getTime() - start) / (1e3 * 60 * 60 * 24) | 0; HEAP32[tmPtr + 28 >> 2] = yday; return date.getTime() / 1e3; })(); return BigInt(ret); };
        __timegm_js.sig = "jp";
        var __tzset_js = (timezone, daylight, std_name, dst_name) => { var currentYear = (new Date).getFullYear(); var winter = new Date(currentYear, 0, 1); var summer = new Date(currentYear, 6, 1); var winterOffset = winter.getTimezoneOffset(); var summerOffset = summer.getTimezoneOffset(); var stdTimezoneOffset = Math.max(winterOffset, summerOffset); HEAPU32[timezone >> 2] = stdTimezoneOffset * 60; HEAP32[daylight >> 2] = Number(winterOffset != summerOffset); var extractZone = timezoneOffset => { var sign = timezoneOffset >= 0 ? "-" : "+"; var absOffset = Math.abs(timezoneOffset); var hours = String(Math.floor(absOffset / 60)).padStart(2, "0"); var minutes = String(absOffset % 60).padStart(2, "0"); return `UTC${sign}${hours}${minutes}`; }; var winterName = extractZone(winterOffset); var summerName = extractZone(summerOffset); if (summerOffset < winterOffset) {
            stringToUTF8(winterName, std_name, 17);
            stringToUTF8(summerName, dst_name, 17);
        }
        else {
            stringToUTF8(winterName, dst_name, 17);
            stringToUTF8(summerName, std_name, 17);
        } };
        __tzset_js.sig = "vpppp";
        var _emscripten_set_main_loop_timing = (mode, value) => { MainLoop.timingMode = mode; MainLoop.timingValue = value; if (!MainLoop.func) {
            return 1;
        } if (!MainLoop.running) {
            MainLoop.running = true;
        } if (mode == 0) {
            MainLoop.scheduler = function MainLoop_scheduler_setTimeout() { var timeUntilNextTick = Math.max(0, MainLoop.tickStartTime + value - _emscripten_get_now()) | 0; setTimeout(MainLoop.runner, timeUntilNextTick); };
            MainLoop.method = "timeout";
        }
        else if (mode == 1) {
            MainLoop.scheduler = function MainLoop_scheduler_rAF() { MainLoop.requestAnimationFrame(MainLoop.runner); };
            MainLoop.method = "rAF";
        }
        else if (mode == 2) {
            if (typeof MainLoop.setImmediate == "undefined") {
                if (typeof setImmediate == "undefined") {
                    var setImmediates = [];
                    var emscriptenMainLoopMessageId = "setimmediate";
                    var MainLoop_setImmediate_messageHandler = event => { if (event.data === emscriptenMainLoopMessageId || event.data.target === emscriptenMainLoopMessageId) {
                        event.stopPropagation();
                        setImmediates.shift()();
                    } };
                    addEventListener("message", MainLoop_setImmediate_messageHandler, true);
                    MainLoop.setImmediate = func => { setImmediates.push(func); if (ENVIRONMENT_IS_WORKER) {
                        Module["setImmediates"] ?? (Module["setImmediates"] = []);
                        Module["setImmediates"].push(func);
                        postMessage({ target: emscriptenMainLoopMessageId });
                    }
                    else
                        postMessage(emscriptenMainLoopMessageId, "*"); };
                }
                else {
                    MainLoop.setImmediate = setImmediate;
                }
            }
            MainLoop.scheduler = function MainLoop_scheduler_setImmediate() { MainLoop.setImmediate(MainLoop.runner); };
            MainLoop.method = "immediate";
        } return 0; };
        _emscripten_set_main_loop_timing.sig = "iii";
        var setMainLoop = (iterFunc, fps, simulateInfiniteLoop, arg, noSetTiming) => { MainLoop.func = iterFunc; MainLoop.arg = arg; var thisMainLoopId = MainLoop.currentlyRunningMainloop; function checkIsRunning() { if (thisMainLoopId < MainLoop.currentlyRunningMainloop) {
            maybeExit();
            return false;
        } return true; } MainLoop.running = false; MainLoop.runner = function MainLoop_runner() { if (ABORT)
            return; if (MainLoop.queue.length > 0) {
            var start = Date.now();
            var blocker = MainLoop.queue.shift();
            blocker.func(blocker.arg);
            if (MainLoop.remainingBlockers) {
                var remaining = MainLoop.remainingBlockers;
                var next = remaining % 1 == 0 ? remaining - 1 : Math.floor(remaining);
                if (blocker.counted) {
                    MainLoop.remainingBlockers = next;
                }
                else {
                    next = next + .5;
                    MainLoop.remainingBlockers = (8 * remaining + next) / 9;
                }
            }
            MainLoop.updateStatus();
            if (!checkIsRunning())
                return;
            setTimeout(MainLoop.runner, 0);
            return;
        } if (!checkIsRunning())
            return; MainLoop.currentFrameNumber = MainLoop.currentFrameNumber + 1 | 0; if (MainLoop.timingMode == 1 && MainLoop.timingValue > 1 && MainLoop.currentFrameNumber % MainLoop.timingValue != 0) {
            MainLoop.scheduler();
            return;
        }
        else if (MainLoop.timingMode == 0) {
            MainLoop.tickStartTime = _emscripten_get_now();
        } MainLoop.runIter(iterFunc); if (!checkIsRunning())
            return; MainLoop.scheduler(); }; if (!noSetTiming) {
            if (fps > 0) {
                _emscripten_set_main_loop_timing(0, 1e3 / fps);
            }
            else {
                _emscripten_set_main_loop_timing(1, 1);
            }
            MainLoop.scheduler();
        } if (simulateInfiniteLoop) {
            throw "unwind";
        } };
        var MainLoop = { running: false, scheduler: null, method: "", currentlyRunningMainloop: 0, func: null, arg: 0, timingMode: 0, timingValue: 0, currentFrameNumber: 0, queue: [], preMainLoop: [], postMainLoop: [], pause() { MainLoop.scheduler = null; MainLoop.currentlyRunningMainloop++; }, resume() { MainLoop.currentlyRunningMainloop++; var timingMode = MainLoop.timingMode; var timingValue = MainLoop.timingValue; var func = MainLoop.func; MainLoop.func = null; setMainLoop(func, 0, false, MainLoop.arg, true); _emscripten_set_main_loop_timing(timingMode, timingValue); MainLoop.scheduler(); }, updateStatus() { if (Module["setStatus"]) {
                var message = Module["statusMessage"] || "Please wait...";
                var remaining = MainLoop.remainingBlockers ?? 0;
                var expected = MainLoop.expectedBlockers ?? 0;
                if (remaining) {
                    if (remaining < expected) {
                        Module["setStatus"](`{message} ({expected - remaining}/{expected})`);
                    }
                    else {
                        Module["setStatus"](message);
                    }
                }
                else {
                    Module["setStatus"]("");
                }
            } }, init() { Module["preMainLoop"] && MainLoop.preMainLoop.push(Module["preMainLoop"]); Module["postMainLoop"] && MainLoop.postMainLoop.push(Module["postMainLoop"]); }, runIter(func) { if (ABORT)
                return; for (var pre of MainLoop.preMainLoop) {
                if (pre() === false) {
                    return;
                }
            } callUserCallback(func); for (var post of MainLoop.postMainLoop) {
                post();
            } checkStackCookie(); }, nextRAF: 0, fakeRequestAnimationFrame(func) { var now = Date.now(); if (MainLoop.nextRAF === 0) {
                MainLoop.nextRAF = now + 1e3 / 60;
            }
            else {
                while (now + 2 >= MainLoop.nextRAF) {
                    MainLoop.nextRAF += 1e3 / 60;
                }
            } var delay = Math.max(MainLoop.nextRAF - now, 0); setTimeout(func, delay); }, requestAnimationFrame(func) { if (typeof requestAnimationFrame == "function") {
                requestAnimationFrame(func);
                return;
            } var RAF = MainLoop.fakeRequestAnimationFrame; RAF(func); } };
        var AL = { QUEUE_INTERVAL: 25, QUEUE_LOOKAHEAD: .1, DEVICE_NAME: "Emscripten OpenAL", CAPTURE_DEVICE_NAME: "Emscripten OpenAL capture", ALC_EXTENSIONS: { ALC_SOFT_pause_device: true, ALC_SOFT_HRTF: true }, AL_EXTENSIONS: { AL_EXT_float32: true, AL_SOFT_loop_points: true, AL_SOFT_source_length: true, AL_EXT_source_distance_model: true, AL_SOFT_source_spatialize: true }, _alcErr: 0, alcErr: 0, deviceRefCounts: {}, alcStringCache: {}, paused: false, stringCache: {}, contexts: {}, currentCtx: null, buffers: { 0: { id: 0, refCount: 0, audioBuf: null, frequency: 0, bytesPerSample: 2, channels: 1, length: 0 } }, paramArray: [], _nextId: 1, newId: () => AL.freeIds.length > 0 ? AL.freeIds.pop() : AL._nextId++, freeIds: [], scheduleContextAudio: ctx => { if (MainLoop.timingMode === 1 && document["visibilityState"] != "visible") {
                return;
            } for (var i in ctx.sources) {
                AL.scheduleSourceAudio(ctx.sources[i]);
            } }, scheduleSourceAudio: (src, lookahead) => { if (MainLoop.timingMode === 1 && document["visibilityState"] != "visible") {
                return;
            } if (src.state !== 4114) {
                return;
            } var currentTime = AL.updateSourceTime(src); var startTime = src.bufStartTime; var startOffset = src.bufOffset; var bufCursor = src.bufsProcessed; for (var i = 0; i < src.audioQueue.length; i++) {
                var audioSrc = src.audioQueue[i];
                startTime = audioSrc._startTime + audioSrc._duration;
                startOffset = 0;
                bufCursor += audioSrc._skipCount + 1;
            } if (!lookahead) {
                lookahead = AL.QUEUE_LOOKAHEAD;
            } var lookaheadTime = currentTime + lookahead; var skipCount = 0; while (startTime < lookaheadTime) {
                if (bufCursor >= src.bufQueue.length) {
                    if (src.looping) {
                        bufCursor %= src.bufQueue.length;
                    }
                    else {
                        break;
                    }
                }
                var buf = src.bufQueue[bufCursor % src.bufQueue.length];
                if (buf.length === 0) {
                    skipCount++;
                    if (skipCount === src.bufQueue.length) {
                        break;
                    }
                }
                else {
                    var audioSrc = src.context.audioCtx.createBufferSource();
                    audioSrc.buffer = buf.audioBuf;
                    audioSrc.playbackRate.value = src.playbackRate;
                    if (buf.audioBuf._loopStart || buf.audioBuf._loopEnd) {
                        audioSrc.loopStart = buf.audioBuf._loopStart;
                        audioSrc.loopEnd = buf.audioBuf._loopEnd;
                    }
                    var duration = 0;
                    if (src.type === 4136 && src.looping) {
                        duration = Number.POSITIVE_INFINITY;
                        audioSrc.loop = true;
                        if (buf.audioBuf._loopStart) {
                            audioSrc.loopStart = buf.audioBuf._loopStart;
                        }
                        if (buf.audioBuf._loopEnd) {
                            audioSrc.loopEnd = buf.audioBuf._loopEnd;
                        }
                    }
                    else {
                        duration = (buf.audioBuf.duration - startOffset) / src.playbackRate;
                    }
                    audioSrc._startOffset = startOffset;
                    audioSrc._duration = duration;
                    audioSrc._skipCount = skipCount;
                    skipCount = 0;
                    audioSrc.connect(src.gain);
                    if (typeof audioSrc.start != "undefined") {
                        startTime = Math.max(startTime, src.context.audioCtx.currentTime);
                        audioSrc.start(startTime, startOffset);
                    }
                    else if (typeof audioSrc.noteOn != "undefined") {
                        startTime = Math.max(startTime, src.context.audioCtx.currentTime);
                        audioSrc.noteOn(startTime);
                    }
                    audioSrc._startTime = startTime;
                    src.audioQueue.push(audioSrc);
                    startTime += duration;
                }
                startOffset = 0;
                bufCursor++;
            } }, updateSourceTime: src => { var currentTime = src.context.audioCtx.currentTime; if (src.state !== 4114) {
                return currentTime;
            } if (!isFinite(src.bufStartTime)) {
                src.bufStartTime = currentTime - src.bufOffset / src.playbackRate;
                src.bufOffset = 0;
            } var nextStartTime = 0; while (src.audioQueue.length) {
                var audioSrc = src.audioQueue[0];
                src.bufsProcessed += audioSrc._skipCount;
                nextStartTime = audioSrc._startTime + audioSrc._duration;
                if (currentTime < nextStartTime) {
                    break;
                }
                src.audioQueue.shift();
                src.bufStartTime = nextStartTime;
                src.bufOffset = 0;
                src.bufsProcessed++;
            } if (src.bufsProcessed >= src.bufQueue.length && !src.looping) {
                AL.setSourceState(src, 4116);
            }
            else if (src.type === 4136 && src.looping) {
                var buf = src.bufQueue[0];
                if (buf.length === 0) {
                    src.bufOffset = 0;
                }
                else {
                    var delta = (currentTime - src.bufStartTime) * src.playbackRate;
                    var loopStart = buf.audioBuf._loopStart || 0;
                    var loopEnd = buf.audioBuf._loopEnd || buf.audioBuf.duration;
                    if (loopEnd <= loopStart) {
                        loopEnd = buf.audioBuf.duration;
                    }
                    if (delta < loopEnd) {
                        src.bufOffset = delta;
                    }
                    else {
                        src.bufOffset = loopStart + (delta - loopStart) % (loopEnd - loopStart);
                    }
                }
            }
            else if (src.audioQueue[0]) {
                src.bufOffset = (currentTime - src.audioQueue[0]._startTime) * src.playbackRate;
            }
            else {
                if (src.type !== 4136 && src.looping) {
                    var srcDuration = AL.sourceDuration(src) / src.playbackRate;
                    if (srcDuration > 0) {
                        src.bufStartTime += Math.floor((currentTime - src.bufStartTime) / srcDuration) * srcDuration;
                    }
                }
                for (var i = 0; i < src.bufQueue.length; i++) {
                    if (src.bufsProcessed >= src.bufQueue.length) {
                        if (src.looping) {
                            src.bufsProcessed %= src.bufQueue.length;
                        }
                        else {
                            AL.setSourceState(src, 4116);
                            break;
                        }
                    }
                    var buf = src.bufQueue[src.bufsProcessed];
                    if (buf.length > 0) {
                        nextStartTime = src.bufStartTime + buf.audioBuf.duration / src.playbackRate;
                        if (currentTime < nextStartTime) {
                            src.bufOffset = (currentTime - src.bufStartTime) * src.playbackRate;
                            break;
                        }
                        src.bufStartTime = nextStartTime;
                    }
                    src.bufOffset = 0;
                    src.bufsProcessed++;
                }
            } return currentTime; }, cancelPendingSourceAudio: src => { AL.updateSourceTime(src); for (var i = 1; i < src.audioQueue.length; i++) {
                var audioSrc = src.audioQueue[i];
                audioSrc.stop();
            } if (src.audioQueue.length > 1) {
                src.audioQueue.length = 1;
            } }, stopSourceAudio: src => { for (var i = 0; i < src.audioQueue.length; i++) {
                src.audioQueue[i].stop();
            } src.audioQueue.length = 0; }, setSourceState: (src, state) => { if (state === 4114) {
                if (src.state === 4114 || src.state == 4116) {
                    src.bufsProcessed = 0;
                    src.bufOffset = 0;
                }
                else { }
                AL.stopSourceAudio(src);
                src.state = 4114;
                src.bufStartTime = Number.NEGATIVE_INFINITY;
                AL.scheduleSourceAudio(src);
            }
            else if (state === 4115) {
                if (src.state === 4114) {
                    AL.updateSourceTime(src);
                    AL.stopSourceAudio(src);
                    src.state = 4115;
                }
            }
            else if (state === 4116) {
                if (src.state !== 4113) {
                    src.state = 4116;
                    src.bufsProcessed = src.bufQueue.length;
                    src.bufStartTime = Number.NEGATIVE_INFINITY;
                    src.bufOffset = 0;
                    AL.stopSourceAudio(src);
                }
            }
            else if (state === 4113) {
                if (src.state !== 4113) {
                    src.state = 4113;
                    src.bufsProcessed = 0;
                    src.bufStartTime = Number.NEGATIVE_INFINITY;
                    src.bufOffset = 0;
                    AL.stopSourceAudio(src);
                }
            } }, initSourcePanner: src => { if (src.type === 4144) {
                return;
            } var templateBuf = AL.buffers[0]; for (var i = 0; i < src.bufQueue.length; i++) {
                if (src.bufQueue[i].id !== 0) {
                    templateBuf = src.bufQueue[i];
                    break;
                }
            } if (src.spatialize === 1 || src.spatialize === 2 && templateBuf.channels === 1) {
                if (src.panner) {
                    return;
                }
                src.panner = src.context.audioCtx.createPanner();
                AL.updateSourceGlobal(src);
                AL.updateSourceSpace(src);
                src.panner.connect(src.context.gain);
                src.gain.disconnect();
                src.gain.connect(src.panner);
            }
            else {
                if (!src.panner) {
                    return;
                }
                src.panner.disconnect();
                src.gain.disconnect();
                src.gain.connect(src.context.gain);
                src.panner = null;
            } }, updateContextGlobal: ctx => { for (var i in ctx.sources) {
                AL.updateSourceGlobal(ctx.sources[i]);
            } }, updateSourceGlobal: src => { var panner = src.panner; if (!panner) {
                return;
            } panner.refDistance = src.refDistance; panner.maxDistance = src.maxDistance; panner.rolloffFactor = src.rolloffFactor; panner.panningModel = src.context.hrtf ? "HRTF" : "equalpower"; var distanceModel = src.context.sourceDistanceModel ? src.distanceModel : src.context.distanceModel; switch (distanceModel) {
                case 0:
                    panner.distanceModel = "inverse";
                    panner.refDistance = 340282e33;
                    break;
                case 53249:
                case 53250:
                    panner.distanceModel = "inverse";
                    break;
                case 53251:
                case 53252:
                    panner.distanceModel = "linear";
                    break;
                case 53253:
                case 53254:
                    panner.distanceModel = "exponential";
                    break;
            } }, updateListenerSpace: ctx => { var listener = ctx.audioCtx.listener; if (listener.positionX) {
                listener.positionX.value = ctx.listener.position[0];
                listener.positionY.value = ctx.listener.position[1];
                listener.positionZ.value = ctx.listener.position[2];
            }
            else {
                listener.setPosition(ctx.listener.position[0], ctx.listener.position[1], ctx.listener.position[2]);
            } if (listener.forwardX) {
                listener.forwardX.value = ctx.listener.direction[0];
                listener.forwardY.value = ctx.listener.direction[1];
                listener.forwardZ.value = ctx.listener.direction[2];
                listener.upX.value = ctx.listener.up[0];
                listener.upY.value = ctx.listener.up[1];
                listener.upZ.value = ctx.listener.up[2];
            }
            else {
                listener.setOrientation(ctx.listener.direction[0], ctx.listener.direction[1], ctx.listener.direction[2], ctx.listener.up[0], ctx.listener.up[1], ctx.listener.up[2]);
            } for (var i in ctx.sources) {
                AL.updateSourceSpace(ctx.sources[i]);
            } }, updateSourceSpace: src => { if (!src.panner) {
                return;
            } var panner = src.panner; var posX = src.position[0]; var posY = src.position[1]; var posZ = src.position[2]; var dirX = src.direction[0]; var dirY = src.direction[1]; var dirZ = src.direction[2]; var listener = src.context.listener; var lPosX = listener.position[0]; var lPosY = listener.position[1]; var lPosZ = listener.position[2]; if (src.relative) {
                var lBackX = -listener.direction[0];
                var lBackY = -listener.direction[1];
                var lBackZ = -listener.direction[2];
                var lUpX = listener.up[0];
                var lUpY = listener.up[1];
                var lUpZ = listener.up[2];
                var inverseMagnitude = (x, y, z) => { var length = Math.sqrt(x * x + y * y + z * z); if (length < Number.EPSILON) {
                    return 0;
                } return 1 / length; };
                var invMag = inverseMagnitude(lBackX, lBackY, lBackZ);
                lBackX *= invMag;
                lBackY *= invMag;
                lBackZ *= invMag;
                invMag = inverseMagnitude(lUpX, lUpY, lUpZ);
                lUpX *= invMag;
                lUpY *= invMag;
                lUpZ *= invMag;
                var lRightX = lUpY * lBackZ - lUpZ * lBackY;
                var lRightY = lUpZ * lBackX - lUpX * lBackZ;
                var lRightZ = lUpX * lBackY - lUpY * lBackX;
                invMag = inverseMagnitude(lRightX, lRightY, lRightZ);
                lRightX *= invMag;
                lRightY *= invMag;
                lRightZ *= invMag;
                lUpX = lBackY * lRightZ - lBackZ * lRightY;
                lUpY = lBackZ * lRightX - lBackX * lRightZ;
                lUpZ = lBackX * lRightY - lBackY * lRightX;
                var oldX = dirX;
                var oldY = dirY;
                var oldZ = dirZ;
                dirX = oldX * lRightX + oldY * lUpX + oldZ * lBackX;
                dirY = oldX * lRightY + oldY * lUpY + oldZ * lBackY;
                dirZ = oldX * lRightZ + oldY * lUpZ + oldZ * lBackZ;
                oldX = posX;
                oldY = posY;
                oldZ = posZ;
                posX = oldX * lRightX + oldY * lUpX + oldZ * lBackX;
                posY = oldX * lRightY + oldY * lUpY + oldZ * lBackY;
                posZ = oldX * lRightZ + oldY * lUpZ + oldZ * lBackZ;
                posX += lPosX;
                posY += lPosY;
                posZ += lPosZ;
            } if (panner.positionX) {
                if (posX != panner.positionX.value)
                    panner.positionX.value = posX;
                if (posY != panner.positionY.value)
                    panner.positionY.value = posY;
                if (posZ != panner.positionZ.value)
                    panner.positionZ.value = posZ;
            }
            else {
                panner.setPosition(posX, posY, posZ);
            } if (panner.orientationX) {
                if (dirX != panner.orientationX.value)
                    panner.orientationX.value = dirX;
                if (dirY != panner.orientationY.value)
                    panner.orientationY.value = dirY;
                if (dirZ != panner.orientationZ.value)
                    panner.orientationZ.value = dirZ;
            }
            else {
                panner.setOrientation(dirX, dirY, dirZ);
            } var oldShift = src.dopplerShift; var velX = src.velocity[0]; var velY = src.velocity[1]; var velZ = src.velocity[2]; var lVelX = listener.velocity[0]; var lVelY = listener.velocity[1]; var lVelZ = listener.velocity[2]; if (posX === lPosX && posY === lPosY && posZ === lPosZ || velX === lVelX && velY === lVelY && velZ === lVelZ) {
                src.dopplerShift = 1;
            }
            else {
                var speedOfSound = src.context.speedOfSound;
                var dopplerFactor = src.context.dopplerFactor;
                var slX = lPosX - posX;
                var slY = lPosY - posY;
                var slZ = lPosZ - posZ;
                var magSl = Math.sqrt(slX * slX + slY * slY + slZ * slZ);
                var vls = (slX * lVelX + slY * lVelY + slZ * lVelZ) / magSl;
                var vss = (slX * velX + slY * velY + slZ * velZ) / magSl;
                vls = Math.min(vls, speedOfSound / dopplerFactor);
                vss = Math.min(vss, speedOfSound / dopplerFactor);
                src.dopplerShift = (speedOfSound - dopplerFactor * vls) / (speedOfSound - dopplerFactor * vss);
            } if (src.dopplerShift !== oldShift) {
                AL.updateSourceRate(src);
            } }, updateSourceRate: src => { if (src.state === 4114) {
                AL.cancelPendingSourceAudio(src);
                var audioSrc = src.audioQueue[0];
                if (!audioSrc) {
                    return;
                }
                var duration;
                if (src.type === 4136 && src.looping) {
                    duration = Number.POSITIVE_INFINITY;
                }
                else {
                    duration = (audioSrc.buffer.duration - audioSrc._startOffset) / src.playbackRate;
                }
                audioSrc._duration = duration;
                audioSrc.playbackRate.value = src.playbackRate;
                AL.scheduleSourceAudio(src);
            } }, sourceDuration: src => { var length = 0; for (var i = 0; i < src.bufQueue.length; i++) {
                var audioBuf = src.bufQueue[i].audioBuf;
                length += audioBuf ? audioBuf.duration : 0;
            } return length; }, sourceTell: src => { AL.updateSourceTime(src); var offset = 0; for (var i = 0; i < src.bufsProcessed; i++) {
                if (src.bufQueue[i].audioBuf) {
                    offset += src.bufQueue[i].audioBuf.duration;
                }
            } offset += src.bufOffset; return offset; }, sourceSeek: (src, offset) => { var playing = src.state == 4114; if (playing) {
                AL.setSourceState(src, 4113);
            } if (src.bufQueue[src.bufsProcessed].audioBuf !== null) {
                src.bufsProcessed = 0;
                while (offset > src.bufQueue[src.bufsProcessed].audioBuf.duration) {
                    offset -= src.bufQueue[src.bufsProcessed].audioBuf.duration;
                    src.bufsProcessed++;
                }
                src.bufOffset = offset;
            } if (playing) {
                AL.setSourceState(src, 4114);
            } }, getGlobalParam: (funcname, param) => { if (!AL.currentCtx) {
                return null;
            } switch (param) {
                case 49152: return AL.currentCtx.dopplerFactor;
                case 49155: return AL.currentCtx.speedOfSound;
                case 53248: return AL.currentCtx.distanceModel;
                default:
                    AL.currentCtx.err = 40962;
                    return null;
            } }, setGlobalParam: (funcname, param, value) => { if (!AL.currentCtx) {
                return;
            } switch (param) {
                case 49152:
                    if (!Number.isFinite(value) || value < 0) {
                        AL.currentCtx.err = 40963;
                        return;
                    }
                    AL.currentCtx.dopplerFactor = value;
                    AL.updateListenerSpace(AL.currentCtx);
                    break;
                case 49155:
                    if (!Number.isFinite(value) || value <= 0) {
                        AL.currentCtx.err = 40963;
                        return;
                    }
                    AL.currentCtx.speedOfSound = value;
                    AL.updateListenerSpace(AL.currentCtx);
                    break;
                case 53248:
                    switch (value) {
                        case 0:
                        case 53249:
                        case 53250:
                        case 53251:
                        case 53252:
                        case 53253:
                        case 53254:
                            AL.currentCtx.distanceModel = value;
                            AL.updateContextGlobal(AL.currentCtx);
                            break;
                        default:
                            AL.currentCtx.err = 40963;
                            return;
                    }
                    break;
                default:
                    AL.currentCtx.err = 40962;
                    return;
            } }, getListenerParam: (funcname, param) => { if (!AL.currentCtx) {
                return null;
            } switch (param) {
                case 4100: return AL.currentCtx.listener.position;
                case 4102: return AL.currentCtx.listener.velocity;
                case 4111: return AL.currentCtx.listener.direction.concat(AL.currentCtx.listener.up);
                case 4106: return AL.currentCtx.gain.gain.value;
                default:
                    AL.currentCtx.err = 40962;
                    return null;
            } }, setListenerParam: (funcname, param, value) => { if (!AL.currentCtx) {
                return;
            } if (value === null) {
                AL.currentCtx.err = 40962;
                return;
            } var listener = AL.currentCtx.listener; switch (param) {
                case 4100:
                    if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
                        AL.currentCtx.err = 40963;
                        return;
                    }
                    listener.position[0] = value[0];
                    listener.position[1] = value[1];
                    listener.position[2] = value[2];
                    AL.updateListenerSpace(AL.currentCtx);
                    break;
                case 4102:
                    if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
                        AL.currentCtx.err = 40963;
                        return;
                    }
                    listener.velocity[0] = value[0];
                    listener.velocity[1] = value[1];
                    listener.velocity[2] = value[2];
                    AL.updateListenerSpace(AL.currentCtx);
                    break;
                case 4106:
                    if (!Number.isFinite(value) || value < 0) {
                        AL.currentCtx.err = 40963;
                        return;
                    }
                    AL.currentCtx.gain.gain.value = value;
                    break;
                case 4111:
                    if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2]) || !Number.isFinite(value[3]) || !Number.isFinite(value[4]) || !Number.isFinite(value[5])) {
                        AL.currentCtx.err = 40963;
                        return;
                    }
                    listener.direction[0] = value[0];
                    listener.direction[1] = value[1];
                    listener.direction[2] = value[2];
                    listener.up[0] = value[3];
                    listener.up[1] = value[4];
                    listener.up[2] = value[5];
                    AL.updateListenerSpace(AL.currentCtx);
                    break;
                default:
                    AL.currentCtx.err = 40962;
                    return;
            } }, getBufferParam: (funcname, bufferId, param) => { if (!AL.currentCtx) {
                return;
            } var buf = AL.buffers[bufferId]; if (!buf || bufferId === 0) {
                AL.currentCtx.err = 40961;
                return;
            } switch (param) {
                case 8193: return buf.frequency;
                case 8194: return buf.bytesPerSample * 8;
                case 8195: return buf.channels;
                case 8196: return buf.length * buf.bytesPerSample * buf.channels;
                case 8213:
                    if (buf.length === 0) {
                        return [0, 0];
                    }
                    return [(buf.audioBuf._loopStart || 0) * buf.frequency, (buf.audioBuf._loopEnd || buf.length) * buf.frequency];
                default:
                    AL.currentCtx.err = 40962;
                    return null;
            } }, setBufferParam: (funcname, bufferId, param, value) => { if (!AL.currentCtx) {
                return;
            } var buf = AL.buffers[bufferId]; if (!buf || bufferId === 0) {
                AL.currentCtx.err = 40961;
                return;
            } if (value === null) {
                AL.currentCtx.err = 40962;
                return;
            } switch (param) {
                case 8196:
                    if (value !== 0) {
                        AL.currentCtx.err = 40963;
                        return;
                    }
                    break;
                case 8213:
                    if (value[0] < 0 || value[0] > buf.length || value[1] < 0 || value[1] > buf.Length || value[0] >= value[1]) {
                        AL.currentCtx.err = 40963;
                        return;
                    }
                    if (buf.refCount > 0) {
                        AL.currentCtx.err = 40964;
                        return;
                    }
                    if (buf.audioBuf) {
                        buf.audioBuf._loopStart = value[0] / buf.frequency;
                        buf.audioBuf._loopEnd = value[1] / buf.frequency;
                    }
                    break;
                default:
                    AL.currentCtx.err = 40962;
                    return;
            } }, getSourceParam: (funcname, sourceId, param) => { if (!AL.currentCtx) {
                return null;
            } var src = AL.currentCtx.sources[sourceId]; if (!src) {
                AL.currentCtx.err = 40961;
                return null;
            } switch (param) {
                case 514: return src.relative;
                case 4097: return src.coneInnerAngle;
                case 4098: return src.coneOuterAngle;
                case 4099: return src.pitch;
                case 4100: return src.position;
                case 4101: return src.direction;
                case 4102: return src.velocity;
                case 4103: return src.looping;
                case 4105:
                    if (src.type === 4136) {
                        return src.bufQueue[0].id;
                    }
                    return 0;
                case 4106: return src.gain.gain.value;
                case 4109: return src.minGain;
                case 4110: return src.maxGain;
                case 4112: return src.state;
                case 4117:
                    if (src.bufQueue.length === 1 && src.bufQueue[0].id === 0) {
                        return 0;
                    }
                    return src.bufQueue.length;
                case 4118:
                    if (src.bufQueue.length === 1 && src.bufQueue[0].id === 0 || src.looping) {
                        return 0;
                    }
                    return src.bufsProcessed;
                case 4128: return src.refDistance;
                case 4129: return src.rolloffFactor;
                case 4130: return src.coneOuterGain;
                case 4131: return src.maxDistance;
                case 4132: return AL.sourceTell(src);
                case 4133:
                    var offset = AL.sourceTell(src);
                    if (offset > 0) {
                        offset *= src.bufQueue[0].frequency;
                    }
                    return offset;
                case 4134:
                    var offset = AL.sourceTell(src);
                    if (offset > 0) {
                        offset *= src.bufQueue[0].frequency * src.bufQueue[0].bytesPerSample;
                    }
                    return offset;
                case 4135: return src.type;
                case 4628: return src.spatialize;
                case 8201:
                    var length = 0;
                    var bytesPerFrame = 0;
                    for (var i = 0; i < src.bufQueue.length; i++) {
                        length += src.bufQueue[i].length;
                        if (src.bufQueue[i].id !== 0) {
                            bytesPerFrame = src.bufQueue[i].bytesPerSample * src.bufQueue[i].channels;
                        }
                    }
                    return length * bytesPerFrame;
                case 8202:
                    var length = 0;
                    for (var i = 0; i < src.bufQueue.length; i++) {
                        length += src.bufQueue[i].length;
                    }
                    return length;
                case 8203: return AL.sourceDuration(src);
                case 53248: return src.distanceModel;
                default:
                    AL.currentCtx.err = 40962;
                    return null;
            } }, setSourceParam: (funcname, sourceId, param, value) => { if (!AL.currentCtx) {
                return;
            } var src = AL.currentCtx.sources[sourceId]; if (!src) {
                AL.currentCtx.err = 40961;
                return;
            } if (value === null) {
                AL.currentCtx.err = 40962;
                return;
            } switch (param) {
                case 514:
                    if (value === 1) {
                        src.relative = true;
                        AL.updateSourceSpace(src);
                    }
                    else if (value === 0) {
                        src.relative = false;
                        AL.updateSourceSpace(src);
                    }
                    else {
                        AL.currentCtx.err = 40963;
                        return;
                    }
                    break;
                case 4097:
                    if (!Number.isFinite(value)) {
                        AL.currentCtx.err = 40963;
                        return;
                    }
                    src.coneInnerAngle = value;
                    if (src.panner) {
                        src.panner.coneInnerAngle = value % 360;
                    }
                    break;
                case 4098:
                    if (!Number.isFinite(value)) {
                        AL.currentCtx.err = 40963;
                        return;
                    }
                    src.coneOuterAngle = value;
                    if (src.panner) {
                        src.panner.coneOuterAngle = value % 360;
                    }
                    break;
                case 4099:
                    if (!Number.isFinite(value) || value <= 0) {
                        AL.currentCtx.err = 40963;
                        return;
                    }
                    if (src.pitch === value) {
                        break;
                    }
                    src.pitch = value;
                    AL.updateSourceRate(src);
                    break;
                case 4100:
                    if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
                        AL.currentCtx.err = 40963;
                        return;
                    }
                    src.position[0] = value[0];
                    src.position[1] = value[1];
                    src.position[2] = value[2];
                    AL.updateSourceSpace(src);
                    break;
                case 4101:
                    if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
                        AL.currentCtx.err = 40963;
                        return;
                    }
                    src.direction[0] = value[0];
                    src.direction[1] = value[1];
                    src.direction[2] = value[2];
                    AL.updateSourceSpace(src);
                    break;
                case 4102:
                    if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
                        AL.currentCtx.err = 40963;
                        return;
                    }
                    src.velocity[0] = value[0];
                    src.velocity[1] = value[1];
                    src.velocity[2] = value[2];
                    AL.updateSourceSpace(src);
                    break;
                case 4103:
                    if (value === 1) {
                        src.looping = true;
                        AL.updateSourceTime(src);
                        if (src.type === 4136 && src.audioQueue.length > 0) {
                            var audioSrc = src.audioQueue[0];
                            audioSrc.loop = true;
                            audioSrc._duration = Number.POSITIVE_INFINITY;
                        }
                    }
                    else if (value === 0) {
                        src.looping = false;
                        var currentTime = AL.updateSourceTime(src);
                        if (src.type === 4136 && src.audioQueue.length > 0) {
                            var audioSrc = src.audioQueue[0];
                            audioSrc.loop = false;
                            audioSrc._duration = src.bufQueue[0].audioBuf.duration / src.playbackRate;
                            audioSrc._startTime = currentTime - src.bufOffset / src.playbackRate;
                        }
                    }
                    else {
                        AL.currentCtx.err = 40963;
                        return;
                    }
                    break;
                case 4105:
                    if (src.state === 4114 || src.state === 4115) {
                        AL.currentCtx.err = 40964;
                        return;
                    }
                    if (value === 0) {
                        for (var i in src.bufQueue) {
                            src.bufQueue[i].refCount--;
                        }
                        src.bufQueue.length = 1;
                        src.bufQueue[0] = AL.buffers[0];
                        src.bufsProcessed = 0;
                        src.type = 4144;
                    }
                    else {
                        var buf = AL.buffers[value];
                        if (!buf) {
                            AL.currentCtx.err = 40963;
                            return;
                        }
                        for (var i in src.bufQueue) {
                            src.bufQueue[i].refCount--;
                        }
                        src.bufQueue.length = 0;
                        buf.refCount++;
                        src.bufQueue = [buf];
                        src.bufsProcessed = 0;
                        src.type = 4136;
                    }
                    AL.initSourcePanner(src);
                    AL.scheduleSourceAudio(src);
                    break;
                case 4106:
                    if (!Number.isFinite(value) || value < 0) {
                        AL.currentCtx.err = 40963;
                        return;
                    }
                    src.gain.gain.value = value;
                    break;
                case 4109:
                    if (!Number.isFinite(value) || value < 0 || value > Math.min(src.maxGain, 1)) {
                        AL.currentCtx.err = 40963;
                        return;
                    }
                    src.minGain = value;
                    break;
                case 4110:
                    if (!Number.isFinite(value) || value < Math.max(0, src.minGain) || value > 1) {
                        AL.currentCtx.err = 40963;
                        return;
                    }
                    src.maxGain = value;
                    break;
                case 4128:
                    if (!Number.isFinite(value) || value < 0) {
                        AL.currentCtx.err = 40963;
                        return;
                    }
                    src.refDistance = value;
                    if (src.panner) {
                        src.panner.refDistance = value;
                    }
                    break;
                case 4129:
                    if (!Number.isFinite(value) || value < 0) {
                        AL.currentCtx.err = 40963;
                        return;
                    }
                    src.rolloffFactor = value;
                    if (src.panner) {
                        src.panner.rolloffFactor = value;
                    }
                    break;
                case 4130:
                    if (!Number.isFinite(value) || value < 0 || value > 1) {
                        AL.currentCtx.err = 40963;
                        return;
                    }
                    src.coneOuterGain = value;
                    if (src.panner) {
                        src.panner.coneOuterGain = value;
                    }
                    break;
                case 4131:
                    if (!Number.isFinite(value) || value < 0) {
                        AL.currentCtx.err = 40963;
                        return;
                    }
                    src.maxDistance = value;
                    if (src.panner) {
                        src.panner.maxDistance = value;
                    }
                    break;
                case 4132:
                    if (value < 0 || value > AL.sourceDuration(src)) {
                        AL.currentCtx.err = 40963;
                        return;
                    }
                    AL.sourceSeek(src, value);
                    break;
                case 4133:
                    var srcLen = AL.sourceDuration(src);
                    if (srcLen > 0) {
                        var frequency;
                        for (var bufId in src.bufQueue) {
                            if (bufId) {
                                frequency = src.bufQueue[bufId].frequency;
                                break;
                            }
                        }
                        value /= frequency;
                    }
                    if (value < 0 || value > srcLen) {
                        AL.currentCtx.err = 40963;
                        return;
                    }
                    AL.sourceSeek(src, value);
                    break;
                case 4134:
                    var srcLen = AL.sourceDuration(src);
                    if (srcLen > 0) {
                        var bytesPerSec;
                        for (var bufId in src.bufQueue) {
                            if (bufId) {
                                var buf = src.bufQueue[bufId];
                                bytesPerSec = buf.frequency * buf.bytesPerSample * buf.channels;
                                break;
                            }
                        }
                        value /= bytesPerSec;
                    }
                    if (value < 0 || value > srcLen) {
                        AL.currentCtx.err = 40963;
                        return;
                    }
                    AL.sourceSeek(src, value);
                    break;
                case 4628:
                    if (value !== 0 && value !== 1 && value !== 2) {
                        AL.currentCtx.err = 40963;
                        return;
                    }
                    src.spatialize = value;
                    AL.initSourcePanner(src);
                    break;
                case 8201:
                case 8202:
                case 8203:
                    AL.currentCtx.err = 40964;
                    break;
                case 53248:
                    switch (value) {
                        case 0:
                        case 53249:
                        case 53250:
                        case 53251:
                        case 53252:
                        case 53253:
                        case 53254:
                            src.distanceModel = value;
                            if (AL.currentCtx.sourceDistanceModel) {
                                AL.updateContextGlobal(AL.currentCtx);
                            }
                            break;
                        default:
                            AL.currentCtx.err = 40963;
                            return;
                    }
                    break;
                default:
                    AL.currentCtx.err = 40962;
                    return;
            } }, captures: {}, sharedCaptureAudioCtx: null, requireValidCaptureDevice: (deviceId, funcname) => { if (deviceId === 0) {
                AL.alcErr = 40961;
                return null;
            } var c = AL.captures[deviceId]; if (!c) {
                AL.alcErr = 40961;
                return null;
            } var err = c.mediaStreamError; if (err) {
                AL.alcErr = 40961;
                return null;
            } return c; } };
        var _alBuffer3f = (bufferId, param, value0, value1, value2) => { AL.setBufferParam("alBuffer3f", bufferId, param, null); };
        _alBuffer3f.sig = "viifff";
        var _alBuffer3i = (bufferId, param, value0, value1, value2) => { AL.setBufferParam("alBuffer3i", bufferId, param, null); };
        _alBuffer3i.sig = "viiiii";
        var _alBufferData = (bufferId, format, pData, size, freq) => { if (!AL.currentCtx) {
            return;
        } var buf = AL.buffers[bufferId]; if (!buf) {
            AL.currentCtx.err = 40963;
            return;
        } if (freq <= 0) {
            AL.currentCtx.err = 40963;
            return;
        } var audioBuf = null; try {
            switch (format) {
                case 4352:
                    if (size > 0) {
                        audioBuf = AL.currentCtx.audioCtx.createBuffer(1, size, freq);
                        var channel0 = audioBuf.getChannelData(0);
                        for (var i = 0; i < size; ++i) {
                            channel0[i] = HEAPU8[pData++] * .0078125 - 1;
                        }
                    }
                    buf.bytesPerSample = 1;
                    buf.channels = 1;
                    buf.length = size;
                    break;
                case 4353:
                    if (size > 0) {
                        audioBuf = AL.currentCtx.audioCtx.createBuffer(1, size >> 1, freq);
                        var channel0 = audioBuf.getChannelData(0);
                        pData >>= 1;
                        for (var i = 0; i < size >> 1; ++i) {
                            channel0[i] = HEAP16[pData++] * 30517578125e-15;
                        }
                    }
                    buf.bytesPerSample = 2;
                    buf.channels = 1;
                    buf.length = size >> 1;
                    break;
                case 4354:
                    if (size > 0) {
                        audioBuf = AL.currentCtx.audioCtx.createBuffer(2, size >> 1, freq);
                        var channel0 = audioBuf.getChannelData(0);
                        var channel1 = audioBuf.getChannelData(1);
                        for (var i = 0; i < size >> 1; ++i) {
                            channel0[i] = HEAPU8[pData++] * .0078125 - 1;
                            channel1[i] = HEAPU8[pData++] * .0078125 - 1;
                        }
                    }
                    buf.bytesPerSample = 1;
                    buf.channels = 2;
                    buf.length = size >> 1;
                    break;
                case 4355:
                    if (size > 0) {
                        audioBuf = AL.currentCtx.audioCtx.createBuffer(2, size >> 2, freq);
                        var channel0 = audioBuf.getChannelData(0);
                        var channel1 = audioBuf.getChannelData(1);
                        pData >>= 1;
                        for (var i = 0; i < size >> 2; ++i) {
                            channel0[i] = HEAP16[pData++] * 30517578125e-15;
                            channel1[i] = HEAP16[pData++] * 30517578125e-15;
                        }
                    }
                    buf.bytesPerSample = 2;
                    buf.channels = 2;
                    buf.length = size >> 2;
                    break;
                case 65552:
                    if (size > 0) {
                        audioBuf = AL.currentCtx.audioCtx.createBuffer(1, size >> 2, freq);
                        var channel0 = audioBuf.getChannelData(0);
                        pData >>= 2;
                        for (var i = 0; i < size >> 2; ++i) {
                            channel0[i] = HEAPF32[pData++];
                        }
                    }
                    buf.bytesPerSample = 4;
                    buf.channels = 1;
                    buf.length = size >> 2;
                    break;
                case 65553:
                    if (size > 0) {
                        audioBuf = AL.currentCtx.audioCtx.createBuffer(2, size >> 3, freq);
                        var channel0 = audioBuf.getChannelData(0);
                        var channel1 = audioBuf.getChannelData(1);
                        pData >>= 2;
                        for (var i = 0; i < size >> 3; ++i) {
                            channel0[i] = HEAPF32[pData++];
                            channel1[i] = HEAPF32[pData++];
                        }
                    }
                    buf.bytesPerSample = 4;
                    buf.channels = 2;
                    buf.length = size >> 3;
                    break;
                default:
                    AL.currentCtx.err = 40963;
                    return;
            }
            buf.frequency = freq;
            buf.audioBuf = audioBuf;
        }
        catch (e) {
            AL.currentCtx.err = 40963;
            return;
        } };
        _alBufferData.sig = "viipii";
        var _alBufferf = (bufferId, param, value) => { AL.setBufferParam("alBufferf", bufferId, param, null); };
        _alBufferf.sig = "viif";
        var _alBufferfv = (bufferId, param, pValues) => { if (!AL.currentCtx) {
            return;
        } if (!pValues) {
            AL.currentCtx.err = 40963;
            return;
        } AL.setBufferParam("alBufferfv", bufferId, param, null); };
        _alBufferfv.sig = "viip";
        var _alBufferi = (bufferId, param, value) => { AL.setBufferParam("alBufferi", bufferId, param, null); };
        _alBufferi.sig = "viii";
        var _alBufferiv = (bufferId, param, pValues) => { if (!AL.currentCtx) {
            return;
        } if (!pValues) {
            AL.currentCtx.err = 40963;
            return;
        } switch (param) {
            case 8213:
                AL.paramArray[0] = HEAP32[pValues >> 2];
                AL.paramArray[1] = HEAP32[pValues + 4 >> 2];
                AL.setBufferParam("alBufferiv", bufferId, param, AL.paramArray);
                break;
            default:
                AL.setBufferParam("alBufferiv", bufferId, param, null);
                break;
        } };
        _alBufferiv.sig = "viip";
        var _alDeleteBuffers = (count, pBufferIds) => { if (!AL.currentCtx) {
            return;
        } for (var i = 0; i < count; ++i) {
            var bufId = HEAP32[pBufferIds + i * 4 >> 2];
            if (bufId === 0) {
                continue;
            }
            if (!AL.buffers[bufId]) {
                AL.currentCtx.err = 40961;
                return;
            }
            if (AL.buffers[bufId].refCount) {
                AL.currentCtx.err = 40964;
                return;
            }
        } for (var i = 0; i < count; ++i) {
            var bufId = HEAP32[pBufferIds + i * 4 >> 2];
            if (bufId === 0) {
                continue;
            }
            AL.deviceRefCounts[AL.buffers[bufId].deviceId]--;
            delete AL.buffers[bufId];
            AL.freeIds.push(bufId);
        } };
        _alDeleteBuffers.sig = "vip";
        var _alSourcei = (sourceId, param, value) => { switch (param) {
            case 514:
            case 4097:
            case 4098:
            case 4103:
            case 4105:
            case 4128:
            case 4129:
            case 4131:
            case 4132:
            case 4133:
            case 4134:
            case 4628:
            case 8201:
            case 8202:
            case 53248:
                AL.setSourceParam("alSourcei", sourceId, param, value);
                break;
            default:
                AL.setSourceParam("alSourcei", sourceId, param, null);
                break;
        } };
        _alSourcei.sig = "viii";
        var _alDeleteSources = (count, pSourceIds) => { if (!AL.currentCtx) {
            return;
        } for (var i = 0; i < count; ++i) {
            var srcId = HEAP32[pSourceIds + i * 4 >> 2];
            if (!AL.currentCtx.sources[srcId]) {
                AL.currentCtx.err = 40961;
                return;
            }
        } for (var i = 0; i < count; ++i) {
            var srcId = HEAP32[pSourceIds + i * 4 >> 2];
            AL.setSourceState(AL.currentCtx.sources[srcId], 4116);
            _alSourcei(srcId, 4105, 0);
            delete AL.currentCtx.sources[srcId];
            AL.freeIds.push(srcId);
        } };
        _alDeleteSources.sig = "vip";
        var _alDisable = param => { if (!AL.currentCtx) {
            return;
        } switch (param) {
            case 512:
                AL.currentCtx.sourceDistanceModel = false;
                AL.updateContextGlobal(AL.currentCtx);
                break;
            default:
                AL.currentCtx.err = 40962;
                return;
        } };
        _alDisable.sig = "vi";
        var _alDistanceModel = model => { AL.setGlobalParam("alDistanceModel", 53248, model); };
        _alDistanceModel.sig = "vi";
        var _alDopplerFactor = value => { AL.setGlobalParam("alDopplerFactor", 49152, value); };
        _alDopplerFactor.sig = "vf";
        var _alDopplerVelocity = value => { warnOnce("alDopplerVelocity() is deprecated, and only kept for compatibility with OpenAL 1.0. Use alSpeedOfSound() instead."); if (!AL.currentCtx) {
            return;
        } if (value <= 0) {
            AL.currentCtx.err = 40963;
            return;
        } };
        _alDopplerVelocity.sig = "vf";
        var _alEnable = param => { if (!AL.currentCtx) {
            return;
        } switch (param) {
            case 512:
                AL.currentCtx.sourceDistanceModel = true;
                AL.updateContextGlobal(AL.currentCtx);
                break;
            default:
                AL.currentCtx.err = 40962;
                return;
        } };
        _alEnable.sig = "vi";
        var _alGenBuffers = (count, pBufferIds) => { if (!AL.currentCtx) {
            return;
        } for (var i = 0; i < count; ++i) {
            var buf = { deviceId: AL.currentCtx.deviceId, id: AL.newId(), refCount: 0, audioBuf: null, frequency: 0, bytesPerSample: 2, channels: 1, length: 0 };
            AL.deviceRefCounts[buf.deviceId]++;
            AL.buffers[buf.id] = buf;
            HEAP32[pBufferIds + i * 4 >> 2] = buf.id;
        } };
        _alGenBuffers.sig = "vip";
        var _alGenSources = (count, pSourceIds) => { if (!AL.currentCtx) {
            return;
        } for (var i = 0; i < count; ++i) {
            var gain = AL.currentCtx.audioCtx.createGain();
            gain.connect(AL.currentCtx.gain);
            var src = { context: AL.currentCtx, id: AL.newId(), type: 4144, state: 4113, bufQueue: [AL.buffers[0]], audioQueue: [], looping: false, pitch: 1, dopplerShift: 1, gain, minGain: 0, maxGain: 1, panner: null, bufsProcessed: 0, bufStartTime: Number.NEGATIVE_INFINITY, bufOffset: 0, relative: false, refDistance: 1, maxDistance: 340282e33, rolloffFactor: 1, position: [0, 0, 0], velocity: [0, 0, 0], direction: [0, 0, 0], coneOuterGain: 0, coneInnerAngle: 360, coneOuterAngle: 360, distanceModel: 53250, spatialize: 2, get playbackRate() { return this.pitch * this.dopplerShift; } };
            AL.currentCtx.sources[src.id] = src;
            HEAP32[pSourceIds + i * 4 >> 2] = src.id;
        } };
        _alGenSources.sig = "vip";
        var _alGetBoolean = param => { var val = AL.getGlobalParam("alGetBoolean", param); if (val === null) {
            return 0;
        } switch (param) {
            case 49152:
            case 49155:
            case 53248: return val !== 0 ? 1 : 0;
            default:
                AL.currentCtx.err = 40962;
                return 0;
        } };
        _alGetBoolean.sig = "ii";
        var _alGetBooleanv = (param, pValues) => { var val = AL.getGlobalParam("alGetBooleanv", param); if (val === null || !pValues) {
            return;
        } switch (param) {
            case 49152:
            case 49155:
            case 53248:
                HEAP8[pValues] = val;
                break;
            default:
                AL.currentCtx.err = 40962;
                return;
        } };
        _alGetBooleanv.sig = "vip";
        var _alGetBuffer3f = (bufferId, param, pValue0, pValue1, pValue2) => { var val = AL.getBufferParam("alGetBuffer3f", bufferId, param); if (val === null) {
            return;
        } if (!pValue0 || !pValue1 || !pValue2) {
            AL.currentCtx.err = 40963;
            return;
        } AL.currentCtx.err = 40962; };
        _alGetBuffer3f.sig = "viippp";
        var _alGetBuffer3i = (bufferId, param, pValue0, pValue1, pValue2) => { var val = AL.getBufferParam("alGetBuffer3i", bufferId, param); if (val === null) {
            return;
        } if (!pValue0 || !pValue1 || !pValue2) {
            AL.currentCtx.err = 40963;
            return;
        } AL.currentCtx.err = 40962; };
        _alGetBuffer3i.sig = "viippp";
        var _alGetBufferf = (bufferId, param, pValue) => { var val = AL.getBufferParam("alGetBufferf", bufferId, param); if (val === null) {
            return;
        } if (!pValue) {
            AL.currentCtx.err = 40963;
            return;
        } AL.currentCtx.err = 40962; };
        _alGetBufferf.sig = "viip";
        var _alGetBufferfv = (bufferId, param, pValues) => { var val = AL.getBufferParam("alGetBufferfv", bufferId, param); if (val === null) {
            return;
        } if (!pValues) {
            AL.currentCtx.err = 40963;
            return;
        } AL.currentCtx.err = 40962; };
        _alGetBufferfv.sig = "viip";
        var _alGetBufferi = (bufferId, param, pValue) => { var val = AL.getBufferParam("alGetBufferi", bufferId, param); if (val === null) {
            return;
        } if (!pValue) {
            AL.currentCtx.err = 40963;
            return;
        } switch (param) {
            case 8193:
            case 8194:
            case 8195:
            case 8196:
                HEAP32[pValue >> 2] = val;
                break;
            default:
                AL.currentCtx.err = 40962;
                return;
        } };
        _alGetBufferi.sig = "viip";
        var _alGetBufferiv = (bufferId, param, pValues) => { var val = AL.getBufferParam("alGetBufferiv", bufferId, param); if (val === null) {
            return;
        } if (!pValues) {
            AL.currentCtx.err = 40963;
            return;
        } switch (param) {
            case 8193:
            case 8194:
            case 8195:
            case 8196:
                HEAP32[pValues >> 2] = val;
                break;
            case 8213:
                HEAP32[pValues >> 2] = val[0];
                HEAP32[pValues + 4 >> 2] = val[1];
                break;
            default:
                AL.currentCtx.err = 40962;
                return;
        } };
        _alGetBufferiv.sig = "viip";
        var _alGetDouble = param => { var val = AL.getGlobalParam("alGetDouble", param); if (val === null) {
            return 0;
        } switch (param) {
            case 49152:
            case 49155:
            case 53248: return val;
            default:
                AL.currentCtx.err = 40962;
                return 0;
        } };
        _alGetDouble.sig = "di";
        var _alGetDoublev = (param, pValues) => { var val = AL.getGlobalParam("alGetDoublev", param); if (val === null || !pValues) {
            return;
        } switch (param) {
            case 49152:
            case 49155:
            case 53248:
                HEAPF64[pValues >> 3] = val;
                break;
            default:
                AL.currentCtx.err = 40962;
                return;
        } };
        _alGetDoublev.sig = "vip";
        var _alGetEnumValue = pEnumName => { if (!AL.currentCtx) {
            return 0;
        } if (!pEnumName) {
            AL.currentCtx.err = 40963;
            return 0;
        } var name = UTF8ToString(pEnumName); switch (name) {
            case "AL_BITS": return 8194;
            case "AL_BUFFER": return 4105;
            case "AL_BUFFERS_PROCESSED": return 4118;
            case "AL_BUFFERS_QUEUED": return 4117;
            case "AL_BYTE_OFFSET": return 4134;
            case "AL_CHANNELS": return 8195;
            case "AL_CONE_INNER_ANGLE": return 4097;
            case "AL_CONE_OUTER_ANGLE": return 4098;
            case "AL_CONE_OUTER_GAIN": return 4130;
            case "AL_DIRECTION": return 4101;
            case "AL_DISTANCE_MODEL": return 53248;
            case "AL_DOPPLER_FACTOR": return 49152;
            case "AL_DOPPLER_VELOCITY": return 49153;
            case "AL_EXPONENT_DISTANCE": return 53253;
            case "AL_EXPONENT_DISTANCE_CLAMPED": return 53254;
            case "AL_EXTENSIONS": return 45060;
            case "AL_FORMAT_MONO16": return 4353;
            case "AL_FORMAT_MONO8": return 4352;
            case "AL_FORMAT_STEREO16": return 4355;
            case "AL_FORMAT_STEREO8": return 4354;
            case "AL_FREQUENCY": return 8193;
            case "AL_GAIN": return 4106;
            case "AL_INITIAL": return 4113;
            case "AL_INVALID": return -1;
            case "AL_ILLEGAL_ENUM":
            case "AL_INVALID_ENUM": return 40962;
            case "AL_INVALID_NAME": return 40961;
            case "AL_ILLEGAL_COMMAND":
            case "AL_INVALID_OPERATION": return 40964;
            case "AL_INVALID_VALUE": return 40963;
            case "AL_INVERSE_DISTANCE": return 53249;
            case "AL_INVERSE_DISTANCE_CLAMPED": return 53250;
            case "AL_LINEAR_DISTANCE": return 53251;
            case "AL_LINEAR_DISTANCE_CLAMPED": return 53252;
            case "AL_LOOPING": return 4103;
            case "AL_MAX_DISTANCE": return 4131;
            case "AL_MAX_GAIN": return 4110;
            case "AL_MIN_GAIN": return 4109;
            case "AL_NONE": return 0;
            case "AL_NO_ERROR": return 0;
            case "AL_ORIENTATION": return 4111;
            case "AL_OUT_OF_MEMORY": return 40965;
            case "AL_PAUSED": return 4115;
            case "AL_PENDING": return 8209;
            case "AL_PITCH": return 4099;
            case "AL_PLAYING": return 4114;
            case "AL_POSITION": return 4100;
            case "AL_PROCESSED": return 8210;
            case "AL_REFERENCE_DISTANCE": return 4128;
            case "AL_RENDERER": return 45059;
            case "AL_ROLLOFF_FACTOR": return 4129;
            case "AL_SAMPLE_OFFSET": return 4133;
            case "AL_SEC_OFFSET": return 4132;
            case "AL_SIZE": return 8196;
            case "AL_SOURCE_RELATIVE": return 514;
            case "AL_SOURCE_STATE": return 4112;
            case "AL_SOURCE_TYPE": return 4135;
            case "AL_SPEED_OF_SOUND": return 49155;
            case "AL_STATIC": return 4136;
            case "AL_STOPPED": return 4116;
            case "AL_STREAMING": return 4137;
            case "AL_UNDETERMINED": return 4144;
            case "AL_UNUSED": return 8208;
            case "AL_VELOCITY": return 4102;
            case "AL_VENDOR": return 45057;
            case "AL_VERSION": return 45058;
            case "AL_AUTO_SOFT": return 2;
            case "AL_SOURCE_DISTANCE_MODEL": return 512;
            case "AL_SOURCE_SPATIALIZE_SOFT": return 4628;
            case "AL_LOOP_POINTS_SOFT": return 8213;
            case "AL_BYTE_LENGTH_SOFT": return 8201;
            case "AL_SAMPLE_LENGTH_SOFT": return 8202;
            case "AL_SEC_LENGTH_SOFT": return 8203;
            case "AL_FORMAT_MONO_FLOAT32": return 65552;
            case "AL_FORMAT_STEREO_FLOAT32": return 65553;
            default:
                AL.currentCtx.err = 40963;
                return 0;
        } };
        _alGetEnumValue.sig = "ip";
        var _alGetError = () => { if (!AL.currentCtx) {
            return 40964;
        } var err = AL.currentCtx.err; AL.currentCtx.err = 0; return err; };
        _alGetError.sig = "i";
        var _alGetFloat = param => { var val = AL.getGlobalParam("alGetFloat", param); if (val === null) {
            return 0;
        } switch (param) {
            case 49152:
            case 49155:
            case 53248: return val;
            default: return 0;
        } };
        _alGetFloat.sig = "fi";
        var _alGetFloatv = (param, pValues) => { var val = AL.getGlobalParam("alGetFloatv", param); if (val === null || !pValues) {
            return;
        } switch (param) {
            case 49152:
            case 49155:
            case 53248:
                HEAPF32[pValues >> 2] = val;
                break;
            default:
                AL.currentCtx.err = 40962;
                return;
        } };
        _alGetFloatv.sig = "vip";
        var _alGetInteger = param => { var val = AL.getGlobalParam("alGetInteger", param); if (val === null) {
            return 0;
        } switch (param) {
            case 49152:
            case 49155:
            case 53248: return val;
            default:
                AL.currentCtx.err = 40962;
                return 0;
        } };
        _alGetInteger.sig = "ii";
        var _alGetIntegerv = (param, pValues) => { var val = AL.getGlobalParam("alGetIntegerv", param); if (val === null || !pValues) {
            return;
        } switch (param) {
            case 49152:
            case 49155:
            case 53248:
                HEAP32[pValues >> 2] = val;
                break;
            default:
                AL.currentCtx.err = 40962;
                return;
        } };
        _alGetIntegerv.sig = "vip";
        var _alGetListener3f = (param, pValue0, pValue1, pValue2) => { var val = AL.getListenerParam("alGetListener3f", param); if (val === null) {
            return;
        } if (!pValue0 || !pValue1 || !pValue2) {
            AL.currentCtx.err = 40963;
            return;
        } switch (param) {
            case 4100:
            case 4102:
                HEAPF32[pValue0 >> 2] = val[0];
                HEAPF32[pValue1 >> 2] = val[1];
                HEAPF32[pValue2 >> 2] = val[2];
                break;
            default:
                AL.currentCtx.err = 40962;
                return;
        } };
        _alGetListener3f.sig = "vippp";
        var _alGetListener3i = (param, pValue0, pValue1, pValue2) => { var val = AL.getListenerParam("alGetListener3i", param); if (val === null) {
            return;
        } if (!pValue0 || !pValue1 || !pValue2) {
            AL.currentCtx.err = 40963;
            return;
        } switch (param) {
            case 4100:
            case 4102:
                HEAP32[pValue0 >> 2] = val[0];
                HEAP32[pValue1 >> 2] = val[1];
                HEAP32[pValue2 >> 2] = val[2];
                break;
            default:
                AL.currentCtx.err = 40962;
                return;
        } };
        _alGetListener3i.sig = "vippp";
        var _alGetListenerf = (param, pValue) => { var val = AL.getListenerParam("alGetListenerf", param); if (val === null) {
            return;
        } if (!pValue) {
            AL.currentCtx.err = 40963;
            return;
        } switch (param) {
            case 4106:
                HEAPF32[pValue >> 2] = val;
                break;
            default:
                AL.currentCtx.err = 40962;
                return;
        } };
        _alGetListenerf.sig = "vip";
        var _alGetListenerfv = (param, pValues) => { var val = AL.getListenerParam("alGetListenerfv", param); if (val === null) {
            return;
        } if (!pValues) {
            AL.currentCtx.err = 40963;
            return;
        } switch (param) {
            case 4100:
            case 4102:
                HEAPF32[pValues >> 2] = val[0];
                HEAPF32[pValues + 4 >> 2] = val[1];
                HEAPF32[pValues + 8 >> 2] = val[2];
                break;
            case 4111:
                HEAPF32[pValues >> 2] = val[0];
                HEAPF32[pValues + 4 >> 2] = val[1];
                HEAPF32[pValues + 8 >> 2] = val[2];
                HEAPF32[pValues + 12 >> 2] = val[3];
                HEAPF32[pValues + 16 >> 2] = val[4];
                HEAPF32[pValues + 20 >> 2] = val[5];
                break;
            default:
                AL.currentCtx.err = 40962;
                return;
        } };
        _alGetListenerfv.sig = "vip";
        var _alGetListeneri = (param, pValue) => { var val = AL.getListenerParam("alGetListeneri", param); if (val === null) {
            return;
        } if (!pValue) {
            AL.currentCtx.err = 40963;
            return;
        } AL.currentCtx.err = 40962; };
        _alGetListeneri.sig = "vip";
        var _alGetListeneriv = (param, pValues) => { var val = AL.getListenerParam("alGetListeneriv", param); if (val === null) {
            return;
        } if (!pValues) {
            AL.currentCtx.err = 40963;
            return;
        } switch (param) {
            case 4100:
            case 4102:
                HEAP32[pValues >> 2] = val[0];
                HEAP32[pValues + 4 >> 2] = val[1];
                HEAP32[pValues + 8 >> 2] = val[2];
                break;
            case 4111:
                HEAP32[pValues >> 2] = val[0];
                HEAP32[pValues + 4 >> 2] = val[1];
                HEAP32[pValues + 8 >> 2] = val[2];
                HEAP32[pValues + 12 >> 2] = val[3];
                HEAP32[pValues + 16 >> 2] = val[4];
                HEAP32[pValues + 20 >> 2] = val[5];
                break;
            default:
                AL.currentCtx.err = 40962;
                return;
        } };
        _alGetListeneriv.sig = "vip";
        var _alGetSource3f = (sourceId, param, pValue0, pValue1, pValue2) => { var val = AL.getSourceParam("alGetSource3f", sourceId, param); if (val === null) {
            return;
        } if (!pValue0 || !pValue1 || !pValue2) {
            AL.currentCtx.err = 40963;
            return;
        } switch (param) {
            case 4100:
            case 4101:
            case 4102:
                HEAPF32[pValue0 >> 2] = val[0];
                HEAPF32[pValue1 >> 2] = val[1];
                HEAPF32[pValue2 >> 2] = val[2];
                break;
            default:
                AL.currentCtx.err = 40962;
                return;
        } };
        _alGetSource3f.sig = "viippp";
        var _alGetSource3i = (sourceId, param, pValue0, pValue1, pValue2) => { var val = AL.getSourceParam("alGetSource3i", sourceId, param); if (val === null) {
            return;
        } if (!pValue0 || !pValue1 || !pValue2) {
            AL.currentCtx.err = 40963;
            return;
        } switch (param) {
            case 4100:
            case 4101:
            case 4102:
                HEAP32[pValue0 >> 2] = val[0];
                HEAP32[pValue1 >> 2] = val[1];
                HEAP32[pValue2 >> 2] = val[2];
                break;
            default:
                AL.currentCtx.err = 40962;
                return;
        } };
        _alGetSource3i.sig = "viippp";
        var _alGetSourcef = (sourceId, param, pValue) => { var val = AL.getSourceParam("alGetSourcef", sourceId, param); if (val === null) {
            return;
        } if (!pValue) {
            AL.currentCtx.err = 40963;
            return;
        } switch (param) {
            case 4097:
            case 4098:
            case 4099:
            case 4106:
            case 4109:
            case 4110:
            case 4128:
            case 4129:
            case 4130:
            case 4131:
            case 4132:
            case 4133:
            case 4134:
            case 8203:
                HEAPF32[pValue >> 2] = val;
                break;
            default:
                AL.currentCtx.err = 40962;
                return;
        } };
        _alGetSourcef.sig = "viip";
        var _alGetSourcefv = (sourceId, param, pValues) => { var val = AL.getSourceParam("alGetSourcefv", sourceId, param); if (val === null) {
            return;
        } if (!pValues) {
            AL.currentCtx.err = 40963;
            return;
        } switch (param) {
            case 4097:
            case 4098:
            case 4099:
            case 4106:
            case 4109:
            case 4110:
            case 4128:
            case 4129:
            case 4130:
            case 4131:
            case 4132:
            case 4133:
            case 4134:
            case 8203:
                HEAPF32[pValues >> 2] = val[0];
                break;
            case 4100:
            case 4101:
            case 4102:
                HEAPF32[pValues >> 2] = val[0];
                HEAPF32[pValues + 4 >> 2] = val[1];
                HEAPF32[pValues + 8 >> 2] = val[2];
                break;
            default:
                AL.currentCtx.err = 40962;
                return;
        } };
        _alGetSourcefv.sig = "viip";
        var _alGetSourcei = (sourceId, param, pValue) => { var val = AL.getSourceParam("alGetSourcei", sourceId, param); if (val === null) {
            return;
        } if (!pValue) {
            AL.currentCtx.err = 40963;
            return;
        } switch (param) {
            case 514:
            case 4097:
            case 4098:
            case 4103:
            case 4105:
            case 4112:
            case 4117:
            case 4118:
            case 4128:
            case 4129:
            case 4131:
            case 4132:
            case 4133:
            case 4134:
            case 4135:
            case 4628:
            case 8201:
            case 8202:
            case 53248:
                HEAP32[pValue >> 2] = val;
                break;
            default:
                AL.currentCtx.err = 40962;
                return;
        } };
        _alGetSourcei.sig = "viip";
        var _alGetSourceiv = (sourceId, param, pValues) => { var val = AL.getSourceParam("alGetSourceiv", sourceId, param); if (val === null) {
            return;
        } if (!pValues) {
            AL.currentCtx.err = 40963;
            return;
        } switch (param) {
            case 514:
            case 4097:
            case 4098:
            case 4103:
            case 4105:
            case 4112:
            case 4117:
            case 4118:
            case 4128:
            case 4129:
            case 4131:
            case 4132:
            case 4133:
            case 4134:
            case 4135:
            case 4628:
            case 8201:
            case 8202:
            case 53248:
                HEAP32[pValues >> 2] = val;
                break;
            case 4100:
            case 4101:
            case 4102:
                HEAP32[pValues >> 2] = val[0];
                HEAP32[pValues + 4 >> 2] = val[1];
                HEAP32[pValues + 8 >> 2] = val[2];
                break;
            default:
                AL.currentCtx.err = 40962;
                return;
        } };
        _alGetSourceiv.sig = "viip";
        var stringToNewUTF8 = str => { var size = lengthBytesUTF8(str) + 1; var ret = _malloc(size); if (ret)
            stringToUTF8(str, ret, size); return ret; };
        var _alGetString = param => { if (AL.stringCache[param]) {
            return AL.stringCache[param];
        } var ret; switch (param) {
            case 0:
                ret = "No Error";
                break;
            case 40961:
                ret = "Invalid Name";
                break;
            case 40962:
                ret = "Invalid Enum";
                break;
            case 40963:
                ret = "Invalid Value";
                break;
            case 40964:
                ret = "Invalid Operation";
                break;
            case 40965:
                ret = "Out of Memory";
                break;
            case 45057:
                ret = "Emscripten";
                break;
            case 45058:
                ret = "1.1";
                break;
            case 45059:
                ret = "WebAudio";
                break;
            case 45060:
                ret = Object.keys(AL.AL_EXTENSIONS).join(" ");
                break;
            default:
                if (AL.currentCtx) {
                    AL.currentCtx.err = 40962;
                }
                else { }
                return 0;
        } ret = stringToNewUTF8(ret); AL.stringCache[param] = ret; return ret; };
        _alGetString.sig = "pi";
        var _alIsBuffer = bufferId => { if (!AL.currentCtx) {
            return false;
        } if (bufferId > AL.buffers.length) {
            return false;
        } if (!AL.buffers[bufferId]) {
            return false;
        } return true; };
        _alIsBuffer.sig = "ii";
        var _alIsEnabled = param => { if (!AL.currentCtx) {
            return 0;
        } switch (param) {
            case 512: return AL.currentCtx.sourceDistanceModel ? 0 : 1;
            default:
                AL.currentCtx.err = 40962;
                return 0;
        } };
        _alIsEnabled.sig = "ii";
        var _alIsExtensionPresent = pExtName => { var name = UTF8ToString(pExtName); return AL.AL_EXTENSIONS[name] ? 1 : 0; };
        _alIsExtensionPresent.sig = "ip";
        var _alIsSource = sourceId => { if (!AL.currentCtx) {
            return false;
        } if (!AL.currentCtx.sources[sourceId]) {
            return false;
        } return true; };
        _alIsSource.sig = "ii";
        var _alListener3f = (param, value0, value1, value2) => { switch (param) {
            case 4100:
            case 4102:
                AL.paramArray[0] = value0;
                AL.paramArray[1] = value1;
                AL.paramArray[2] = value2;
                AL.setListenerParam("alListener3f", param, AL.paramArray);
                break;
            default:
                AL.setListenerParam("alListener3f", param, null);
                break;
        } };
        _alListener3f.sig = "vifff";
        var _alListener3i = (param, value0, value1, value2) => { switch (param) {
            case 4100:
            case 4102:
                AL.paramArray[0] = value0;
                AL.paramArray[1] = value1;
                AL.paramArray[2] = value2;
                AL.setListenerParam("alListener3i", param, AL.paramArray);
                break;
            default:
                AL.setListenerParam("alListener3i", param, null);
                break;
        } };
        _alListener3i.sig = "viiii";
        var _alListenerf = (param, value) => { switch (param) {
            case 4106:
                AL.setListenerParam("alListenerf", param, value);
                break;
            default:
                AL.setListenerParam("alListenerf", param, null);
                break;
        } };
        _alListenerf.sig = "vif";
        var _alListenerfv = (param, pValues) => { if (!AL.currentCtx) {
            return;
        } if (!pValues) {
            AL.currentCtx.err = 40963;
            return;
        } switch (param) {
            case 4100:
            case 4102:
                AL.paramArray[0] = HEAPF32[pValues >> 2];
                AL.paramArray[1] = HEAPF32[pValues + 4 >> 2];
                AL.paramArray[2] = HEAPF32[pValues + 8 >> 2];
                AL.setListenerParam("alListenerfv", param, AL.paramArray);
                break;
            case 4111:
                AL.paramArray[0] = HEAPF32[pValues >> 2];
                AL.paramArray[1] = HEAPF32[pValues + 4 >> 2];
                AL.paramArray[2] = HEAPF32[pValues + 8 >> 2];
                AL.paramArray[3] = HEAPF32[pValues + 12 >> 2];
                AL.paramArray[4] = HEAPF32[pValues + 16 >> 2];
                AL.paramArray[5] = HEAPF32[pValues + 20 >> 2];
                AL.setListenerParam("alListenerfv", param, AL.paramArray);
                break;
            default:
                AL.setListenerParam("alListenerfv", param, null);
                break;
        } };
        _alListenerfv.sig = "vip";
        var _alListeneri = (param, value) => { AL.setListenerParam("alListeneri", param, null); };
        _alListeneri.sig = "vii";
        var _alListeneriv = (param, pValues) => { if (!AL.currentCtx) {
            return;
        } if (!pValues) {
            AL.currentCtx.err = 40963;
            return;
        } switch (param) {
            case 4100:
            case 4102:
                AL.paramArray[0] = HEAP32[pValues >> 2];
                AL.paramArray[1] = HEAP32[pValues + 4 >> 2];
                AL.paramArray[2] = HEAP32[pValues + 8 >> 2];
                AL.setListenerParam("alListeneriv", param, AL.paramArray);
                break;
            case 4111:
                AL.paramArray[0] = HEAP32[pValues >> 2];
                AL.paramArray[1] = HEAP32[pValues + 4 >> 2];
                AL.paramArray[2] = HEAP32[pValues + 8 >> 2];
                AL.paramArray[3] = HEAP32[pValues + 12 >> 2];
                AL.paramArray[4] = HEAP32[pValues + 16 >> 2];
                AL.paramArray[5] = HEAP32[pValues + 20 >> 2];
                AL.setListenerParam("alListeneriv", param, AL.paramArray);
                break;
            default:
                AL.setListenerParam("alListeneriv", param, null);
                break;
        } };
        _alListeneriv.sig = "vip";
        var _alSource3f = (sourceId, param, value0, value1, value2) => { switch (param) {
            case 4100:
            case 4101:
            case 4102:
                AL.paramArray[0] = value0;
                AL.paramArray[1] = value1;
                AL.paramArray[2] = value2;
                AL.setSourceParam("alSource3f", sourceId, param, AL.paramArray);
                break;
            default:
                AL.setSourceParam("alSource3f", sourceId, param, null);
                break;
        } };
        _alSource3f.sig = "viifff";
        var _alSource3i = (sourceId, param, value0, value1, value2) => { switch (param) {
            case 4100:
            case 4101:
            case 4102:
                AL.paramArray[0] = value0;
                AL.paramArray[1] = value1;
                AL.paramArray[2] = value2;
                AL.setSourceParam("alSource3i", sourceId, param, AL.paramArray);
                break;
            default:
                AL.setSourceParam("alSource3i", sourceId, param, null);
                break;
        } };
        _alSource3i.sig = "viiiii";
        var _alSourcePause = sourceId => { if (!AL.currentCtx) {
            return;
        } var src = AL.currentCtx.sources[sourceId]; if (!src) {
            AL.currentCtx.err = 40961;
            return;
        } AL.setSourceState(src, 4115); };
        _alSourcePause.sig = "vi";
        var _alSourcePausev = (count, pSourceIds) => { if (!AL.currentCtx) {
            return;
        } if (!pSourceIds) {
            AL.currentCtx.err = 40963;
        } for (var i = 0; i < count; ++i) {
            if (!AL.currentCtx.sources[HEAP32[pSourceIds + i * 4 >> 2]]) {
                AL.currentCtx.err = 40961;
                return;
            }
        } for (var i = 0; i < count; ++i) {
            var srcId = HEAP32[pSourceIds + i * 4 >> 2];
            AL.setSourceState(AL.currentCtx.sources[srcId], 4115);
        } };
        _alSourcePausev.sig = "vip";
        var _alSourcePlay = sourceId => { if (!AL.currentCtx) {
            return;
        } var src = AL.currentCtx.sources[sourceId]; if (!src) {
            AL.currentCtx.err = 40961;
            return;
        } AL.setSourceState(src, 4114); };
        _alSourcePlay.sig = "vi";
        var _alSourcePlayv = (count, pSourceIds) => { if (!AL.currentCtx) {
            return;
        } if (!pSourceIds) {
            AL.currentCtx.err = 40963;
        } for (var i = 0; i < count; ++i) {
            if (!AL.currentCtx.sources[HEAP32[pSourceIds + i * 4 >> 2]]) {
                AL.currentCtx.err = 40961;
                return;
            }
        } for (var i = 0; i < count; ++i) {
            var srcId = HEAP32[pSourceIds + i * 4 >> 2];
            AL.setSourceState(AL.currentCtx.sources[srcId], 4114);
        } };
        _alSourcePlayv.sig = "vip";
        var _alSourceQueueBuffers = (sourceId, count, pBufferIds) => { if (!AL.currentCtx) {
            return;
        } var src = AL.currentCtx.sources[sourceId]; if (!src) {
            AL.currentCtx.err = 40961;
            return;
        } if (src.type === 4136) {
            AL.currentCtx.err = 40964;
            return;
        } if (count === 0) {
            return;
        } var templateBuf = AL.buffers[0]; for (var buf of src.bufQueue) {
            if (buf.id !== 0) {
                templateBuf = buf;
                break;
            }
        } for (var i = 0; i < count; ++i) {
            var bufId = HEAP32[pBufferIds + i * 4 >> 2];
            var buf = AL.buffers[bufId];
            if (!buf) {
                AL.currentCtx.err = 40961;
                return;
            }
            if (templateBuf.id !== 0 && (buf.frequency !== templateBuf.frequency || buf.bytesPerSample !== templateBuf.bytesPerSample || buf.channels !== templateBuf.channels)) {
                AL.currentCtx.err = 40964;
            }
        } if (src.bufQueue.length === 1 && src.bufQueue[0].id === 0) {
            src.bufQueue.length = 0;
        } src.type = 4137; for (var i = 0; i < count; ++i) {
            var bufId = HEAP32[pBufferIds + i * 4 >> 2];
            var buf = AL.buffers[bufId];
            buf.refCount++;
            src.bufQueue.push(buf);
        } if (src.looping) {
            AL.cancelPendingSourceAudio(src);
        } AL.initSourcePanner(src); AL.scheduleSourceAudio(src); };
        _alSourceQueueBuffers.sig = "viip";
        var _alSourceRewind = sourceId => { if (!AL.currentCtx) {
            return;
        } var src = AL.currentCtx.sources[sourceId]; if (!src) {
            AL.currentCtx.err = 40961;
            return;
        } AL.setSourceState(src, 4116); AL.setSourceState(src, 4113); };
        _alSourceRewind.sig = "vi";
        var _alSourceRewindv = (count, pSourceIds) => { if (!AL.currentCtx) {
            return;
        } if (!pSourceIds) {
            AL.currentCtx.err = 40963;
        } for (var i = 0; i < count; ++i) {
            if (!AL.currentCtx.sources[HEAP32[pSourceIds + i * 4 >> 2]]) {
                AL.currentCtx.err = 40961;
                return;
            }
        } for (var i = 0; i < count; ++i) {
            var srcId = HEAP32[pSourceIds + i * 4 >> 2];
            AL.setSourceState(AL.currentCtx.sources[srcId], 4113);
        } };
        _alSourceRewindv.sig = "vip";
        var _alSourceStop = sourceId => { if (!AL.currentCtx) {
            return;
        } var src = AL.currentCtx.sources[sourceId]; if (!src) {
            AL.currentCtx.err = 40961;
            return;
        } AL.setSourceState(src, 4116); };
        _alSourceStop.sig = "vi";
        var _alSourceStopv = (count, pSourceIds) => { if (!AL.currentCtx) {
            return;
        } if (!pSourceIds) {
            AL.currentCtx.err = 40963;
        } for (var i = 0; i < count; ++i) {
            if (!AL.currentCtx.sources[HEAP32[pSourceIds + i * 4 >> 2]]) {
                AL.currentCtx.err = 40961;
                return;
            }
        } for (var i = 0; i < count; ++i) {
            var srcId = HEAP32[pSourceIds + i * 4 >> 2];
            AL.setSourceState(AL.currentCtx.sources[srcId], 4116);
        } };
        _alSourceStopv.sig = "vip";
        var _alSourceUnqueueBuffers = (sourceId, count, pBufferIds) => { if (!AL.currentCtx) {
            return;
        } var src = AL.currentCtx.sources[sourceId]; if (!src) {
            AL.currentCtx.err = 40961;
            return;
        } if (count > (src.bufQueue.length === 1 && src.bufQueue[0].id === 0 ? 0 : src.bufsProcessed)) {
            AL.currentCtx.err = 40963;
            return;
        } if (count === 0) {
            return;
        } for (var i = 0; i < count; i++) {
            var buf = src.bufQueue.shift();
            buf.refCount--;
            HEAP32[pBufferIds + i * 4 >> 2] = buf.id;
            src.bufsProcessed--;
        } if (src.bufQueue.length === 0) {
            src.bufQueue.push(AL.buffers[0]);
        } AL.initSourcePanner(src); AL.scheduleSourceAudio(src); };
        _alSourceUnqueueBuffers.sig = "viip";
        var _alSourcef = (sourceId, param, value) => { switch (param) {
            case 4097:
            case 4098:
            case 4099:
            case 4106:
            case 4109:
            case 4110:
            case 4128:
            case 4129:
            case 4130:
            case 4131:
            case 4132:
            case 4133:
            case 4134:
            case 8203:
                AL.setSourceParam("alSourcef", sourceId, param, value);
                break;
            default:
                AL.setSourceParam("alSourcef", sourceId, param, null);
                break;
        } };
        _alSourcef.sig = "viif";
        var _alSourcefv = (sourceId, param, pValues) => { if (!AL.currentCtx) {
            return;
        } if (!pValues) {
            AL.currentCtx.err = 40963;
            return;
        } switch (param) {
            case 4097:
            case 4098:
            case 4099:
            case 4106:
            case 4109:
            case 4110:
            case 4128:
            case 4129:
            case 4130:
            case 4131:
            case 4132:
            case 4133:
            case 4134:
            case 8203:
                var val = HEAPF32[pValues >> 2];
                AL.setSourceParam("alSourcefv", sourceId, param, val);
                break;
            case 4100:
            case 4101:
            case 4102:
                AL.paramArray[0] = HEAPF32[pValues >> 2];
                AL.paramArray[1] = HEAPF32[pValues + 4 >> 2];
                AL.paramArray[2] = HEAPF32[pValues + 8 >> 2];
                AL.setSourceParam("alSourcefv", sourceId, param, AL.paramArray);
                break;
            default:
                AL.setSourceParam("alSourcefv", sourceId, param, null);
                break;
        } };
        _alSourcefv.sig = "viip";
        var _alSourceiv = (sourceId, param, pValues) => { if (!AL.currentCtx) {
            return;
        } if (!pValues) {
            AL.currentCtx.err = 40963;
            return;
        } switch (param) {
            case 514:
            case 4097:
            case 4098:
            case 4103:
            case 4105:
            case 4128:
            case 4129:
            case 4131:
            case 4132:
            case 4133:
            case 4134:
            case 4628:
            case 8201:
            case 8202:
            case 53248:
                var val = HEAP32[pValues >> 2];
                AL.setSourceParam("alSourceiv", sourceId, param, val);
                break;
            case 4100:
            case 4101:
            case 4102:
                AL.paramArray[0] = HEAP32[pValues >> 2];
                AL.paramArray[1] = HEAP32[pValues + 4 >> 2];
                AL.paramArray[2] = HEAP32[pValues + 8 >> 2];
                AL.setSourceParam("alSourceiv", sourceId, param, AL.paramArray);
                break;
            default:
                AL.setSourceParam("alSourceiv", sourceId, param, null);
                break;
        } };
        _alSourceiv.sig = "viip";
        var _alSpeedOfSound = value => { AL.setGlobalParam("alSpeedOfSound", 49155, value); };
        _alSpeedOfSound.sig = "vf";
        var _alcCaptureCloseDevice = deviceId => { var c = AL.requireValidCaptureDevice(deviceId, "alcCaptureCloseDevice"); if (!c)
            return false; delete AL.captures[deviceId]; AL.freeIds.push(deviceId); c.mediaStreamSourceNode?.disconnect(); c.mergerNode?.disconnect(); c.splitterNode?.disconnect(); c.scriptProcessorNode?.disconnect(); if (c.mediaStream) {
            c.mediaStream.getTracks().forEach(track => track.stop());
        } delete c.buffers; c.capturedFrameCount = 0; c.isCapturing = false; return true; };
        _alcCaptureCloseDevice.sig = "ip";
        var autoResumeAudioContext = (ctx, elements) => { if (!elements) {
            elements = [document, document.getElementById("canvas")];
        } ["keydown", "mousedown", "touchstart"].forEach(event => { elements.forEach(element => { element?.addEventListener(event, () => { if (ctx.state === "suspended")
            ctx.resume(); }, { once: true }); }); }); };
        var _alcCaptureOpenDevice = (pDeviceName, requestedSampleRate, format, bufferFrameCapacity) => { var resolvedDeviceName = AL.CAPTURE_DEVICE_NAME; if (pDeviceName !== 0) {
            resolvedDeviceName = UTF8ToString(pDeviceName);
            if (resolvedDeviceName !== AL.CAPTURE_DEVICE_NAME) {
                AL.alcErr = 40965;
                return 0;
            }
        } if (bufferFrameCapacity < 0) {
            AL.alcErr = 40964;
            return 0;
        } navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia; var has_getUserMedia = navigator.getUserMedia || navigator.mediaDevices && navigator.mediaDevices.getUserMedia; if (!has_getUserMedia) {
            AL.alcErr = 40965;
            return 0;
        } var AudioContext = window.AudioContext || window.webkitAudioContext; if (!AL.sharedCaptureAudioCtx) {
            try {
                AL.sharedCaptureAudioCtx = new AudioContext;
            }
            catch (e) {
                AL.alcErr = 40965;
                return 0;
            }
        } autoResumeAudioContext(AL.sharedCaptureAudioCtx); var outputChannelCount; switch (format) {
            case 65552:
            case 4353:
            case 4352:
                outputChannelCount = 1;
                break;
            case 65553:
            case 4355:
            case 4354:
                outputChannelCount = 2;
                break;
            default:
                AL.alcErr = 40964;
                return 0;
        } function newF32Array(cap) { return new Float32Array(cap); } function newI16Array(cap) { return new Int16Array(cap); } function newU8Array(cap) { return new Uint8Array(cap); } var requestedSampleType; var newSampleArray; switch (format) {
            case 65552:
            case 65553:
                requestedSampleType = "f32";
                newSampleArray = newF32Array;
                break;
            case 4353:
            case 4355:
                requestedSampleType = "i16";
                newSampleArray = newI16Array;
                break;
            case 4352:
            case 4354:
                requestedSampleType = "u8";
                newSampleArray = newU8Array;
                break;
        } var buffers = []; try {
            for (var chan = 0; chan < outputChannelCount; ++chan) {
                buffers[chan] = newSampleArray(bufferFrameCapacity);
            }
        }
        catch (e) {
            AL.alcErr = 40965;
            return 0;
        } var newCapture = { audioCtx: AL.sharedCaptureAudioCtx, deviceName: resolvedDeviceName, requestedSampleRate, requestedSampleType, outputChannelCount, inputChannelCount: null, mediaStreamError: null, mediaStreamSourceNode: null, mediaStream: null, mergerNode: null, splitterNode: null, scriptProcessorNode: null, isCapturing: false, buffers, get bufferFrameCapacity() { return buffers[0].length; }, capturePlayhead: 0, captureReadhead: 0, capturedFrameCount: 0 }; var onError = mediaStreamError => { newCapture.mediaStreamError = mediaStreamError; }; var onSuccess = mediaStream => { newCapture.mediaStreamSourceNode = newCapture.audioCtx.createMediaStreamSource(mediaStream); newCapture.mediaStream = mediaStream; var inputChannelCount = 1; switch (newCapture.mediaStreamSourceNode.channelCountMode) {
            case "max":
                inputChannelCount = outputChannelCount;
                break;
            case "clamped-max":
                inputChannelCount = Math.min(outputChannelCount, newCapture.mediaStreamSourceNode.channelCount);
                break;
            case "explicit":
                inputChannelCount = newCapture.mediaStreamSourceNode.channelCount;
                break;
        } newCapture.inputChannelCount = inputChannelCount; var processorFrameCount = 512; newCapture.scriptProcessorNode = newCapture.audioCtx.createScriptProcessor(processorFrameCount, inputChannelCount, outputChannelCount); if (inputChannelCount > outputChannelCount) {
            newCapture.mergerNode = newCapture.audioCtx.createChannelMerger(inputChannelCount);
            newCapture.mediaStreamSourceNode.connect(newCapture.mergerNode);
            newCapture.mergerNode.connect(newCapture.scriptProcessorNode);
        }
        else if (inputChannelCount < outputChannelCount) {
            newCapture.splitterNode = newCapture.audioCtx.createChannelSplitter(outputChannelCount);
            newCapture.mediaStreamSourceNode.connect(newCapture.splitterNode);
            newCapture.splitterNode.connect(newCapture.scriptProcessorNode);
        }
        else {
            newCapture.mediaStreamSourceNode.connect(newCapture.scriptProcessorNode);
        } newCapture.scriptProcessorNode.connect(newCapture.audioCtx.destination); newCapture.scriptProcessorNode.onaudioprocess = audioProcessingEvent => { if (!newCapture.isCapturing) {
            return;
        } var c = newCapture; var srcBuf = audioProcessingEvent.inputBuffer; switch (format) {
            case 65552:
                var channel0 = srcBuf.getChannelData(0);
                for (var i = 0; i < srcBuf.length; ++i) {
                    var wi = (c.capturePlayhead + i) % c.bufferFrameCapacity;
                    c.buffers[0][wi] = channel0[i];
                }
                break;
            case 65553:
                var channel0 = srcBuf.getChannelData(0);
                var channel1 = srcBuf.getChannelData(1);
                for (var i = 0; i < srcBuf.length; ++i) {
                    var wi = (c.capturePlayhead + i) % c.bufferFrameCapacity;
                    c.buffers[0][wi] = channel0[i];
                    c.buffers[1][wi] = channel1[i];
                }
                break;
            case 4353:
                var channel0 = srcBuf.getChannelData(0);
                for (var i = 0; i < srcBuf.length; ++i) {
                    var wi = (c.capturePlayhead + i) % c.bufferFrameCapacity;
                    c.buffers[0][wi] = channel0[i] * 32767;
                }
                break;
            case 4355:
                var channel0 = srcBuf.getChannelData(0);
                var channel1 = srcBuf.getChannelData(1);
                for (var i = 0; i < srcBuf.length; ++i) {
                    var wi = (c.capturePlayhead + i) % c.bufferFrameCapacity;
                    c.buffers[0][wi] = channel0[i] * 32767;
                    c.buffers[1][wi] = channel1[i] * 32767;
                }
                break;
            case 4352:
                var channel0 = srcBuf.getChannelData(0);
                for (var i = 0; i < srcBuf.length; ++i) {
                    var wi = (c.capturePlayhead + i) % c.bufferFrameCapacity;
                    c.buffers[0][wi] = (channel0[i] + 1) * 127;
                }
                break;
            case 4354:
                var channel0 = srcBuf.getChannelData(0);
                var channel1 = srcBuf.getChannelData(1);
                for (var i = 0; i < srcBuf.length; ++i) {
                    var wi = (c.capturePlayhead + i) % c.bufferFrameCapacity;
                    c.buffers[0][wi] = (channel0[i] + 1) * 127;
                    c.buffers[1][wi] = (channel1[i] + 1) * 127;
                }
                break;
        } c.capturePlayhead += srcBuf.length; c.capturePlayhead %= c.bufferFrameCapacity; c.capturedFrameCount += srcBuf.length; c.capturedFrameCount = Math.min(c.capturedFrameCount, c.bufferFrameCapacity); }; }; if (navigator.mediaDevices?.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true }).then(onSuccess).catch(onError);
        }
        else {
            navigator.getUserMedia({ audio: true }, onSuccess, onError);
        } var id = AL.newId(); AL.captures[id] = newCapture; return id; };
        _alcCaptureOpenDevice.sig = "ppiii";
        var _alcCaptureSamples = (deviceId, pFrames, requestedFrameCount) => { var c = AL.requireValidCaptureDevice(deviceId, "alcCaptureSamples"); if (!c)
            return; var dstfreq = c.requestedSampleRate; var srcfreq = c.audioCtx.sampleRate; var fratio = srcfreq / dstfreq; if (requestedFrameCount < 0 || requestedFrameCount > c.capturedFrameCount / fratio) {
            AL.alcErr = 40964;
            return;
        } function setF32Sample(i, sample) { HEAPF32[pFrames + 4 * i >> 2] = sample; } function setI16Sample(i, sample) { HEAP16[pFrames + 2 * i >> 1] = sample; } function setU8Sample(i, sample) { HEAP8[pFrames + i] = sample; } var setSample; switch (c.requestedSampleType) {
            case "f32":
                setSample = setF32Sample;
                break;
            case "i16":
                setSample = setI16Sample;
                break;
            case "u8":
                setSample = setU8Sample;
                break;
            default: return;
        } if (Math.floor(fratio) == fratio) {
            for (var i = 0, frame_i = 0; frame_i < requestedFrameCount; ++frame_i) {
                for (var chan = 0; chan < c.buffers.length; ++chan, ++i) {
                    setSample(i, c.buffers[chan][c.captureReadhead]);
                }
                c.captureReadhead = (fratio + c.captureReadhead) % c.bufferFrameCapacity;
            }
        }
        else {
            for (var i = 0, frame_i = 0; frame_i < requestedFrameCount; ++frame_i) {
                var lefti = Math.floor(c.captureReadhead);
                var righti = Math.ceil(c.captureReadhead);
                var d = c.captureReadhead - lefti;
                for (var chan = 0; chan < c.buffers.length; ++chan, ++i) {
                    var lefts = c.buffers[chan][lefti];
                    var rights = c.buffers[chan][righti];
                    setSample(i, (1 - d) * lefts + d * rights);
                }
                c.captureReadhead = (c.captureReadhead + fratio) % c.bufferFrameCapacity;
            }
        } c.capturedFrameCount = 0; };
        _alcCaptureSamples.sig = "vppi";
        var _alcCaptureStart = deviceId => { var c = AL.requireValidCaptureDevice(deviceId, "alcCaptureStart"); if (!c)
            return; if (c.isCapturing) {
            return;
        } c.isCapturing = true; c.capturedFrameCount = 0; c.capturePlayhead = 0; };
        _alcCaptureStart.sig = "vp";
        var _alcCaptureStop = deviceId => { var c = AL.requireValidCaptureDevice(deviceId, "alcCaptureStop"); if (!c)
            return; c.isCapturing = false; };
        _alcCaptureStop.sig = "vp";
        var _alcCloseDevice = deviceId => { if (!(deviceId in AL.deviceRefCounts) || AL.deviceRefCounts[deviceId] > 0) {
            return 0;
        } delete AL.deviceRefCounts[deviceId]; AL.freeIds.push(deviceId); return 1; };
        _alcCloseDevice.sig = "ip";
        var _alcCreateContext = (deviceId, pAttrList) => { if (!(deviceId in AL.deviceRefCounts)) {
            AL.alcErr = 40961;
            return 0;
        } var options = null; var attrs = []; var hrtf = null; pAttrList >>= 2; if (pAttrList) {
            var attr = 0;
            var val = 0;
            while (true) {
                attr = HEAP32[pAttrList++];
                attrs.push(attr);
                if (attr === 0) {
                    break;
                }
                val = HEAP32[pAttrList++];
                attrs.push(val);
                switch (attr) {
                    case 4103:
                        if (!options) {
                            options = {};
                        }
                        options.sampleRate = val;
                        break;
                    case 4112:
                    case 4113: break;
                    case 6546:
                        switch (val) {
                            case 0:
                                hrtf = false;
                                break;
                            case 1:
                                hrtf = true;
                                break;
                            case 2: break;
                            default:
                                AL.alcErr = 40964;
                                return 0;
                        }
                        break;
                    case 6550:
                        if (val !== 0) {
                            AL.alcErr = 40964;
                            return 0;
                        }
                        break;
                    default:
                        AL.alcErr = 40964;
                        return 0;
                }
            }
        } var AudioContext = window.AudioContext || window.webkitAudioContext; var ac = null; try {
            if (options) {
                ac = new AudioContext(options);
            }
            else {
                ac = new AudioContext;
            }
        }
        catch (e) {
            if (e.name === "NotSupportedError") {
                AL.alcErr = 40964;
            }
            else {
                AL.alcErr = 40961;
            }
            return 0;
        } autoResumeAudioContext(ac); if (typeof ac.createGain == "undefined") {
            ac.createGain = ac.createGainNode;
        } var gain = ac.createGain(); gain.connect(ac.destination); var ctx = { deviceId, id: AL.newId(), attrs, audioCtx: ac, listener: { position: [0, 0, 0], velocity: [0, 0, 0], direction: [0, 0, 0], up: [0, 0, 0] }, sources: [], interval: setInterval(() => AL.scheduleContextAudio(ctx), AL.QUEUE_INTERVAL), gain, distanceModel: 53250, speedOfSound: 343.3, dopplerFactor: 1, sourceDistanceModel: false, hrtf: hrtf || false, _err: 0, get err() { return this._err; }, set err(val) { if (this._err === 0 || val === 0) {
                this._err = val;
            } } }; AL.deviceRefCounts[deviceId]++; AL.contexts[ctx.id] = ctx; if (hrtf !== null) {
            for (var ctxId in AL.contexts) {
                var c = AL.contexts[ctxId];
                if (c.deviceId === deviceId) {
                    c.hrtf = hrtf;
                    AL.updateContextGlobal(c);
                }
            }
        } return ctx.id; };
        _alcCreateContext.sig = "ppp";
        var _alcDestroyContext = contextId => { var ctx = AL.contexts[contextId]; if (AL.currentCtx === ctx) {
            AL.alcErr = 40962;
            return;
        } if (AL.contexts[contextId].interval) {
            clearInterval(AL.contexts[contextId].interval);
        } AL.deviceRefCounts[ctx.deviceId]--; delete AL.contexts[contextId]; AL.freeIds.push(contextId); };
        _alcDestroyContext.sig = "vp";
        var _alcGetContextsDevice = contextId => { if (contextId in AL.contexts) {
            return AL.contexts[contextId].deviceId;
        } return 0; };
        _alcGetContextsDevice.sig = "pp";
        var _alcGetCurrentContext = () => { if (AL.currentCtx !== null) {
            return AL.currentCtx.id;
        } return 0; };
        _alcGetCurrentContext.sig = "p";
        var _alcGetEnumValue = (deviceId, pEnumName) => { if (deviceId !== 0 && !(deviceId in AL.deviceRefCounts)) {
            return 0;
        }
        else if (!pEnumName) {
            AL.alcErr = 40964;
            return 0;
        } var name = UTF8ToString(pEnumName); switch (name) {
            case "ALC_NO_ERROR": return 0;
            case "ALC_INVALID_DEVICE": return 40961;
            case "ALC_INVALID_CONTEXT": return 40962;
            case "ALC_INVALID_ENUM": return 40963;
            case "ALC_INVALID_VALUE": return 40964;
            case "ALC_OUT_OF_MEMORY": return 40965;
            case "ALC_MAJOR_VERSION": return 4096;
            case "ALC_MINOR_VERSION": return 4097;
            case "ALC_ATTRIBUTES_SIZE": return 4098;
            case "ALC_ALL_ATTRIBUTES": return 4099;
            case "ALC_DEFAULT_DEVICE_SPECIFIER": return 4100;
            case "ALC_DEVICE_SPECIFIER": return 4101;
            case "ALC_EXTENSIONS": return 4102;
            case "ALC_FREQUENCY": return 4103;
            case "ALC_REFRESH": return 4104;
            case "ALC_SYNC": return 4105;
            case "ALC_MONO_SOURCES": return 4112;
            case "ALC_STEREO_SOURCES": return 4113;
            case "ALC_CAPTURE_DEVICE_SPECIFIER": return 784;
            case "ALC_CAPTURE_DEFAULT_DEVICE_SPECIFIER": return 785;
            case "ALC_CAPTURE_SAMPLES": return 786;
            case "ALC_HRTF_SOFT": return 6546;
            case "ALC_HRTF_ID_SOFT": return 6550;
            case "ALC_DONT_CARE_SOFT": return 2;
            case "ALC_HRTF_STATUS_SOFT": return 6547;
            case "ALC_NUM_HRTF_SPECIFIERS_SOFT": return 6548;
            case "ALC_HRTF_SPECIFIER_SOFT": return 6549;
            case "ALC_HRTF_DISABLED_SOFT": return 0;
            case "ALC_HRTF_ENABLED_SOFT": return 1;
            case "ALC_HRTF_DENIED_SOFT": return 2;
            case "ALC_HRTF_REQUIRED_SOFT": return 3;
            case "ALC_HRTF_HEADPHONES_DETECTED_SOFT": return 4;
            case "ALC_HRTF_UNSUPPORTED_FORMAT_SOFT": return 5;
            default:
                AL.alcErr = 40964;
                return 0;
        } };
        _alcGetEnumValue.sig = "ipp";
        var _alcGetError = deviceId => { var err = AL.alcErr; AL.alcErr = 0; return err; };
        _alcGetError.sig = "ip";
        var _alcGetIntegerv = (deviceId, param, size, pValues) => { if (size === 0 || !pValues) {
            return;
        } switch (param) {
            case 4096:
                HEAP32[pValues >> 2] = 1;
                break;
            case 4097:
                HEAP32[pValues >> 2] = 1;
                break;
            case 4098:
                if (!(deviceId in AL.deviceRefCounts)) {
                    AL.alcErr = 40961;
                    return;
                }
                if (!AL.currentCtx) {
                    AL.alcErr = 40962;
                    return;
                }
                HEAP32[pValues >> 2] = AL.currentCtx.attrs.length;
                break;
            case 4099:
                if (!(deviceId in AL.deviceRefCounts)) {
                    AL.alcErr = 40961;
                    return;
                }
                if (!AL.currentCtx) {
                    AL.alcErr = 40962;
                    return;
                }
                for (var i = 0; i < AL.currentCtx.attrs.length; i++) {
                    HEAP32[pValues + i * 4 >> 2] = AL.currentCtx.attrs[i];
                }
                break;
            case 4103:
                if (!(deviceId in AL.deviceRefCounts)) {
                    AL.alcErr = 40961;
                    return;
                }
                if (!AL.currentCtx) {
                    AL.alcErr = 40962;
                    return;
                }
                HEAP32[pValues >> 2] = AL.currentCtx.audioCtx.sampleRate;
                break;
            case 4112:
            case 4113:
                if (!(deviceId in AL.deviceRefCounts)) {
                    AL.alcErr = 40961;
                    return;
                }
                if (!AL.currentCtx) {
                    AL.alcErr = 40962;
                    return;
                }
                HEAP32[pValues >> 2] = 2147483647;
                break;
            case 6546:
            case 6547:
                if (!(deviceId in AL.deviceRefCounts)) {
                    AL.alcErr = 40961;
                    return;
                }
                var hrtfStatus = 0;
                for (var ctxId in AL.contexts) {
                    var ctx = AL.contexts[ctxId];
                    if (ctx.deviceId === deviceId) {
                        hrtfStatus = ctx.hrtf ? 1 : 0;
                    }
                }
                HEAP32[pValues >> 2] = hrtfStatus;
                break;
            case 6548:
                if (!(deviceId in AL.deviceRefCounts)) {
                    AL.alcErr = 40961;
                    return;
                }
                HEAP32[pValues >> 2] = 1;
                break;
            case 131075:
                if (!(deviceId in AL.deviceRefCounts)) {
                    AL.alcErr = 40961;
                    return;
                }
                if (!AL.currentCtx) {
                    AL.alcErr = 40962;
                    return;
                }
                HEAP32[pValues >> 2] = 1;
            case 786:
                var c = AL.requireValidCaptureDevice(deviceId, "alcGetIntegerv");
                if (!c) {
                    return;
                }
                var n = c.capturedFrameCount;
                var dstfreq = c.requestedSampleRate;
                var srcfreq = c.audioCtx.sampleRate;
                var nsamples = Math.floor(n * (dstfreq / srcfreq));
                HEAP32[pValues >> 2] = nsamples;
                break;
            default:
                AL.alcErr = 40963;
                return;
        } };
        _alcGetIntegerv.sig = "vpiip";
        var _alcGetString = (deviceId, param) => { if (AL.alcStringCache[param]) {
            return AL.alcStringCache[param];
        } var ret; switch (param) {
            case 0:
                ret = "No Error";
                break;
            case 40961:
                ret = "Invalid Device";
                break;
            case 40962:
                ret = "Invalid Context";
                break;
            case 40963:
                ret = "Invalid Enum";
                break;
            case 40964:
                ret = "Invalid Value";
                break;
            case 40965:
                ret = "Out of Memory";
                break;
            case 4100:
                if (typeof AudioContext != "undefined" || typeof webkitAudioContext != "undefined") {
                    ret = AL.DEVICE_NAME;
                }
                else {
                    return 0;
                }
                break;
            case 4101:
                if (typeof AudioContext != "undefined" || typeof webkitAudioContext != "undefined") {
                    ret = AL.DEVICE_NAME + "\0";
                }
                else {
                    ret = "\0";
                }
                break;
            case 785:
                ret = AL.CAPTURE_DEVICE_NAME;
                break;
            case 784:
                if (deviceId === 0) {
                    ret = AL.CAPTURE_DEVICE_NAME + "\0";
                }
                else {
                    var c = AL.requireValidCaptureDevice(deviceId, "alcGetString");
                    if (!c) {
                        return 0;
                    }
                    ret = c.deviceName;
                }
                break;
            case 4102:
                if (!deviceId) {
                    AL.alcErr = 40961;
                    return 0;
                }
                ret = Object.keys(AL.ALC_EXTENSIONS).join(" ");
                break;
            default:
                AL.alcErr = 40963;
                return 0;
        } ret = stringToNewUTF8(ret); AL.alcStringCache[param] = ret; return ret; };
        _alcGetString.sig = "ppi";
        var _alcIsExtensionPresent = (deviceId, pExtName) => { var name = UTF8ToString(pExtName); return AL.ALC_EXTENSIONS[name] ? 1 : 0; };
        _alcIsExtensionPresent.sig = "ipp";
        var _alcMakeContextCurrent = contextId => { if (contextId === 0) {
            AL.currentCtx = null;
        }
        else {
            AL.currentCtx = AL.contexts[contextId];
        } return 1; };
        _alcMakeContextCurrent.sig = "ip";
        var _alcOpenDevice = pDeviceName => { if (pDeviceName) {
            var name = UTF8ToString(pDeviceName);
            if (name !== AL.DEVICE_NAME) {
                return 0;
            }
        } if (typeof AudioContext != "undefined" || typeof webkitAudioContext != "undefined") {
            var deviceId = AL.newId();
            AL.deviceRefCounts[deviceId] = 0;
            return deviceId;
        } return 0; };
        _alcOpenDevice.sig = "pp";
        var _alcProcessContext = contextId => { };
        _alcProcessContext.sig = "vp";
        var _alcSuspendContext = contextId => { };
        _alcSuspendContext.sig = "vp";
        var _emscripten_get_now_res = () => 1e3;
        _emscripten_get_now_res.sig = "d";
        var nowIsMonotonic = 1;
        var checkWasiClock = clock_id => clock_id >= 0 && clock_id <= 3;
        var _clock_res_get = (clk_id, pres) => { if (!checkWasiClock(clk_id)) {
            return 28;
        } var nsec; if (clk_id === 0) {
            nsec = 1e3 * 1e3;
        }
        else if (nowIsMonotonic) {
            nsec = _emscripten_get_now_res();
        }
        else {
            return 52;
        } HEAP64[pres >> 3] = BigInt(nsec); return 0; };
        _clock_res_get.sig = "iip";
        var _emscripten_date_now = () => Date.now();
        _emscripten_date_now.sig = "d";
        function _clock_time_get(clk_id, ignored_precision, ptime) { ignored_precision = bigintToI53Checked(ignored_precision); if (!checkWasiClock(clk_id)) {
            return 28;
        } var now; if (clk_id === 0) {
            now = _emscripten_date_now();
        }
        else if (nowIsMonotonic) {
            now = _emscripten_get_now();
        }
        else {
            return 52;
        } var nsec = Math.round(now * 1e3 * 1e3); HEAP64[ptime >> 3] = BigInt(nsec); return 0; }
        _clock_time_get.sig = "iijp";
        var safeSetTimeout = (func, timeout) => setTimeout(() => { callUserCallback(func); }, timeout);
        var warnOnce = text => { warnOnce.shown || (warnOnce.shown = {}); if (!warnOnce.shown[text]) {
            warnOnce.shown[text] = 1;
            err(text);
        } };
        var Browser = { useWebGL: false, isFullscreen: false, pointerLock: false, moduleContextCreatedCallbacks: [], workers: [], preloadedImages: {}, preloadedAudios: {}, getCanvas: () => Module["canvas"], init() { if (Browser.initted)
                return; Browser.initted = true; var imagePlugin = {}; imagePlugin["canHandle"] = function imagePlugin_canHandle(name) { return !Module["noImageDecoding"] && /\.(jpg|jpeg|png|bmp|webp)$/i.test(name); }; imagePlugin["handle"] = function imagePlugin_handle(byteArray, name, onload, onerror) { var b = new Blob([byteArray], { type: Browser.getMimetype(name) }); if (b.size !== byteArray.length) {
                b = new Blob([new Uint8Array(byteArray).buffer], { type: Browser.getMimetype(name) });
            } var url = URL.createObjectURL(b); var img = new Image; img.onload = () => { var canvas = document.createElement("canvas"); canvas.width = img.width; canvas.height = img.height; var ctx = canvas.getContext("2d"); ctx.drawImage(img, 0, 0); Browser.preloadedImages[name] = canvas; URL.revokeObjectURL(url); onload?.(byteArray); }; img.onerror = event => { err(`Image ${url} could not be decoded`); onerror?.(); }; img.src = url; }; preloadPlugins.push(imagePlugin); var audioPlugin = {}; audioPlugin["canHandle"] = function audioPlugin_canHandle(name) { return !Module["noAudioDecoding"] && name.slice(-4) in { ".ogg": 1, ".wav": 1, ".mp3": 1 }; }; audioPlugin["handle"] = function audioPlugin_handle(byteArray, name, onload, onerror) { var done = false; function finish(audio) { if (done)
                return; done = true; Browser.preloadedAudios[name] = audio; onload?.(byteArray); } function fail() { if (done)
                return; done = true; Browser.preloadedAudios[name] = new Audio; onerror?.(); } var b = new Blob([byteArray], { type: Browser.getMimetype(name) }); var url = URL.createObjectURL(b); var audio = new Audio; audio.addEventListener("canplaythrough", () => finish(audio), false); audio.onerror = function audio_onerror(event) { if (done)
                return; err(`warning: browser could not fully decode audio ${name}, trying slower base64 approach`); function encode64(data) { var BASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"; var PAD = "="; var ret = ""; var leftchar = 0; var leftbits = 0; for (var i = 0; i < data.length; i++) {
                leftchar = leftchar << 8 | data[i];
                leftbits += 8;
                while (leftbits >= 6) {
                    var curr = leftchar >> leftbits - 6 & 63;
                    leftbits -= 6;
                    ret += BASE[curr];
                }
            } if (leftbits == 2) {
                ret += BASE[(leftchar & 3) << 4];
                ret += PAD + PAD;
            }
            else if (leftbits == 4) {
                ret += BASE[(leftchar & 15) << 2];
                ret += PAD;
            } return ret; } audio.src = "data:audio/x-" + name.slice(-3) + ";base64," + encode64(byteArray); finish(audio); }; audio.src = url; safeSetTimeout(() => { finish(audio); }, 1e4); }; preloadPlugins.push(audioPlugin); function pointerLockChange() { var canvas = Browser.getCanvas(); Browser.pointerLock = document.pointerLockElement === canvas; } var canvas = Browser.getCanvas(); if (canvas) {
                document.addEventListener("pointerlockchange", pointerLockChange, false);
                if (Module["elementPointerLock"]) {
                    canvas.addEventListener("click", ev => { if (!Browser.pointerLock && Browser.getCanvas().requestPointerLock) {
                        Browser.getCanvas().requestPointerLock();
                        ev.preventDefault();
                    } }, false);
                }
            } }, createContext(canvas, useWebGL, setInModule, webGLContextAttributes) { if (useWebGL && Module["ctx"] && canvas == Browser.getCanvas())
                return Module["ctx"]; var ctx; var contextHandle; if (useWebGL) {
                var contextAttributes = { antialias: false, alpha: false, majorVersion: 2 };
                if (webGLContextAttributes) {
                    for (var attribute in webGLContextAttributes) {
                        contextAttributes[attribute] = webGLContextAttributes[attribute];
                    }
                }
                if (typeof GL != "undefined") {
                    contextHandle = GL.createContext(canvas, contextAttributes);
                    if (contextHandle) {
                        ctx = GL.getContext(contextHandle).GLctx;
                    }
                }
            }
            else {
                ctx = canvas.getContext("2d");
            } if (!ctx)
                return null; if (setInModule) {
                Module["ctx"] = ctx;
                if (useWebGL)
                    GL.makeContextCurrent(contextHandle);
                Browser.useWebGL = useWebGL;
                Browser.moduleContextCreatedCallbacks.forEach(callback => callback());
                Browser.init();
            } return ctx; }, fullscreenHandlersInstalled: false, lockPointer: undefined, resizeCanvas: undefined, requestFullscreen(lockPointer, resizeCanvas) { Browser.lockPointer = lockPointer; Browser.resizeCanvas = resizeCanvas; if (typeof Browser.lockPointer == "undefined")
                Browser.lockPointer = true; if (typeof Browser.resizeCanvas == "undefined")
                Browser.resizeCanvas = false; var canvas = Browser.getCanvas(); function fullscreenChange() { Browser.isFullscreen = false; var canvasContainer = canvas.parentNode; if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvasContainer) {
                canvas.exitFullscreen = Browser.exitFullscreen;
                if (Browser.lockPointer)
                    canvas.requestPointerLock();
                Browser.isFullscreen = true;
                if (Browser.resizeCanvas) {
                    Browser.setFullscreenCanvasSize();
                }
                else {
                    Browser.updateCanvasDimensions(canvas);
                }
            }
            else {
                canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
                canvasContainer.parentNode.removeChild(canvasContainer);
                if (Browser.resizeCanvas) {
                    Browser.setWindowedCanvasSize();
                }
                else {
                    Browser.updateCanvasDimensions(canvas);
                }
            } Module["onFullScreen"]?.(Browser.isFullscreen); Module["onFullscreen"]?.(Browser.isFullscreen); } if (!Browser.fullscreenHandlersInstalled) {
                Browser.fullscreenHandlersInstalled = true;
                document.addEventListener("fullscreenchange", fullscreenChange, false);
                document.addEventListener("mozfullscreenchange", fullscreenChange, false);
                document.addEventListener("webkitfullscreenchange", fullscreenChange, false);
                document.addEventListener("MSFullscreenChange", fullscreenChange, false);
            } var canvasContainer = document.createElement("div"); canvas.parentNode.insertBefore(canvasContainer, canvas); canvasContainer.appendChild(canvas); canvasContainer.requestFullscreen = canvasContainer["requestFullscreen"] || canvasContainer["mozRequestFullScreen"] || canvasContainer["msRequestFullscreen"] || (canvasContainer["webkitRequestFullscreen"] ? () => canvasContainer["webkitRequestFullscreen"](Element["ALLOW_KEYBOARD_INPUT"]) : null) || (canvasContainer["webkitRequestFullScreen"] ? () => canvasContainer["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"]) : null); canvasContainer.requestFullscreen(); }, exitFullscreen() { if (!Browser.isFullscreen) {
                return false;
            } var CFS = document["exitFullscreen"] || document["cancelFullScreen"] || document["mozCancelFullScreen"] || document["msExitFullscreen"] || document["webkitCancelFullScreen"] || (() => { }); CFS.apply(document, []); return true; }, safeSetTimeout(func, timeout) { return safeSetTimeout(func, timeout); }, getMimetype(name) { return { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", bmp: "image/bmp", ogg: "audio/ogg", wav: "audio/wav", mp3: "audio/mpeg" }[name.slice(name.lastIndexOf(".") + 1)]; }, getUserMedia(func) { window.getUserMedia || (window.getUserMedia = navigator["getUserMedia"] || navigator["mozGetUserMedia"]); window.getUserMedia(func); }, getMovementX(event) { return event["movementX"] || event["mozMovementX"] || event["webkitMovementX"] || 0; }, getMovementY(event) { return event["movementY"] || event["mozMovementY"] || event["webkitMovementY"] || 0; }, getMouseWheelDelta(event) { var delta = 0; switch (event.type) {
                case "DOMMouseScroll":
                    delta = event.detail / 3;
                    break;
                case "mousewheel":
                    delta = event.wheelDelta / 120;
                    break;
                case "wheel":
                    delta = event.deltaY;
                    switch (event.deltaMode) {
                        case 0:
                            delta /= 100;
                            break;
                        case 1:
                            delta /= 3;
                            break;
                        case 2:
                            delta *= 80;
                            break;
                        default: throw "unrecognized mouse wheel delta mode: " + event.deltaMode;
                    }
                    break;
                default: throw "unrecognized mouse wheel event: " + event.type;
            } return delta; }, mouseX: 0, mouseY: 0, mouseMovementX: 0, mouseMovementY: 0, touches: {}, lastTouches: {}, calculateMouseCoords(pageX, pageY) { var canvas = Browser.getCanvas(); var rect = canvas.getBoundingClientRect(); var scrollX = typeof window.scrollX != "undefined" ? window.scrollX : window.pageXOffset; var scrollY = typeof window.scrollY != "undefined" ? window.scrollY : window.pageYOffset; var adjustedX = pageX - (scrollX + rect.left); var adjustedY = pageY - (scrollY + rect.top); adjustedX = adjustedX * (canvas.width / rect.width); adjustedY = adjustedY * (canvas.height / rect.height); return { x: adjustedX, y: adjustedY }; }, setMouseCoords(pageX, pageY) { const { x, y } = Browser.calculateMouseCoords(pageX, pageY); Browser.mouseMovementX = x - Browser.mouseX; Browser.mouseMovementY = y - Browser.mouseY; Browser.mouseX = x; Browser.mouseY = y; }, calculateMouseEvent(event) { if (Browser.pointerLock) {
                if (event.type != "mousemove" && "mozMovementX" in event) {
                    Browser.mouseMovementX = Browser.mouseMovementY = 0;
                }
                else {
                    Browser.mouseMovementX = Browser.getMovementX(event);
                    Browser.mouseMovementY = Browser.getMovementY(event);
                }
                Browser.mouseX += Browser.mouseMovementX;
                Browser.mouseY += Browser.mouseMovementY;
            }
            else {
                if (event.type === "touchstart" || event.type === "touchend" || event.type === "touchmove") {
                    var touch = event.touch;
                    if (touch === undefined) {
                        return;
                    }
                    var coords = Browser.calculateMouseCoords(touch.pageX, touch.pageY);
                    if (event.type === "touchstart") {
                        Browser.lastTouches[touch.identifier] = coords;
                        Browser.touches[touch.identifier] = coords;
                    }
                    else if (event.type === "touchend" || event.type === "touchmove") {
                        var last = Browser.touches[touch.identifier];
                        last || (last = coords);
                        Browser.lastTouches[touch.identifier] = last;
                        Browser.touches[touch.identifier] = coords;
                    }
                    return;
                }
                Browser.setMouseCoords(event.pageX, event.pageY);
            } }, resizeListeners: [], updateResizeListeners() { var canvas = Browser.getCanvas(); Browser.resizeListeners.forEach(listener => listener(canvas.width, canvas.height)); }, setCanvasSize(width, height, noUpdates) { var canvas = Browser.getCanvas(); Browser.updateCanvasDimensions(canvas, width, height); if (!noUpdates)
                Browser.updateResizeListeners(); }, windowedWidth: 0, windowedHeight: 0, setFullscreenCanvasSize() { if (typeof SDL != "undefined") {
                var flags = HEAPU32[SDL.screen >> 2];
                flags = flags | 8388608;
                HEAP32[SDL.screen >> 2] = flags;
            } Browser.updateCanvasDimensions(Browser.getCanvas()); Browser.updateResizeListeners(); }, setWindowedCanvasSize() { if (typeof SDL != "undefined") {
                var flags = HEAPU32[SDL.screen >> 2];
                flags = flags & ~8388608;
                HEAP32[SDL.screen >> 2] = flags;
            } Browser.updateCanvasDimensions(Browser.getCanvas()); Browser.updateResizeListeners(); }, updateCanvasDimensions(canvas, wNative, hNative) { if (wNative && hNative) {
                canvas.widthNative = wNative;
                canvas.heightNative = hNative;
            }
            else {
                wNative = canvas.widthNative;
                hNative = canvas.heightNative;
            } var w = wNative; var h = hNative; if (Module["forcedAspectRatio"] > 0) {
                if (w / h < Module["forcedAspectRatio"]) {
                    w = Math.round(h * Module["forcedAspectRatio"]);
                }
                else {
                    h = Math.round(w / Module["forcedAspectRatio"]);
                }
            } if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvas.parentNode && typeof screen != "undefined") {
                var factor = Math.min(screen.width / w, screen.height / h);
                w = Math.round(w * factor);
                h = Math.round(h * factor);
            } if (Browser.resizeCanvas) {
                if (canvas.width != w)
                    canvas.width = w;
                if (canvas.height != h)
                    canvas.height = h;
                if (typeof canvas.style != "undefined") {
                    canvas.style.removeProperty("width");
                    canvas.style.removeProperty("height");
                }
            }
            else {
                if (canvas.width != wNative)
                    canvas.width = wNative;
                if (canvas.height != hNative)
                    canvas.height = hNative;
                if (typeof canvas.style != "undefined") {
                    if (w != wNative || h != hNative) {
                        canvas.style.setProperty("width", w + "px", "important");
                        canvas.style.setProperty("height", h + "px", "important");
                    }
                    else {
                        canvas.style.removeProperty("width");
                        canvas.style.removeProperty("height");
                    }
                }
            } } };
        var EGL = { errorCode: 12288, defaultDisplayInitialized: false, currentContext: 0, currentReadSurface: 0, currentDrawSurface: 0, contextAttributes: { alpha: false, depth: false, stencil: false, antialias: false }, stringCache: {}, setErrorCode(code) { EGL.errorCode = code; }, chooseConfig(display, attribList, config, config_size, numConfigs) { if (display != 62e3) {
                EGL.setErrorCode(12296);
                return 0;
            } if (attribList) {
                for (;;) {
                    var param = HEAP32[attribList >> 2];
                    if (param == 12321) {
                        var alphaSize = HEAP32[attribList + 4 >> 2];
                        EGL.contextAttributes.alpha = alphaSize > 0;
                    }
                    else if (param == 12325) {
                        var depthSize = HEAP32[attribList + 4 >> 2];
                        EGL.contextAttributes.depth = depthSize > 0;
                    }
                    else if (param == 12326) {
                        var stencilSize = HEAP32[attribList + 4 >> 2];
                        EGL.contextAttributes.stencil = stencilSize > 0;
                    }
                    else if (param == 12337) {
                        var samples = HEAP32[attribList + 4 >> 2];
                        EGL.contextAttributes.antialias = samples > 0;
                    }
                    else if (param == 12338) {
                        var samples = HEAP32[attribList + 4 >> 2];
                        EGL.contextAttributes.antialias = samples == 1;
                    }
                    else if (param == 12544) {
                        var requestedPriority = HEAP32[attribList + 4 >> 2];
                        EGL.contextAttributes.lowLatency = requestedPriority != 12547;
                    }
                    else if (param == 12344) {
                        break;
                    }
                    attribList += 8;
                }
            } if ((!config || !config_size) && !numConfigs) {
                EGL.setErrorCode(12300);
                return 0;
            } if (numConfigs) {
                HEAP32[numConfigs >> 2] = 1;
            } if (config && config_size > 0) {
                HEAPU32[config >> 2] = 62002;
            } EGL.setErrorCode(12288); return 1; } };
        var _eglBindAPI = api => { if (api == 12448) {
            EGL.setErrorCode(12288);
            return 1;
        } EGL.setErrorCode(12300); return 0; };
        _eglBindAPI.sig = "ii";
        var _eglChooseConfig = (display, attrib_list, configs, config_size, numConfigs) => EGL.chooseConfig(display, attrib_list, configs, config_size, numConfigs);
        _eglChooseConfig.sig = "ipppip";
        var GLctx;
        var webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance = ctx => !!(ctx.dibvbi = ctx.getExtension("WEBGL_draw_instanced_base_vertex_base_instance"));
        var webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance = ctx => !!(ctx.mdibvbi = ctx.getExtension("WEBGL_multi_draw_instanced_base_vertex_base_instance"));
        var webgl_enable_EXT_polygon_offset_clamp = ctx => !!(ctx.extPolygonOffsetClamp = ctx.getExtension("EXT_polygon_offset_clamp"));
        var webgl_enable_EXT_clip_control = ctx => !!(ctx.extClipControl = ctx.getExtension("EXT_clip_control"));
        var webgl_enable_WEBGL_polygon_mode = ctx => !!(ctx.webglPolygonMode = ctx.getExtension("WEBGL_polygon_mode"));
        var webgl_enable_WEBGL_multi_draw = ctx => !!(ctx.multiDrawWebgl = ctx.getExtension("WEBGL_multi_draw"));
        var getEmscriptenSupportedExtensions = ctx => { var supportedExtensions = ["EXT_color_buffer_float", "EXT_conservative_depth", "EXT_disjoint_timer_query_webgl2", "EXT_texture_norm16", "NV_shader_noperspective_interpolation", "WEBGL_clip_cull_distance", "EXT_clip_control", "EXT_color_buffer_half_float", "EXT_depth_clamp", "EXT_float_blend", "EXT_polygon_offset_clamp", "EXT_texture_compression_bptc", "EXT_texture_compression_rgtc", "EXT_texture_filter_anisotropic", "KHR_parallel_shader_compile", "OES_texture_float_linear", "WEBGL_blend_func_extended", "WEBGL_compressed_texture_astc", "WEBGL_compressed_texture_etc", "WEBGL_compressed_texture_etc1", "WEBGL_compressed_texture_s3tc", "WEBGL_compressed_texture_s3tc_srgb", "WEBGL_debug_renderer_info", "WEBGL_debug_shaders", "WEBGL_lose_context", "WEBGL_multi_draw", "WEBGL_polygon_mode"]; return (ctx.getSupportedExtensions() || []).filter(ext => supportedExtensions.includes(ext)); };
        var registerPreMainLoop = f => { typeof MainLoop != "undefined" && MainLoop.preMainLoop.push(f); };
        var GL = { counter: 1, buffers: [], mappedBuffers: {}, programs: [], framebuffers: [], renderbuffers: [], textures: [], shaders: [], vaos: [], contexts: [], offscreenCanvases: {}, queries: [], samplers: [], transformFeedbacks: [], syncs: [], byteSizeByTypeRoot: 5120, byteSizeByType: [1, 1, 2, 2, 4, 4, 4, 2, 3, 4, 8], stringCache: {}, stringiCache: {}, unpackAlignment: 4, unpackRowLength: 0, recordError: errorCode => { if (!GL.lastError) {
                GL.lastError = errorCode;
            } }, getNewId: table => { var ret = GL.counter++; for (var i = table.length; i < ret; i++) {
                table[i] = null;
            } while (table[ret]) {
                ret = GL.counter++;
            } return ret; }, genObject: (n, buffers, createFunction, objectTable) => { for (var i = 0; i < n; i++) {
                var buffer = GLctx[createFunction]();
                var id = buffer && GL.getNewId(objectTable);
                if (buffer) {
                    buffer.name = id;
                    objectTable[id] = buffer;
                }
                else {
                    GL.recordError(1282);
                }
                HEAP32[buffers + i * 4 >> 2] = id;
            } }, MAX_TEMP_BUFFER_SIZE: 2097152, numTempVertexBuffersPerSize: 64, log2ceilLookup: i => 32 - Math.clz32(i === 0 ? 0 : i - 1), generateTempBuffers: (quads, context) => { var largestIndex = GL.log2ceilLookup(GL.MAX_TEMP_BUFFER_SIZE); context.tempVertexBufferCounters1 = []; context.tempVertexBufferCounters2 = []; context.tempVertexBufferCounters1.length = context.tempVertexBufferCounters2.length = largestIndex + 1; context.tempVertexBuffers1 = []; context.tempVertexBuffers2 = []; context.tempVertexBuffers1.length = context.tempVertexBuffers2.length = largestIndex + 1; context.tempIndexBuffers = []; context.tempIndexBuffers.length = largestIndex + 1; for (var i = 0; i <= largestIndex; ++i) {
                context.tempIndexBuffers[i] = null;
                context.tempVertexBufferCounters1[i] = context.tempVertexBufferCounters2[i] = 0;
                var ringbufferLength = GL.numTempVertexBuffersPerSize;
                context.tempVertexBuffers1[i] = [];
                context.tempVertexBuffers2[i] = [];
                var ringbuffer1 = context.tempVertexBuffers1[i];
                var ringbuffer2 = context.tempVertexBuffers2[i];
                ringbuffer1.length = ringbuffer2.length = ringbufferLength;
                for (var j = 0; j < ringbufferLength; ++j) {
                    ringbuffer1[j] = ringbuffer2[j] = null;
                }
            } if (quads) {
                context.tempQuadIndexBuffer = GLctx.createBuffer();
                context.GLctx.bindBuffer(34963, context.tempQuadIndexBuffer);
                var numIndexes = GL.MAX_TEMP_BUFFER_SIZE >> 1;
                var quadIndexes = new Uint16Array(numIndexes);
                var i = 0, v = 0;
                while (1) {
                    quadIndexes[i++] = v;
                    if (i >= numIndexes)
                        break;
                    quadIndexes[i++] = v + 1;
                    if (i >= numIndexes)
                        break;
                    quadIndexes[i++] = v + 2;
                    if (i >= numIndexes)
                        break;
                    quadIndexes[i++] = v;
                    if (i >= numIndexes)
                        break;
                    quadIndexes[i++] = v + 2;
                    if (i >= numIndexes)
                        break;
                    quadIndexes[i++] = v + 3;
                    if (i >= numIndexes)
                        break;
                    v += 4;
                }
                context.GLctx.bufferData(34963, quadIndexes, 35044);
                context.GLctx.bindBuffer(34963, null);
            } }, getTempVertexBuffer: sizeBytes => { var idx = GL.log2ceilLookup(sizeBytes); var ringbuffer = GL.currentContext.tempVertexBuffers1[idx]; var nextFreeBufferIndex = GL.currentContext.tempVertexBufferCounters1[idx]; GL.currentContext.tempVertexBufferCounters1[idx] = GL.currentContext.tempVertexBufferCounters1[idx] + 1 & GL.numTempVertexBuffersPerSize - 1; var vbo = ringbuffer[nextFreeBufferIndex]; if (vbo) {
                return vbo;
            } var prevVBO = GLctx.getParameter(34964); ringbuffer[nextFreeBufferIndex] = GLctx.createBuffer(); GLctx.bindBuffer(34962, ringbuffer[nextFreeBufferIndex]); GLctx.bufferData(34962, 1 << idx, 35048); GLctx.bindBuffer(34962, prevVBO); return ringbuffer[nextFreeBufferIndex]; }, getTempIndexBuffer: sizeBytes => { var idx = GL.log2ceilLookup(sizeBytes); var ibo = GL.currentContext.tempIndexBuffers[idx]; if (ibo) {
                return ibo;
            } var prevIBO = GLctx.getParameter(34965); GL.currentContext.tempIndexBuffers[idx] = GLctx.createBuffer(); GLctx.bindBuffer(34963, GL.currentContext.tempIndexBuffers[idx]); GLctx.bufferData(34963, 1 << idx, 35048); GLctx.bindBuffer(34963, prevIBO); return GL.currentContext.tempIndexBuffers[idx]; }, newRenderingFrameStarted: () => { if (!GL.currentContext) {
                return;
            } var vb = GL.currentContext.tempVertexBuffers1; GL.currentContext.tempVertexBuffers1 = GL.currentContext.tempVertexBuffers2; GL.currentContext.tempVertexBuffers2 = vb; vb = GL.currentContext.tempVertexBufferCounters1; GL.currentContext.tempVertexBufferCounters1 = GL.currentContext.tempVertexBufferCounters2; GL.currentContext.tempVertexBufferCounters2 = vb; var largestIndex = GL.log2ceilLookup(GL.MAX_TEMP_BUFFER_SIZE); for (var i = 0; i <= largestIndex; ++i) {
                GL.currentContext.tempVertexBufferCounters1[i] = 0;
            } }, getSource: (shader, count, string, length) => { var source = ""; for (var i = 0; i < count; ++i) {
                var len = length ? HEAPU32[length + i * 4 >> 2] : undefined;
                source += UTF8ToString(HEAPU32[string + i * 4 >> 2], len);
            } return source; }, calcBufLength: (size, type, stride, count) => { if (stride > 0) {
                return count * stride;
            } var typeSize = GL.byteSizeByType[type - GL.byteSizeByTypeRoot]; return size * typeSize * count; }, usedTempBuffers: [], preDrawHandleClientVertexAttribBindings: count => { GL.resetBufferBinding = false; for (var i = 0; i < GL.currentContext.maxVertexAttribs; ++i) {
                var cb = GL.currentContext.clientBuffers[i];
                if (!cb.clientside || !cb.enabled)
                    continue;
                GL.resetBufferBinding = true;
                var size = GL.calcBufLength(cb.size, cb.type, cb.stride, count);
                var buf = GL.getTempVertexBuffer(size);
                GLctx.bindBuffer(34962, buf);
                GLctx.bufferSubData(34962, 0, HEAPU8.subarray(cb.ptr, cb.ptr + size));
                cb.vertexAttribPointerAdaptor.call(GLctx, i, cb.size, cb.type, cb.normalized, cb.stride, 0);
            } }, postDrawHandleClientVertexAttribBindings: () => { if (GL.resetBufferBinding) {
                GLctx.bindBuffer(34962, GL.buffers[GLctx.currentArrayBufferBinding]);
            } }, createContext: (canvas, webGLContextAttributes) => { if (!canvas.getContextSafariWebGL2Fixed) {
                canvas.getContextSafariWebGL2Fixed = canvas.getContext;
                function fixedGetContext(ver, attrs) { var gl = canvas.getContextSafariWebGL2Fixed(ver, attrs); return ver == "webgl" == gl instanceof WebGLRenderingContext ? gl : null; }
                canvas.getContext = fixedGetContext;
            } var ctx = canvas.getContext("webgl2", webGLContextAttributes); if (!ctx)
                return 0; var handle = GL.registerContext(ctx, webGLContextAttributes); return handle; }, registerContext: (ctx, webGLContextAttributes) => { var handle = GL.getNewId(GL.contexts); var context = { handle, attributes: webGLContextAttributes, version: webGLContextAttributes.majorVersion, GLctx: ctx }; if (ctx.canvas)
                ctx.canvas.GLctxObject = context; GL.contexts[handle] = context; if (typeof webGLContextAttributes.enableExtensionsByDefault == "undefined" || webGLContextAttributes.enableExtensionsByDefault) {
                GL.initExtensions(context);
            } context.maxVertexAttribs = context.GLctx.getParameter(34921); context.clientBuffers = []; for (var i = 0; i < context.maxVertexAttribs; i++) {
                context.clientBuffers[i] = { enabled: false, clientside: false, size: 0, type: 0, normalized: 0, stride: 0, ptr: 0, vertexAttribPointerAdaptor: null };
            } GL.generateTempBuffers(false, context); return handle; }, makeContextCurrent: contextHandle => { GL.currentContext = GL.contexts[contextHandle]; Module["ctx"] = GLctx = GL.currentContext?.GLctx; return !(contextHandle && !GLctx); }, getContext: contextHandle => GL.contexts[contextHandle], deleteContext: contextHandle => { if (GL.currentContext === GL.contexts[contextHandle]) {
                GL.currentContext = null;
            } if (typeof JSEvents == "object") {
                JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas);
            } if (GL.contexts[contextHandle]?.GLctx.canvas) {
                GL.contexts[contextHandle].GLctx.canvas.GLctxObject = undefined;
            } GL.contexts[contextHandle] = null; }, initExtensions: context => { context || (context = GL.currentContext); if (context.initExtensionsDone)
                return; context.initExtensionsDone = true; var GLctx = context.GLctx; webgl_enable_WEBGL_multi_draw(GLctx); webgl_enable_EXT_polygon_offset_clamp(GLctx); webgl_enable_EXT_clip_control(GLctx); webgl_enable_WEBGL_polygon_mode(GLctx); webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance(GLctx); webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance(GLctx); if (context.version >= 2) {
                GLctx.disjointTimerQueryExt = GLctx.getExtension("EXT_disjoint_timer_query_webgl2");
            } if (context.version < 2 || !GLctx.disjointTimerQueryExt) {
                GLctx.disjointTimerQueryExt = GLctx.getExtension("EXT_disjoint_timer_query");
            } getEmscriptenSupportedExtensions(GLctx).forEach(ext => { if (!ext.includes("lose_context") && !ext.includes("debug")) {
                GLctx.getExtension(ext);
            } }); } };
        var _eglCreateContext = (display, config, hmm, contextAttribs) => { if (display != 62e3) {
            EGL.setErrorCode(12296);
            return 0;
        } var glesContextVersion = 1; for (;;) {
            var param = HEAP32[contextAttribs >> 2];
            if (param == 12440) {
                glesContextVersion = HEAP32[contextAttribs + 4 >> 2];
            }
            else if (param == 12344) {
                break;
            }
            else {
                EGL.setErrorCode(12292);
                return 0;
            }
            contextAttribs += 8;
        } if (glesContextVersion < 2 || glesContextVersion > 3) {
            EGL.setErrorCode(12293);
            return 0;
        } EGL.contextAttributes.majorVersion = glesContextVersion - 1; EGL.contextAttributes.minorVersion = 0; EGL.context = GL.createContext(Browser.getCanvas(), EGL.contextAttributes); if (EGL.context != 0) {
            EGL.setErrorCode(12288);
            GL.makeContextCurrent(EGL.context);
            Browser.useWebGL = true;
            Browser.moduleContextCreatedCallbacks.forEach(callback => callback());
            GL.makeContextCurrent(null);
            return 62004;
        }
        else {
            EGL.setErrorCode(12297);
            return 0;
        } };
        _eglCreateContext.sig = "ppppp";
        var _eglCreateWindowSurface = (display, config, win, attrib_list) => { if (display != 62e3) {
            EGL.setErrorCode(12296);
            return 0;
        } if (config != 62002) {
            EGL.setErrorCode(12293);
            return 0;
        } EGL.setErrorCode(12288); return 62006; };
        _eglCreateWindowSurface.sig = "pppip";
        var _eglDestroyContext = (display, context) => { if (display != 62e3) {
            EGL.setErrorCode(12296);
            return 0;
        } if (context != 62004) {
            EGL.setErrorCode(12294);
            return 0;
        } GL.deleteContext(EGL.context); EGL.setErrorCode(12288); if (EGL.currentContext == context) {
            EGL.currentContext = 0;
        } return 1; };
        _eglDestroyContext.sig = "ipp";
        var _eglDestroySurface = (display, surface) => { if (display != 62e3) {
            EGL.setErrorCode(12296);
            return 0;
        } if (surface != 62006) {
            EGL.setErrorCode(12301);
            return 1;
        } if (EGL.currentReadSurface == surface) {
            EGL.currentReadSurface = 0;
        } if (EGL.currentDrawSurface == surface) {
            EGL.currentDrawSurface = 0;
        } EGL.setErrorCode(12288); return 1; };
        _eglDestroySurface.sig = "ipp";
        var _eglGetConfigAttrib = (display, config, attribute, value) => { if (display != 62e3) {
            EGL.setErrorCode(12296);
            return 0;
        } if (config != 62002) {
            EGL.setErrorCode(12293);
            return 0;
        } if (!value) {
            EGL.setErrorCode(12300);
            return 0;
        } EGL.setErrorCode(12288); switch (attribute) {
            case 12320:
                HEAP32[value >> 2] = EGL.contextAttributes.alpha ? 32 : 24;
                return 1;
            case 12321:
                HEAP32[value >> 2] = EGL.contextAttributes.alpha ? 8 : 0;
                return 1;
            case 12322:
                HEAP32[value >> 2] = 8;
                return 1;
            case 12323:
                HEAP32[value >> 2] = 8;
                return 1;
            case 12324:
                HEAP32[value >> 2] = 8;
                return 1;
            case 12325:
                HEAP32[value >> 2] = EGL.contextAttributes.depth ? 24 : 0;
                return 1;
            case 12326:
                HEAP32[value >> 2] = EGL.contextAttributes.stencil ? 8 : 0;
                return 1;
            case 12327:
                HEAP32[value >> 2] = 12344;
                return 1;
            case 12328:
                HEAP32[value >> 2] = 62002;
                return 1;
            case 12329:
                HEAP32[value >> 2] = 0;
                return 1;
            case 12330:
                HEAP32[value >> 2] = 4096;
                return 1;
            case 12331:
                HEAP32[value >> 2] = 16777216;
                return 1;
            case 12332:
                HEAP32[value >> 2] = 4096;
                return 1;
            case 12333:
                HEAP32[value >> 2] = 0;
                return 1;
            case 12334:
                HEAP32[value >> 2] = 0;
                return 1;
            case 12335:
                HEAP32[value >> 2] = 12344;
                return 1;
            case 12337:
                HEAP32[value >> 2] = EGL.contextAttributes.antialias ? 4 : 0;
                return 1;
            case 12338:
                HEAP32[value >> 2] = EGL.contextAttributes.antialias ? 1 : 0;
                return 1;
            case 12339:
                HEAP32[value >> 2] = 4;
                return 1;
            case 12340:
                HEAP32[value >> 2] = 12344;
                return 1;
            case 12341:
            case 12342:
            case 12343:
                HEAP32[value >> 2] = -1;
                return 1;
            case 12345:
            case 12346:
                HEAP32[value >> 2] = 0;
                return 1;
            case 12347:
                HEAP32[value >> 2] = 0;
                return 1;
            case 12348:
                HEAP32[value >> 2] = 1;
                return 1;
            case 12349:
            case 12350:
                HEAP32[value >> 2] = 0;
                return 1;
            case 12351:
                HEAP32[value >> 2] = 12430;
                return 1;
            case 12352:
                HEAP32[value >> 2] = 4;
                return 1;
            case 12354:
                HEAP32[value >> 2] = 0;
                return 1;
            default:
                EGL.setErrorCode(12292);
                return 0;
        } };
        _eglGetConfigAttrib.sig = "ippip";
        var _eglGetDisplay = nativeDisplayType => { EGL.setErrorCode(12288); if (nativeDisplayType != 0 && nativeDisplayType != 1) {
            return 0;
        } return 62e3; };
        _eglGetDisplay.sig = "pp";
        var _eglGetError = () => EGL.errorCode;
        _eglGetError.sig = "i";
        var _eglInitialize = (display, majorVersion, minorVersion) => { if (display != 62e3) {
            EGL.setErrorCode(12296);
            return 0;
        } if (majorVersion) {
            HEAP32[majorVersion >> 2] = 1;
        } if (minorVersion) {
            HEAP32[minorVersion >> 2] = 4;
        } EGL.defaultDisplayInitialized = true; EGL.setErrorCode(12288); return 1; };
        _eglInitialize.sig = "ippp";
        var _eglMakeCurrent = (display, draw, read, context) => { if (display != 62e3) {
            EGL.setErrorCode(12296);
            return 0;
        } if (context != 0 && context != 62004) {
            EGL.setErrorCode(12294);
            return 0;
        } if (read != 0 && read != 62006 || draw != 0 && draw != 62006) {
            EGL.setErrorCode(12301);
            return 0;
        } GL.makeContextCurrent(context ? EGL.context : null); EGL.currentContext = context; EGL.currentDrawSurface = draw; EGL.currentReadSurface = read; EGL.setErrorCode(12288); return 1; };
        _eglMakeCurrent.sig = "ipppp";
        var _eglQueryString = (display, name) => { if (display != 62e3) {
            EGL.setErrorCode(12296);
            return 0;
        } EGL.setErrorCode(12288); if (EGL.stringCache[name])
            return EGL.stringCache[name]; var ret; switch (name) {
            case 12371:
                ret = stringToNewUTF8("Emscripten");
                break;
            case 12372:
                ret = stringToNewUTF8("1.4 Emscripten EGL");
                break;
            case 12373:
                ret = stringToNewUTF8("");
                break;
            case 12429:
                ret = stringToNewUTF8("OpenGL_ES");
                break;
            default:
                EGL.setErrorCode(12300);
                return 0;
        } EGL.stringCache[name] = ret; return ret; };
        _eglQueryString.sig = "ppi";
        var _eglSwapBuffers = (dpy, surface) => { if (!EGL.defaultDisplayInitialized) {
            EGL.setErrorCode(12289);
        }
        else if (!GLctx) {
            EGL.setErrorCode(12290);
        }
        else if (GLctx.isContextLost()) {
            EGL.setErrorCode(12302);
        }
        else {
            EGL.setErrorCode(12288);
            return 1;
        } return 0; };
        _eglSwapBuffers.sig = "ipp";
        var _eglSwapInterval = (display, interval) => { if (display != 62e3) {
            EGL.setErrorCode(12296);
            return 0;
        } if (interval == 0)
            _emscripten_set_main_loop_timing(0, 0);
        else
            _emscripten_set_main_loop_timing(1, interval); EGL.setErrorCode(12288); return 1; };
        _eglSwapInterval.sig = "ipi";
        var _eglTerminate = display => { if (display != 62e3) {
            EGL.setErrorCode(12296);
            return 0;
        } EGL.currentContext = 0; EGL.currentReadSurface = 0; EGL.currentDrawSurface = 0; EGL.defaultDisplayInitialized = false; EGL.setErrorCode(12288); return 1; };
        _eglTerminate.sig = "ip";
        var _eglWaitClient = () => { EGL.setErrorCode(12288); return 1; };
        _eglWaitClient.sig = "i";
        var _eglWaitGL = _eglWaitClient;
        _eglWaitGL.sig = "i";
        var _eglWaitNative = nativeEngineId => { EGL.setErrorCode(12288); return 1; };
        _eglWaitNative.sig = "ii";
        var _emscripten_alcDevicePauseSOFT = deviceId => { if (!(deviceId in AL.deviceRefCounts)) {
            AL.alcErr = 40961;
            return;
        } if (AL.paused) {
            return;
        } AL.paused = true; for (var ctxId in AL.contexts) {
            var ctx = AL.contexts[ctxId];
            if (ctx.deviceId !== deviceId) {
                continue;
            }
            ctx.audioCtx.suspend();
            clearInterval(ctx.interval);
            ctx.interval = null;
        } };
        _emscripten_alcDevicePauseSOFT.sig = "vi";
        var _emscripten_alcDeviceResumeSOFT = deviceId => { if (!(deviceId in AL.deviceRefCounts)) {
            AL.alcErr = 40961;
            return;
        } if (!AL.paused) {
            return;
        } AL.paused = false; for (var ctxId in AL.contexts) {
            var ctx = AL.contexts[ctxId];
            if (ctx.deviceId !== deviceId) {
                continue;
            }
            ctx.interval = setInterval(() => AL.scheduleContextAudio(ctx), AL.QUEUE_INTERVAL);
            ctx.audioCtx.resume();
        } };
        _emscripten_alcDeviceResumeSOFT.sig = "vi";
        var _emscripten_alcGetStringiSOFT = (deviceId, param, index) => { if (!(deviceId in AL.deviceRefCounts)) {
            AL.alcErr = 40961;
            return 0;
        } if (AL.alcStringCache[param]) {
            return AL.alcStringCache[param];
        } var ret; switch (param) {
            case 6549:
                if (index === 0) {
                    ret = "Web Audio HRTF";
                }
                else {
                    AL.alcErr = 40964;
                    return 0;
                }
                break;
            default:
                if (index !== 0) {
                    AL.alcErr = 40963;
                    return 0;
                }
                return _alcGetString(deviceId, param);
        } ret = stringToNewUTF8(ret); AL.alcStringCache[param] = ret; return ret; };
        _emscripten_alcGetStringiSOFT.sig = "iiii";
        var _emscripten_alcResetDeviceSOFT = (deviceId, pAttrList) => { if (!(deviceId in AL.deviceRefCounts)) {
            AL.alcErr = 40961;
            return 0;
        } var hrtf = null; pAttrList >>= 2; if (pAttrList) {
            var attr = 0;
            var val = 0;
            while (true) {
                attr = HEAP32[pAttrList++];
                if (attr === 0) {
                    break;
                }
                val = HEAP32[pAttrList++];
                switch (attr) {
                    case 6546:
                        if (val === 1) {
                            hrtf = true;
                        }
                        else if (val === 0) {
                            hrtf = false;
                        }
                        break;
                }
            }
        } if (hrtf !== null) {
            for (var ctxId in AL.contexts) {
                var ctx = AL.contexts[ctxId];
                if (ctx.deviceId === deviceId) {
                    ctx.hrtf = hrtf;
                    AL.updateContextGlobal(ctx);
                }
            }
        } return 1; };
        _emscripten_alcResetDeviceSOFT.sig = "iii";
        var readEmAsmArgsArray = [];
        var readEmAsmArgs = (sigPtr, buf) => { readEmAsmArgsArray.length = 0; var ch; while (ch = HEAPU8[sigPtr++]) {
            var wide = ch != 105;
            wide &= ch != 112;
            buf += wide && buf % 8 ? 4 : 0;
            readEmAsmArgsArray.push(ch == 112 ? HEAPU32[buf >> 2] : ch == 106 ? HEAP64[buf >> 3] : ch == 105 ? HEAP32[buf >> 2] : HEAPF64[buf >> 3]);
            buf += wide ? 8 : 4;
        } return readEmAsmArgsArray; };
        var runEmAsmFunction = (code, sigPtr, argbuf) => { var args = readEmAsmArgs(sigPtr, argbuf); return ASM_CONSTS[code](...args); };
        var _emscripten_asm_const_int = (code, sigPtr, argbuf) => runEmAsmFunction(code, sigPtr, argbuf);
        _emscripten_asm_const_int.sig = "ippp";
        var runMainThreadEmAsm = (emAsmAddr, sigPtr, argbuf, sync) => { var args = readEmAsmArgs(sigPtr, argbuf); return ASM_CONSTS[emAsmAddr](...args); };
        var _emscripten_asm_const_int_sync_on_main_thread = (emAsmAddr, sigPtr, argbuf) => runMainThreadEmAsm(emAsmAddr, sigPtr, argbuf, 1);
        _emscripten_asm_const_int_sync_on_main_thread.sig = "ippp";
        var _emscripten_asm_const_ptr_sync_on_main_thread = (emAsmAddr, sigPtr, argbuf) => runMainThreadEmAsm(emAsmAddr, sigPtr, argbuf, 1);
        _emscripten_asm_const_ptr_sync_on_main_thread.sig = "pppp";
        var _emscripten_cancel_main_loop = () => { MainLoop.pause(); MainLoop.func = null; };
        _emscripten_cancel_main_loop.sig = "v";
        var _emscripten_clear_timeout = clearTimeout;
        _emscripten_clear_timeout.sig = "vi";
        var _emscripten_console_error = str => { console.error(UTF8ToString(str)); };
        _emscripten_console_error.sig = "vp";
        var _emscripten_console_log = str => { console.log(UTF8ToString(str)); };
        _emscripten_console_log.sig = "vp";
        var _emscripten_console_trace = str => { console.trace(UTF8ToString(str)); };
        _emscripten_console_trace.sig = "vp";
        var _emscripten_console_warn = str => { console.warn(UTF8ToString(str)); };
        _emscripten_console_warn.sig = "vp";
        var _emscripten_err = str => err(UTF8ToString(str));
        _emscripten_err.sig = "vp";
        var onExits = [];
        var addOnExit = cb => onExits.push(cb);
        var JSEvents = { memcpy(target, src, size) { HEAP8.set(HEAP8.subarray(src, src + size), target); }, removeAllEventListeners() { while (JSEvents.eventHandlers.length) {
                JSEvents._removeHandler(JSEvents.eventHandlers.length - 1);
            } JSEvents.deferredCalls = []; }, inEventHandler: 0, deferredCalls: [], deferCall(targetFunction, precedence, argsList) { function arraysHaveEqualContent(arrA, arrB) { if (arrA.length != arrB.length)
                return false; for (var i in arrA) {
                if (arrA[i] != arrB[i])
                    return false;
            } return true; } for (var call of JSEvents.deferredCalls) {
                if (call.targetFunction == targetFunction && arraysHaveEqualContent(call.argsList, argsList)) {
                    return;
                }
            } JSEvents.deferredCalls.push({ targetFunction, precedence, argsList }); JSEvents.deferredCalls.sort((x, y) => x.precedence < y.precedence); }, removeDeferredCalls(targetFunction) { JSEvents.deferredCalls = JSEvents.deferredCalls.filter(call => call.targetFunction != targetFunction); }, canPerformEventHandlerRequests() { if (navigator.userActivation) {
                return navigator.userActivation.isActive;
            } return JSEvents.inEventHandler && JSEvents.currentEventHandler.allowsDeferredCalls; }, runDeferredCalls() { if (!JSEvents.canPerformEventHandlerRequests()) {
                return;
            } var deferredCalls = JSEvents.deferredCalls; JSEvents.deferredCalls = []; for (var call of deferredCalls) {
                call.targetFunction(...call.argsList);
            } }, eventHandlers: [], removeAllHandlersOnTarget: (target, eventTypeString) => { for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
                if (JSEvents.eventHandlers[i].target == target && (!eventTypeString || eventTypeString == JSEvents.eventHandlers[i].eventTypeString)) {
                    JSEvents._removeHandler(i--);
                }
            } }, _removeHandler(i) { var h = JSEvents.eventHandlers[i]; h.target.removeEventListener(h.eventTypeString, h.eventListenerFunc, h.useCapture); JSEvents.eventHandlers.splice(i, 1); }, registerOrRemoveHandler(eventHandler) { if (!eventHandler.target) {
                return -4;
            } if (eventHandler.callbackfunc) {
                eventHandler.eventListenerFunc = function (event) { ++JSEvents.inEventHandler; JSEvents.currentEventHandler = eventHandler; JSEvents.runDeferredCalls(); eventHandler.handlerFunc(event); JSEvents.runDeferredCalls(); --JSEvents.inEventHandler; };
                eventHandler.target.addEventListener(eventHandler.eventTypeString, eventHandler.eventListenerFunc, eventHandler.useCapture);
                JSEvents.eventHandlers.push(eventHandler);
            }
            else {
                for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
                    if (JSEvents.eventHandlers[i].target == eventHandler.target && JSEvents.eventHandlers[i].eventTypeString == eventHandler.eventTypeString) {
                        JSEvents._removeHandler(i--);
                    }
                }
            } return 0; }, getNodeNameForTarget(target) { if (!target)
                return ""; if (target == window)
                return "#window"; if (target == screen)
                return "#screen"; return target?.nodeName || ""; }, fullscreenEnabled() { return document.fullscreenEnabled || document.webkitFullscreenEnabled; } };
        var specialHTMLTargets = [0, document, window];
        var maybeCStringToJsString = cString => cString > 2 ? UTF8ToString(cString) : cString;
        var findEventTarget = target => { target = maybeCStringToJsString(target); var domElement = specialHTMLTargets[target] || document.querySelector(target); return domElement; };
        var findCanvasEventTarget = findEventTarget;
        var _emscripten_get_canvas_element_size = (target, width, height) => { var canvas = findCanvasEventTarget(target); if (!canvas)
            return -4; HEAP32[width >> 2] = canvas.width; HEAP32[height >> 2] = canvas.height; };
        _emscripten_get_canvas_element_size.sig = "ippp";
        var getCanvasElementSize = target => { var sp = stackSave(); var w = stackAlloc(8); var h = w + 4; var targetInt = stringToUTF8OnStack(target.id); var ret = _emscripten_get_canvas_element_size(targetInt, w, h); var size = [HEAP32[w >> 2], HEAP32[h >> 2]]; stackRestore(sp); return size; };
        var _emscripten_set_canvas_element_size = (target, width, height) => { var canvas = findCanvasEventTarget(target); if (!canvas)
            return -4; canvas.width = width; canvas.height = height; return 0; };
        _emscripten_set_canvas_element_size.sig = "ipii";
        var setCanvasElementSize = (target, width, height) => { if (!target.controlTransferredOffscreen) {
            target.width = width;
            target.height = height;
        }
        else {
            var sp = stackSave();
            var targetInt = stringToUTF8OnStack(target.id);
            _emscripten_set_canvas_element_size(targetInt, width, height);
            stackRestore(sp);
        } };
        var currentFullscreenStrategy = {};
        var registerRestoreOldStyle = canvas => { var canvasSize = getCanvasElementSize(canvas); var oldWidth = canvasSize[0]; var oldHeight = canvasSize[1]; var oldCssWidth = canvas.style.width; var oldCssHeight = canvas.style.height; var oldBackgroundColor = canvas.style.backgroundColor; var oldDocumentBackgroundColor = document.body.style.backgroundColor; var oldPaddingLeft = canvas.style.paddingLeft; var oldPaddingRight = canvas.style.paddingRight; var oldPaddingTop = canvas.style.paddingTop; var oldPaddingBottom = canvas.style.paddingBottom; var oldMarginLeft = canvas.style.marginLeft; var oldMarginRight = canvas.style.marginRight; var oldMarginTop = canvas.style.marginTop; var oldMarginBottom = canvas.style.marginBottom; var oldDocumentBodyMargin = document.body.style.margin; var oldDocumentOverflow = document.documentElement.style.overflow; var oldDocumentScroll = document.body.scroll; var oldImageRendering = canvas.style.imageRendering; function restoreOldStyle() { var fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement; if (!fullscreenElement) {
            document.removeEventListener("fullscreenchange", restoreOldStyle);
            document.removeEventListener("webkitfullscreenchange", restoreOldStyle);
            setCanvasElementSize(canvas, oldWidth, oldHeight);
            canvas.style.width = oldCssWidth;
            canvas.style.height = oldCssHeight;
            canvas.style.backgroundColor = oldBackgroundColor;
            if (!oldDocumentBackgroundColor)
                document.body.style.backgroundColor = "white";
            document.body.style.backgroundColor = oldDocumentBackgroundColor;
            canvas.style.paddingLeft = oldPaddingLeft;
            canvas.style.paddingRight = oldPaddingRight;
            canvas.style.paddingTop = oldPaddingTop;
            canvas.style.paddingBottom = oldPaddingBottom;
            canvas.style.marginLeft = oldMarginLeft;
            canvas.style.marginRight = oldMarginRight;
            canvas.style.marginTop = oldMarginTop;
            canvas.style.marginBottom = oldMarginBottom;
            document.body.style.margin = oldDocumentBodyMargin;
            document.documentElement.style.overflow = oldDocumentOverflow;
            document.body.scroll = oldDocumentScroll;
            canvas.style.imageRendering = oldImageRendering;
            if (canvas.GLctxObject)
                canvas.GLctxObject.GLctx.viewport(0, 0, oldWidth, oldHeight);
            if (currentFullscreenStrategy.canvasResizedCallback) {
                getWasmTableEntry(currentFullscreenStrategy.canvasResizedCallback)(37, 0, currentFullscreenStrategy.canvasResizedCallbackUserData);
            }
        } } document.addEventListener("fullscreenchange", restoreOldStyle); document.addEventListener("webkitfullscreenchange", restoreOldStyle); return restoreOldStyle; };
        var setLetterbox = (element, topBottom, leftRight) => { element.style.paddingLeft = element.style.paddingRight = leftRight + "px"; element.style.paddingTop = element.style.paddingBottom = topBottom + "px"; };
        var getBoundingClientRect = e => specialHTMLTargets.indexOf(e) < 0 ? e.getBoundingClientRect() : { left: 0, top: 0 };
        var JSEvents_resizeCanvasForFullscreen = (target, strategy) => { var _a, _b; var restoreOldStyle = registerRestoreOldStyle(target); var cssWidth = strategy.softFullscreen ? innerWidth : screen.width; var cssHeight = strategy.softFullscreen ? innerHeight : screen.height; var rect = getBoundingClientRect(target); var windowedCssWidth = rect.width; var windowedCssHeight = rect.height; var canvasSize = getCanvasElementSize(target); var windowedRttWidth = canvasSize[0]; var windowedRttHeight = canvasSize[1]; if (strategy.scaleMode == 3) {
            setLetterbox(target, (cssHeight - windowedCssHeight) / 2, (cssWidth - windowedCssWidth) / 2);
            cssWidth = windowedCssWidth;
            cssHeight = windowedCssHeight;
        }
        else if (strategy.scaleMode == 2) {
            if (cssWidth * windowedRttHeight < windowedRttWidth * cssHeight) {
                var desiredCssHeight = windowedRttHeight * cssWidth / windowedRttWidth;
                setLetterbox(target, (cssHeight - desiredCssHeight) / 2, 0);
                cssHeight = desiredCssHeight;
            }
            else {
                var desiredCssWidth = windowedRttWidth * cssHeight / windowedRttHeight;
                setLetterbox(target, 0, (cssWidth - desiredCssWidth) / 2);
                cssWidth = desiredCssWidth;
            }
        } (_a = target.style).backgroundColor || (_a.backgroundColor = "black"); (_b = document.body.style).backgroundColor || (_b.backgroundColor = "black"); target.style.width = cssWidth + "px"; target.style.height = cssHeight + "px"; if (strategy.filteringMode == 1) {
            target.style.imageRendering = "optimizeSpeed";
            target.style.imageRendering = "-moz-crisp-edges";
            target.style.imageRendering = "-o-crisp-edges";
            target.style.imageRendering = "-webkit-optimize-contrast";
            target.style.imageRendering = "optimize-contrast";
            target.style.imageRendering = "crisp-edges";
            target.style.imageRendering = "pixelated";
        } var dpiScale = strategy.canvasResolutionScaleMode == 2 ? devicePixelRatio : 1; if (strategy.canvasResolutionScaleMode != 0) {
            var newWidth = cssWidth * dpiScale | 0;
            var newHeight = cssHeight * dpiScale | 0;
            setCanvasElementSize(target, newWidth, newHeight);
            if (target.GLctxObject)
                target.GLctxObject.GLctx.viewport(0, 0, newWidth, newHeight);
        } return restoreOldStyle; };
        var JSEvents_requestFullscreen = (target, strategy) => { if (strategy.scaleMode != 0 || strategy.canvasResolutionScaleMode != 0) {
            JSEvents_resizeCanvasForFullscreen(target, strategy);
        } if (target.requestFullscreen) {
            target.requestFullscreen();
        }
        else if (target.webkitRequestFullscreen) {
            target.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
        else {
            return JSEvents.fullscreenEnabled() ? -3 : -1;
        } currentFullscreenStrategy = strategy; if (strategy.canvasResizedCallback) {
            getWasmTableEntry(strategy.canvasResizedCallback)(37, 0, strategy.canvasResizedCallbackUserData);
        } return 0; };
        var _emscripten_exit_fullscreen = () => { if (!JSEvents.fullscreenEnabled())
            return -1; JSEvents.removeDeferredCalls(JSEvents_requestFullscreen); var d = specialHTMLTargets[1]; if (d.exitFullscreen) {
            d.fullscreenElement && d.exitFullscreen();
        }
        else if (d.webkitExitFullscreen) {
            d.webkitFullscreenElement && d.webkitExitFullscreen();
        }
        else {
            return -1;
        } return 0; };
        _emscripten_exit_fullscreen.sig = "i";
        var requestPointerLock = target => { if (target.requestPointerLock) {
            target.requestPointerLock();
        }
        else {
            if (document.body.requestPointerLock) {
                return -3;
            }
            return -1;
        } return 0; };
        var _emscripten_exit_pointerlock = () => { JSEvents.removeDeferredCalls(requestPointerLock); if (!document.exitPointerLock)
            return -1; document.exitPointerLock(); return 0; };
        _emscripten_exit_pointerlock.sig = "i";
        var _emscripten_force_exit = status => { __emscripten_runtime_keepalive_clear(); _exit(status); };
        _emscripten_force_exit.sig = "vi";
        var fillBatteryEventData = (eventStruct, battery) => { HEAPF64[eventStruct >> 3] = battery.chargingTime; HEAPF64[eventStruct + 8 >> 3] = battery.dischargingTime; HEAPF64[eventStruct + 16 >> 3] = battery.level; HEAP8[eventStruct + 24] = battery.charging; };
        var hasBatteryAPI = () => typeof navigator != "undefined" && navigator.getBattery;
        var batteryManager;
        var _emscripten_get_battery_status = batteryState => { if (!hasBatteryAPI())
            return -1; if (!batteryManager) {
            navigator.getBattery().then(b => { batteryManager = b; });
            return -7;
        } fillBatteryEventData(batteryState, batteryManager); return 0; };
        _emscripten_get_battery_status.sig = "ip";
        var _emscripten_get_device_pixel_ratio = () => devicePixelRatio;
        _emscripten_get_device_pixel_ratio.sig = "d";
        var _emscripten_get_element_css_size = (target, width, height) => { target = findEventTarget(target); if (!target)
            return -4; var rect = getBoundingClientRect(target); HEAPF64[width >> 3] = rect.width; HEAPF64[height >> 3] = rect.height; return 0; };
        _emscripten_get_element_css_size.sig = "ippp";
        var fillGamepadEventData = (eventStruct, e) => { HEAPF64[eventStruct >> 3] = e.timestamp; for (var i = 0; i < e.axes.length; ++i) {
            HEAPF64[eventStruct + i * 8 + 16 >> 3] = e.axes[i];
        } for (var i = 0; i < e.buttons.length; ++i) {
            if (typeof e.buttons[i] == "object") {
                HEAPF64[eventStruct + i * 8 + 528 >> 3] = e.buttons[i].value;
            }
            else {
                HEAPF64[eventStruct + i * 8 + 528 >> 3] = e.buttons[i];
            }
        } for (var i = 0; i < e.buttons.length; ++i) {
            if (typeof e.buttons[i] == "object") {
                HEAP8[eventStruct + i + 1040] = e.buttons[i].pressed;
            }
            else {
                HEAP8[eventStruct + i + 1040] = e.buttons[i] == 1;
            }
        } HEAP8[eventStruct + 1104] = e.connected; HEAP32[eventStruct + 1108 >> 2] = e.index; HEAP32[eventStruct + 8 >> 2] = e.axes.length; HEAP32[eventStruct + 12 >> 2] = e.buttons.length; stringToUTF8(e.id, eventStruct + 1112, 64); stringToUTF8(e.mapping, eventStruct + 1176, 64); };
        var _emscripten_get_gamepad_status = (index, gamepadState) => { if (index < 0 || index >= JSEvents.lastGamepadState.length)
            return -5; if (!JSEvents.lastGamepadState[index])
            return -7; fillGamepadEventData(gamepadState, JSEvents.lastGamepadState[index]); return 0; };
        _emscripten_get_gamepad_status.sig = "iip";
        var getHeapMax = () => 2147483648;
        var _emscripten_get_heap_max = () => getHeapMax();
        _emscripten_get_heap_max.sig = "p";
        var _emscripten_get_num_gamepads = () => JSEvents.lastGamepadState.length;
        _emscripten_get_num_gamepads.sig = "i";
        var _emscripten_get_screen_size = (width, height) => { HEAP32[width >> 2] = screen.width; HEAP32[height >> 2] = screen.height; };
        _emscripten_get_screen_size.sig = "vpp";
        var _glActiveTexture = x0 => GLctx.activeTexture(x0);
        _glActiveTexture.sig = "vi";
        var _emscripten_glActiveTexture = _glActiveTexture;
        _emscripten_glActiveTexture.sig = "vi";
        var _glAttachShader = (program, shader) => { GLctx.attachShader(GL.programs[program], GL.shaders[shader]); };
        _glAttachShader.sig = "vii";
        var _emscripten_glAttachShader = _glAttachShader;
        _emscripten_glAttachShader.sig = "vii";
        var _glBeginQuery = (target, id) => { GLctx.beginQuery(target, GL.queries[id]); };
        _glBeginQuery.sig = "vii";
        var _emscripten_glBeginQuery = _glBeginQuery;
        _emscripten_glBeginQuery.sig = "vii";
        var _glBeginQueryEXT = (target, id) => { GLctx.disjointTimerQueryExt["beginQueryEXT"](target, GL.queries[id]); };
        _glBeginQueryEXT.sig = "vii";
        var _emscripten_glBeginQueryEXT = _glBeginQueryEXT;
        var _glBeginTransformFeedback = x0 => GLctx.beginTransformFeedback(x0);
        _glBeginTransformFeedback.sig = "vi";
        var _emscripten_glBeginTransformFeedback = _glBeginTransformFeedback;
        _emscripten_glBeginTransformFeedback.sig = "vi";
        var _glBindAttribLocation = (program, index, name) => { GLctx.bindAttribLocation(GL.programs[program], index, UTF8ToString(name)); };
        _glBindAttribLocation.sig = "viip";
        var _emscripten_glBindAttribLocation = _glBindAttribLocation;
        _emscripten_glBindAttribLocation.sig = "viip";
        var _glBindBuffer = (target, buffer) => { if (buffer && !GL.buffers[buffer]) {
            var b = GLctx.createBuffer();
            b.name = buffer;
            GL.buffers[buffer] = b;
        } if (target == 34962) {
            GLctx.currentArrayBufferBinding = buffer;
        }
        else if (target == 34963) {
            GLctx.currentElementArrayBufferBinding = buffer;
        } if (target == 35051) {
            GLctx.currentPixelPackBufferBinding = buffer;
        }
        else if (target == 35052) {
            GLctx.currentPixelUnpackBufferBinding = buffer;
        } GLctx.bindBuffer(target, GL.buffers[buffer]); };
        _glBindBuffer.sig = "vii";
        var _emscripten_glBindBuffer = _glBindBuffer;
        _emscripten_glBindBuffer.sig = "vii";
        var _glBindBufferBase = (target, index, buffer) => { GLctx.bindBufferBase(target, index, GL.buffers[buffer]); };
        _glBindBufferBase.sig = "viii";
        var _emscripten_glBindBufferBase = _glBindBufferBase;
        _emscripten_glBindBufferBase.sig = "viii";
        var _glBindBufferRange = (target, index, buffer, offset, ptrsize) => { GLctx.bindBufferRange(target, index, GL.buffers[buffer], offset, ptrsize); };
        _glBindBufferRange.sig = "viiipp";
        var _emscripten_glBindBufferRange = _glBindBufferRange;
        _emscripten_glBindBufferRange.sig = "viiipp";
        var _glBindFramebuffer = (target, framebuffer) => { GLctx.bindFramebuffer(target, GL.framebuffers[framebuffer]); };
        _glBindFramebuffer.sig = "vii";
        var _emscripten_glBindFramebuffer = _glBindFramebuffer;
        _emscripten_glBindFramebuffer.sig = "vii";
        var _glBindRenderbuffer = (target, renderbuffer) => { GLctx.bindRenderbuffer(target, GL.renderbuffers[renderbuffer]); };
        _glBindRenderbuffer.sig = "vii";
        var _emscripten_glBindRenderbuffer = _glBindRenderbuffer;
        _emscripten_glBindRenderbuffer.sig = "vii";
        var _glBindSampler = (unit, sampler) => { GLctx.bindSampler(unit, GL.samplers[sampler]); };
        _glBindSampler.sig = "vii";
        var _emscripten_glBindSampler = _glBindSampler;
        _emscripten_glBindSampler.sig = "vii";
        var _glBindTexture = (target, texture) => { GLctx.bindTexture(target, GL.textures[texture]); };
        _glBindTexture.sig = "vii";
        var _emscripten_glBindTexture = _glBindTexture;
        _emscripten_glBindTexture.sig = "vii";
        var _glBindTransformFeedback = (target, id) => { GLctx.bindTransformFeedback(target, GL.transformFeedbacks[id]); };
        _glBindTransformFeedback.sig = "vii";
        var _emscripten_glBindTransformFeedback = _glBindTransformFeedback;
        _emscripten_glBindTransformFeedback.sig = "vii";
        var _glBindVertexArray = vao => { GLctx.bindVertexArray(GL.vaos[vao]); var ibo = GLctx.getParameter(34965); GLctx.currentElementArrayBufferBinding = ibo ? ibo.name | 0 : 0; };
        _glBindVertexArray.sig = "vi";
        var _emscripten_glBindVertexArray = _glBindVertexArray;
        _emscripten_glBindVertexArray.sig = "vi";
        var _glBindVertexArrayOES = _glBindVertexArray;
        _glBindVertexArrayOES.sig = "vi";
        var _emscripten_glBindVertexArrayOES = _glBindVertexArrayOES;
        _emscripten_glBindVertexArrayOES.sig = "vi";
        var _glBlendColor = (x0, x1, x2, x3) => GLctx.blendColor(x0, x1, x2, x3);
        _glBlendColor.sig = "vffff";
        var _emscripten_glBlendColor = _glBlendColor;
        _emscripten_glBlendColor.sig = "vffff";
        var _glBlendEquation = x0 => GLctx.blendEquation(x0);
        _glBlendEquation.sig = "vi";
        var _emscripten_glBlendEquation = _glBlendEquation;
        _emscripten_glBlendEquation.sig = "vi";
        var _glBlendEquationSeparate = (x0, x1) => GLctx.blendEquationSeparate(x0, x1);
        _glBlendEquationSeparate.sig = "vii";
        var _emscripten_glBlendEquationSeparate = _glBlendEquationSeparate;
        _emscripten_glBlendEquationSeparate.sig = "vii";
        var _glBlendFunc = (x0, x1) => GLctx.blendFunc(x0, x1);
        _glBlendFunc.sig = "vii";
        var _emscripten_glBlendFunc = _glBlendFunc;
        _emscripten_glBlendFunc.sig = "vii";
        var _glBlendFuncSeparate = (x0, x1, x2, x3) => GLctx.blendFuncSeparate(x0, x1, x2, x3);
        _glBlendFuncSeparate.sig = "viiii";
        var _emscripten_glBlendFuncSeparate = _glBlendFuncSeparate;
        _emscripten_glBlendFuncSeparate.sig = "viiii";
        var _glBlitFramebuffer = (x0, x1, x2, x3, x4, x5, x6, x7, x8, x9) => GLctx.blitFramebuffer(x0, x1, x2, x3, x4, x5, x6, x7, x8, x9);
        _glBlitFramebuffer.sig = "viiiiiiiiii";
        var _emscripten_glBlitFramebuffer = _glBlitFramebuffer;
        _emscripten_glBlitFramebuffer.sig = "viiiiiiiiii";
        var _glBufferData = (target, size, data, usage) => { if (true) {
            if (data && size) {
                GLctx.bufferData(target, HEAPU8, usage, data, size);
            }
            else {
                GLctx.bufferData(target, size, usage);
            }
            return;
        } };
        _glBufferData.sig = "vippi";
        var _emscripten_glBufferData = _glBufferData;
        _emscripten_glBufferData.sig = "vippi";
        var _glBufferSubData = (target, offset, size, data) => { if (true) {
            size && GLctx.bufferSubData(target, offset, HEAPU8, data, size);
            return;
        } };
        _glBufferSubData.sig = "vippp";
        var _emscripten_glBufferSubData = _glBufferSubData;
        _emscripten_glBufferSubData.sig = "vippp";
        var _glCheckFramebufferStatus = x0 => GLctx.checkFramebufferStatus(x0);
        _glCheckFramebufferStatus.sig = "ii";
        var _emscripten_glCheckFramebufferStatus = _glCheckFramebufferStatus;
        _emscripten_glCheckFramebufferStatus.sig = "ii";
        var _glClear = x0 => GLctx.clear(x0);
        _glClear.sig = "vi";
        var _emscripten_glClear = _glClear;
        _emscripten_glClear.sig = "vi";
        var _glClearBufferfi = (x0, x1, x2, x3) => GLctx.clearBufferfi(x0, x1, x2, x3);
        _glClearBufferfi.sig = "viifi";
        var _emscripten_glClearBufferfi = _glClearBufferfi;
        _emscripten_glClearBufferfi.sig = "viifi";
        var _glClearBufferfv = (buffer, drawbuffer, value) => { GLctx.clearBufferfv(buffer, drawbuffer, HEAPF32, value >> 2); };
        _glClearBufferfv.sig = "viip";
        var _emscripten_glClearBufferfv = _glClearBufferfv;
        _emscripten_glClearBufferfv.sig = "viip";
        var _glClearBufferiv = (buffer, drawbuffer, value) => { GLctx.clearBufferiv(buffer, drawbuffer, HEAP32, value >> 2); };
        _glClearBufferiv.sig = "viip";
        var _emscripten_glClearBufferiv = _glClearBufferiv;
        _emscripten_glClearBufferiv.sig = "viip";
        var _glClearBufferuiv = (buffer, drawbuffer, value) => { GLctx.clearBufferuiv(buffer, drawbuffer, HEAPU32, value >> 2); };
        _glClearBufferuiv.sig = "viip";
        var _emscripten_glClearBufferuiv = _glClearBufferuiv;
        _emscripten_glClearBufferuiv.sig = "viip";
        var _glClearColor = (x0, x1, x2, x3) => GLctx.clearColor(x0, x1, x2, x3);
        _glClearColor.sig = "vffff";
        var _emscripten_glClearColor = _glClearColor;
        _emscripten_glClearColor.sig = "vffff";
        var _glClearDepthf = x0 => GLctx.clearDepth(x0);
        _glClearDepthf.sig = "vf";
        var _emscripten_glClearDepthf = _glClearDepthf;
        _emscripten_glClearDepthf.sig = "vf";
        var _glClearStencil = x0 => GLctx.clearStencil(x0);
        _glClearStencil.sig = "vi";
        var _emscripten_glClearStencil = _glClearStencil;
        _emscripten_glClearStencil.sig = "vi";
        var _glClientWaitSync = (sync, flags, timeout) => { timeout = Number(timeout); return GLctx.clientWaitSync(GL.syncs[sync], flags, timeout); };
        _glClientWaitSync.sig = "ipij";
        var _emscripten_glClientWaitSync = _glClientWaitSync;
        _emscripten_glClientWaitSync.sig = "ipij";
        var _glClipControlEXT = (origin, depth) => { GLctx.extClipControl["clipControlEXT"](origin, depth); };
        _glClipControlEXT.sig = "vii";
        var _emscripten_glClipControlEXT = _glClipControlEXT;
        var _glColorMask = (red, green, blue, alpha) => { GLctx.colorMask(!!red, !!green, !!blue, !!alpha); };
        _glColorMask.sig = "viiii";
        var _emscripten_glColorMask = _glColorMask;
        _emscripten_glColorMask.sig = "viiii";
        var _glCompileShader = shader => { GLctx.compileShader(GL.shaders[shader]); };
        _glCompileShader.sig = "vi";
        var _emscripten_glCompileShader = _glCompileShader;
        _emscripten_glCompileShader.sig = "vi";
        var _glCompressedTexImage2D = (target, level, internalFormat, width, height, border, imageSize, data) => { if (true) {
            if (GLctx.currentPixelUnpackBufferBinding || !imageSize) {
                GLctx.compressedTexImage2D(target, level, internalFormat, width, height, border, imageSize, data);
                return;
            }
            GLctx.compressedTexImage2D(target, level, internalFormat, width, height, border, HEAPU8, data, imageSize);
            return;
        } };
        _glCompressedTexImage2D.sig = "viiiiiiip";
        var _emscripten_glCompressedTexImage2D = _glCompressedTexImage2D;
        _emscripten_glCompressedTexImage2D.sig = "viiiiiiip";
        var _glCompressedTexImage3D = (target, level, internalFormat, width, height, depth, border, imageSize, data) => { if (GLctx.currentPixelUnpackBufferBinding) {
            GLctx.compressedTexImage3D(target, level, internalFormat, width, height, depth, border, imageSize, data);
        }
        else {
            GLctx.compressedTexImage3D(target, level, internalFormat, width, height, depth, border, HEAPU8, data, imageSize);
        } };
        _glCompressedTexImage3D.sig = "viiiiiiiip";
        var _emscripten_glCompressedTexImage3D = _glCompressedTexImage3D;
        _emscripten_glCompressedTexImage3D.sig = "viiiiiiiip";
        var _glCompressedTexSubImage2D = (target, level, xoffset, yoffset, width, height, format, imageSize, data) => { if (true) {
            if (GLctx.currentPixelUnpackBufferBinding || !imageSize) {
                GLctx.compressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, imageSize, data);
                return;
            }
            GLctx.compressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, HEAPU8, data, imageSize);
            return;
        } };
        _glCompressedTexSubImage2D.sig = "viiiiiiiip";
        var _emscripten_glCompressedTexSubImage2D = _glCompressedTexSubImage2D;
        _emscripten_glCompressedTexSubImage2D.sig = "viiiiiiiip";
        var _glCompressedTexSubImage3D = (target, level, xoffset, yoffset, zoffset, width, height, depth, format, imageSize, data) => { if (GLctx.currentPixelUnpackBufferBinding) {
            GLctx.compressedTexSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, imageSize, data);
        }
        else {
            GLctx.compressedTexSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, HEAPU8, data, imageSize);
        } };
        _glCompressedTexSubImage3D.sig = "viiiiiiiiiip";
        var _emscripten_glCompressedTexSubImage3D = _glCompressedTexSubImage3D;
        _emscripten_glCompressedTexSubImage3D.sig = "viiiiiiiiiip";
        var _glCopyBufferSubData = (x0, x1, x2, x3, x4) => GLctx.copyBufferSubData(x0, x1, x2, x3, x4);
        _glCopyBufferSubData.sig = "viippp";
        var _emscripten_glCopyBufferSubData = _glCopyBufferSubData;
        _emscripten_glCopyBufferSubData.sig = "viippp";
        var _glCopyTexImage2D = (x0, x1, x2, x3, x4, x5, x6, x7) => GLctx.copyTexImage2D(x0, x1, x2, x3, x4, x5, x6, x7);
        _glCopyTexImage2D.sig = "viiiiiiii";
        var _emscripten_glCopyTexImage2D = _glCopyTexImage2D;
        _emscripten_glCopyTexImage2D.sig = "viiiiiiii";
        var _glCopyTexSubImage2D = (x0, x1, x2, x3, x4, x5, x6, x7) => GLctx.copyTexSubImage2D(x0, x1, x2, x3, x4, x5, x6, x7);
        _glCopyTexSubImage2D.sig = "viiiiiiii";
        var _emscripten_glCopyTexSubImage2D = _glCopyTexSubImage2D;
        _emscripten_glCopyTexSubImage2D.sig = "viiiiiiii";
        var _glCopyTexSubImage3D = (x0, x1, x2, x3, x4, x5, x6, x7, x8) => GLctx.copyTexSubImage3D(x0, x1, x2, x3, x4, x5, x6, x7, x8);
        _glCopyTexSubImage3D.sig = "viiiiiiiii";
        var _emscripten_glCopyTexSubImage3D = _glCopyTexSubImage3D;
        _emscripten_glCopyTexSubImage3D.sig = "viiiiiiiii";
        var _glCreateProgram = () => { var id = GL.getNewId(GL.programs); var program = GLctx.createProgram(); program.name = id; program.maxUniformLength = program.maxAttributeLength = program.maxUniformBlockNameLength = 0; program.uniformIdCounter = 1; GL.programs[id] = program; return id; };
        _glCreateProgram.sig = "i";
        var _emscripten_glCreateProgram = _glCreateProgram;
        _emscripten_glCreateProgram.sig = "i";
        var _glCreateShader = shaderType => { var id = GL.getNewId(GL.shaders); GL.shaders[id] = GLctx.createShader(shaderType); return id; };
        _glCreateShader.sig = "ii";
        var _emscripten_glCreateShader = _glCreateShader;
        _emscripten_glCreateShader.sig = "ii";
        var _glCullFace = x0 => GLctx.cullFace(x0);
        _glCullFace.sig = "vi";
        var _emscripten_glCullFace = _glCullFace;
        _emscripten_glCullFace.sig = "vi";
        var _glDeleteBuffers = (n, buffers) => { for (var i = 0; i < n; i++) {
            var id = HEAP32[buffers + i * 4 >> 2];
            var buffer = GL.buffers[id];
            if (!buffer)
                continue;
            GLctx.deleteBuffer(buffer);
            buffer.name = 0;
            GL.buffers[id] = null;
            if (id == GLctx.currentArrayBufferBinding)
                GLctx.currentArrayBufferBinding = 0;
            if (id == GLctx.currentElementArrayBufferBinding)
                GLctx.currentElementArrayBufferBinding = 0;
            if (id == GLctx.currentPixelPackBufferBinding)
                GLctx.currentPixelPackBufferBinding = 0;
            if (id == GLctx.currentPixelUnpackBufferBinding)
                GLctx.currentPixelUnpackBufferBinding = 0;
        } };
        _glDeleteBuffers.sig = "vip";
        var _emscripten_glDeleteBuffers = _glDeleteBuffers;
        _emscripten_glDeleteBuffers.sig = "vip";
        var _glDeleteFramebuffers = (n, framebuffers) => { for (var i = 0; i < n; ++i) {
            var id = HEAP32[framebuffers + i * 4 >> 2];
            var framebuffer = GL.framebuffers[id];
            if (!framebuffer)
                continue;
            GLctx.deleteFramebuffer(framebuffer);
            framebuffer.name = 0;
            GL.framebuffers[id] = null;
        } };
        _glDeleteFramebuffers.sig = "vip";
        var _emscripten_glDeleteFramebuffers = _glDeleteFramebuffers;
        _emscripten_glDeleteFramebuffers.sig = "vip";
        var _glDeleteProgram = id => { if (!id)
            return; var program = GL.programs[id]; if (!program) {
            GL.recordError(1281);
            return;
        } GLctx.deleteProgram(program); program.name = 0; GL.programs[id] = null; };
        _glDeleteProgram.sig = "vi";
        var _emscripten_glDeleteProgram = _glDeleteProgram;
        _emscripten_glDeleteProgram.sig = "vi";
        var _glDeleteQueries = (n, ids) => { for (var i = 0; i < n; i++) {
            var id = HEAP32[ids + i * 4 >> 2];
            var query = GL.queries[id];
            if (!query)
                continue;
            GLctx.deleteQuery(query);
            GL.queries[id] = null;
        } };
        _glDeleteQueries.sig = "vip";
        var _emscripten_glDeleteQueries = _glDeleteQueries;
        _emscripten_glDeleteQueries.sig = "vip";
        var _glDeleteQueriesEXT = (n, ids) => { for (var i = 0; i < n; i++) {
            var id = HEAP32[ids + i * 4 >> 2];
            var query = GL.queries[id];
            if (!query)
                continue;
            GLctx.disjointTimerQueryExt["deleteQueryEXT"](query);
            GL.queries[id] = null;
        } };
        _glDeleteQueriesEXT.sig = "vip";
        var _emscripten_glDeleteQueriesEXT = _glDeleteQueriesEXT;
        var _glDeleteRenderbuffers = (n, renderbuffers) => { for (var i = 0; i < n; i++) {
            var id = HEAP32[renderbuffers + i * 4 >> 2];
            var renderbuffer = GL.renderbuffers[id];
            if (!renderbuffer)
                continue;
            GLctx.deleteRenderbuffer(renderbuffer);
            renderbuffer.name = 0;
            GL.renderbuffers[id] = null;
        } };
        _glDeleteRenderbuffers.sig = "vip";
        var _emscripten_glDeleteRenderbuffers = _glDeleteRenderbuffers;
        _emscripten_glDeleteRenderbuffers.sig = "vip";
        var _glDeleteSamplers = (n, samplers) => { for (var i = 0; i < n; i++) {
            var id = HEAP32[samplers + i * 4 >> 2];
            var sampler = GL.samplers[id];
            if (!sampler)
                continue;
            GLctx.deleteSampler(sampler);
            sampler.name = 0;
            GL.samplers[id] = null;
        } };
        _glDeleteSamplers.sig = "vip";
        var _emscripten_glDeleteSamplers = _glDeleteSamplers;
        _emscripten_glDeleteSamplers.sig = "vip";
        var _glDeleteShader = id => { if (!id)
            return; var shader = GL.shaders[id]; if (!shader) {
            GL.recordError(1281);
            return;
        } GLctx.deleteShader(shader); GL.shaders[id] = null; };
        _glDeleteShader.sig = "vi";
        var _emscripten_glDeleteShader = _glDeleteShader;
        _emscripten_glDeleteShader.sig = "vi";
        var _glDeleteSync = id => { if (!id)
            return; var sync = GL.syncs[id]; if (!sync) {
            GL.recordError(1281);
            return;
        } GLctx.deleteSync(sync); sync.name = 0; GL.syncs[id] = null; };
        _glDeleteSync.sig = "vp";
        var _emscripten_glDeleteSync = _glDeleteSync;
        _emscripten_glDeleteSync.sig = "vp";
        var _glDeleteTextures = (n, textures) => { for (var i = 0; i < n; i++) {
            var id = HEAP32[textures + i * 4 >> 2];
            var texture = GL.textures[id];
            if (!texture)
                continue;
            GLctx.deleteTexture(texture);
            texture.name = 0;
            GL.textures[id] = null;
        } };
        _glDeleteTextures.sig = "vip";
        var _emscripten_glDeleteTextures = _glDeleteTextures;
        _emscripten_glDeleteTextures.sig = "vip";
        var _glDeleteTransformFeedbacks = (n, ids) => { for (var i = 0; i < n; i++) {
            var id = HEAP32[ids + i * 4 >> 2];
            var transformFeedback = GL.transformFeedbacks[id];
            if (!transformFeedback)
                continue;
            GLctx.deleteTransformFeedback(transformFeedback);
            transformFeedback.name = 0;
            GL.transformFeedbacks[id] = null;
        } };
        _glDeleteTransformFeedbacks.sig = "vip";
        var _emscripten_glDeleteTransformFeedbacks = _glDeleteTransformFeedbacks;
        _emscripten_glDeleteTransformFeedbacks.sig = "vip";
        var _glDeleteVertexArrays = (n, vaos) => { for (var i = 0; i < n; i++) {
            var id = HEAP32[vaos + i * 4 >> 2];
            GLctx.deleteVertexArray(GL.vaos[id]);
            GL.vaos[id] = null;
        } };
        _glDeleteVertexArrays.sig = "vip";
        var _emscripten_glDeleteVertexArrays = _glDeleteVertexArrays;
        _emscripten_glDeleteVertexArrays.sig = "vip";
        var _glDeleteVertexArraysOES = _glDeleteVertexArrays;
        _glDeleteVertexArraysOES.sig = "vip";
        var _emscripten_glDeleteVertexArraysOES = _glDeleteVertexArraysOES;
        _emscripten_glDeleteVertexArraysOES.sig = "vip";
        var _glDepthFunc = x0 => GLctx.depthFunc(x0);
        _glDepthFunc.sig = "vi";
        var _emscripten_glDepthFunc = _glDepthFunc;
        _emscripten_glDepthFunc.sig = "vi";
        var _glDepthMask = flag => { GLctx.depthMask(!!flag); };
        _glDepthMask.sig = "vi";
        var _emscripten_glDepthMask = _glDepthMask;
        _emscripten_glDepthMask.sig = "vi";
        var _glDepthRangef = (x0, x1) => GLctx.depthRange(x0, x1);
        _glDepthRangef.sig = "vff";
        var _emscripten_glDepthRangef = _glDepthRangef;
        _emscripten_glDepthRangef.sig = "vff";
        var _glDetachShader = (program, shader) => { GLctx.detachShader(GL.programs[program], GL.shaders[shader]); };
        _glDetachShader.sig = "vii";
        var _emscripten_glDetachShader = _glDetachShader;
        _emscripten_glDetachShader.sig = "vii";
        var _glDisable = x0 => GLctx.disable(x0);
        _glDisable.sig = "vi";
        var _emscripten_glDisable = _glDisable;
        _emscripten_glDisable.sig = "vi";
        var _glDisableVertexAttribArray = index => { var cb = GL.currentContext.clientBuffers[index]; cb.enabled = false; GLctx.disableVertexAttribArray(index); };
        _glDisableVertexAttribArray.sig = "vi";
        var _emscripten_glDisableVertexAttribArray = _glDisableVertexAttribArray;
        _emscripten_glDisableVertexAttribArray.sig = "vi";
        var _glDrawArrays = (mode, first, count) => { GL.preDrawHandleClientVertexAttribBindings(first + count); GLctx.drawArrays(mode, first, count); GL.postDrawHandleClientVertexAttribBindings(); };
        _glDrawArrays.sig = "viii";
        var _emscripten_glDrawArrays = _glDrawArrays;
        _emscripten_glDrawArrays.sig = "viii";
        var _glDrawArraysInstanced = (mode, first, count, primcount) => { GLctx.drawArraysInstanced(mode, first, count, primcount); };
        _glDrawArraysInstanced.sig = "viiii";
        var _emscripten_glDrawArraysInstanced = _glDrawArraysInstanced;
        _emscripten_glDrawArraysInstanced.sig = "viiii";
        var _glDrawArraysInstancedANGLE = _glDrawArraysInstanced;
        var _emscripten_glDrawArraysInstancedANGLE = _glDrawArraysInstancedANGLE;
        var _glDrawArraysInstancedARB = _glDrawArraysInstanced;
        var _emscripten_glDrawArraysInstancedARB = _glDrawArraysInstancedARB;
        var _glDrawArraysInstancedEXT = _glDrawArraysInstanced;
        var _emscripten_glDrawArraysInstancedEXT = _glDrawArraysInstancedEXT;
        var _glDrawArraysInstancedNV = _glDrawArraysInstanced;
        var _emscripten_glDrawArraysInstancedNV = _glDrawArraysInstancedNV;
        var tempFixedLengthArray = [];
        var _glDrawBuffers = (n, bufs) => { var bufArray = tempFixedLengthArray[n]; for (var i = 0; i < n; i++) {
            bufArray[i] = HEAP32[bufs + i * 4 >> 2];
        } GLctx.drawBuffers(bufArray); };
        _glDrawBuffers.sig = "vip";
        var _emscripten_glDrawBuffers = _glDrawBuffers;
        _emscripten_glDrawBuffers.sig = "vip";
        var _glDrawBuffersEXT = _glDrawBuffers;
        var _emscripten_glDrawBuffersEXT = _glDrawBuffersEXT;
        var _glDrawBuffersWEBGL = _glDrawBuffers;
        var _emscripten_glDrawBuffersWEBGL = _glDrawBuffersWEBGL;
        var _glDrawElements = (mode, count, type, indices) => { var buf; var vertexes = 0; if (!GLctx.currentElementArrayBufferBinding) {
            var size = GL.calcBufLength(1, type, 0, count);
            buf = GL.getTempIndexBuffer(size);
            GLctx.bindBuffer(34963, buf);
            GLctx.bufferSubData(34963, 0, HEAPU8.subarray(indices, indices + size));
            if (count > 0) {
                for (var i = 0; i < GL.currentContext.maxVertexAttribs; ++i) {
                    var cb = GL.currentContext.clientBuffers[i];
                    if (cb.clientside && cb.enabled) {
                        let arrayClass;
                        switch (type) {
                            case 5121:
                                arrayClass = Uint8Array;
                                break;
                            case 5123:
                                arrayClass = Uint16Array;
                                break;
                            case 5125:
                                arrayClass = Uint32Array;
                                break;
                            default:
                                GL.recordError(1282);
                                return;
                        }
                        vertexes = new arrayClass(HEAPU8.buffer, indices, count).reduce((max, current) => Math.max(max, current)) + 1;
                        break;
                    }
                }
            }
            indices = 0;
        } GL.preDrawHandleClientVertexAttribBindings(vertexes); GLctx.drawElements(mode, count, type, indices); GL.postDrawHandleClientVertexAttribBindings(count); if (!GLctx.currentElementArrayBufferBinding) {
            GLctx.bindBuffer(34963, null);
        } };
        _glDrawElements.sig = "viiip";
        var _emscripten_glDrawElements = _glDrawElements;
        _emscripten_glDrawElements.sig = "viiip";
        var _glDrawElementsInstanced = (mode, count, type, indices, primcount) => { GLctx.drawElementsInstanced(mode, count, type, indices, primcount); };
        _glDrawElementsInstanced.sig = "viiipi";
        var _emscripten_glDrawElementsInstanced = _glDrawElementsInstanced;
        _emscripten_glDrawElementsInstanced.sig = "viiipi";
        var _glDrawElementsInstancedANGLE = _glDrawElementsInstanced;
        var _emscripten_glDrawElementsInstancedANGLE = _glDrawElementsInstancedANGLE;
        var _glDrawElementsInstancedARB = _glDrawElementsInstanced;
        var _emscripten_glDrawElementsInstancedARB = _glDrawElementsInstancedARB;
        var _glDrawElementsInstancedEXT = _glDrawElementsInstanced;
        var _emscripten_glDrawElementsInstancedEXT = _glDrawElementsInstancedEXT;
        var _glDrawElementsInstancedNV = _glDrawElementsInstanced;
        var _emscripten_glDrawElementsInstancedNV = _glDrawElementsInstancedNV;
        var _glDrawRangeElements = (mode, start, end, count, type, indices) => { _glDrawElements(mode, count, type, indices); };
        _glDrawRangeElements.sig = "viiiiip";
        var _emscripten_glDrawRangeElements = _glDrawRangeElements;
        _emscripten_glDrawRangeElements.sig = "viiiiip";
        var _glEnable = x0 => GLctx.enable(x0);
        _glEnable.sig = "vi";
        var _emscripten_glEnable = _glEnable;
        _emscripten_glEnable.sig = "vi";
        var _glEnableVertexAttribArray = index => { var cb = GL.currentContext.clientBuffers[index]; cb.enabled = true; GLctx.enableVertexAttribArray(index); };
        _glEnableVertexAttribArray.sig = "vi";
        var _emscripten_glEnableVertexAttribArray = _glEnableVertexAttribArray;
        _emscripten_glEnableVertexAttribArray.sig = "vi";
        var _glEndQuery = x0 => GLctx.endQuery(x0);
        _glEndQuery.sig = "vi";
        var _emscripten_glEndQuery = _glEndQuery;
        _emscripten_glEndQuery.sig = "vi";
        var _glEndQueryEXT = target => { GLctx.disjointTimerQueryExt["endQueryEXT"](target); };
        _glEndQueryEXT.sig = "vi";
        var _emscripten_glEndQueryEXT = _glEndQueryEXT;
        var _glEndTransformFeedback = () => GLctx.endTransformFeedback();
        _glEndTransformFeedback.sig = "v";
        var _emscripten_glEndTransformFeedback = _glEndTransformFeedback;
        _emscripten_glEndTransformFeedback.sig = "v";
        var _glFenceSync = (condition, flags) => { var sync = GLctx.fenceSync(condition, flags); if (sync) {
            var id = GL.getNewId(GL.syncs);
            sync.name = id;
            GL.syncs[id] = sync;
            return id;
        } return 0; };
        _glFenceSync.sig = "pii";
        var _emscripten_glFenceSync = _glFenceSync;
        _emscripten_glFenceSync.sig = "pii";
        var _glFinish = () => GLctx.finish();
        _glFinish.sig = "v";
        var _emscripten_glFinish = _glFinish;
        _emscripten_glFinish.sig = "v";
        var _glFlush = () => GLctx.flush();
        _glFlush.sig = "v";
        var _emscripten_glFlush = _glFlush;
        _emscripten_glFlush.sig = "v";
        var emscriptenWebGLGetBufferBinding = target => { switch (target) {
            case 34962:
                target = 34964;
                break;
            case 34963:
                target = 34965;
                break;
            case 35051:
                target = 35053;
                break;
            case 35052:
                target = 35055;
                break;
            case 35982:
                target = 35983;
                break;
            case 36662:
                target = 36662;
                break;
            case 36663:
                target = 36663;
                break;
            case 35345:
                target = 35368;
                break;
        } var buffer = GLctx.getParameter(target); if (buffer)
            return buffer.name | 0;
        else
            return 0; };
        var emscriptenWebGLValidateMapBufferTarget = target => { switch (target) {
            case 34962:
            case 34963:
            case 36662:
            case 36663:
            case 35051:
            case 35052:
            case 35882:
            case 35982:
            case 35345: return true;
            default: return false;
        } };
        var _glFlushMappedBufferRange = (target, offset, length) => { if (!emscriptenWebGLValidateMapBufferTarget(target)) {
            GL.recordError(1280);
            err("GL_INVALID_ENUM in glFlushMappedBufferRange");
            return;
        } var mapping = GL.mappedBuffers[emscriptenWebGLGetBufferBinding(target)]; if (!mapping) {
            GL.recordError(1282);
            err("buffer was never mapped in glFlushMappedBufferRange");
            return;
        } if (!(mapping.access & 16)) {
            GL.recordError(1282);
            err("buffer was not mapped with GL_MAP_FLUSH_EXPLICIT_BIT in glFlushMappedBufferRange");
            return;
        } if (offset < 0 || length < 0 || offset + length > mapping.length) {
            GL.recordError(1281);
            err("invalid range in glFlushMappedBufferRange");
            return;
        } GLctx.bufferSubData(target, mapping.offset, HEAPU8.subarray(mapping.mem + offset, mapping.mem + offset + length)); };
        _glFlushMappedBufferRange.sig = "vipp";
        var _emscripten_glFlushMappedBufferRange = _glFlushMappedBufferRange;
        _emscripten_glFlushMappedBufferRange.sig = "vipp";
        var _glFramebufferRenderbuffer = (target, attachment, renderbuffertarget, renderbuffer) => { GLctx.framebufferRenderbuffer(target, attachment, renderbuffertarget, GL.renderbuffers[renderbuffer]); };
        _glFramebufferRenderbuffer.sig = "viiii";
        var _emscripten_glFramebufferRenderbuffer = _glFramebufferRenderbuffer;
        _emscripten_glFramebufferRenderbuffer.sig = "viiii";
        var _glFramebufferTexture2D = (target, attachment, textarget, texture, level) => { GLctx.framebufferTexture2D(target, attachment, textarget, GL.textures[texture], level); };
        _glFramebufferTexture2D.sig = "viiiii";
        var _emscripten_glFramebufferTexture2D = _glFramebufferTexture2D;
        _emscripten_glFramebufferTexture2D.sig = "viiiii";
        var _glFramebufferTextureLayer = (target, attachment, texture, level, layer) => { GLctx.framebufferTextureLayer(target, attachment, GL.textures[texture], level, layer); };
        _glFramebufferTextureLayer.sig = "viiiii";
        var _emscripten_glFramebufferTextureLayer = _glFramebufferTextureLayer;
        _emscripten_glFramebufferTextureLayer.sig = "viiiii";
        var _glFrontFace = x0 => GLctx.frontFace(x0);
        _glFrontFace.sig = "vi";
        var _emscripten_glFrontFace = _glFrontFace;
        _emscripten_glFrontFace.sig = "vi";
        var _glGenBuffers = (n, buffers) => { GL.genObject(n, buffers, "createBuffer", GL.buffers); };
        _glGenBuffers.sig = "vip";
        var _emscripten_glGenBuffers = _glGenBuffers;
        _emscripten_glGenBuffers.sig = "vip";
        var _glGenFramebuffers = (n, ids) => { GL.genObject(n, ids, "createFramebuffer", GL.framebuffers); };
        _glGenFramebuffers.sig = "vip";
        var _emscripten_glGenFramebuffers = _glGenFramebuffers;
        _emscripten_glGenFramebuffers.sig = "vip";
        var _glGenQueries = (n, ids) => { GL.genObject(n, ids, "createQuery", GL.queries); };
        _glGenQueries.sig = "vip";
        var _emscripten_glGenQueries = _glGenQueries;
        _emscripten_glGenQueries.sig = "vip";
        var _glGenQueriesEXT = (n, ids) => { for (var i = 0; i < n; i++) {
            var query = GLctx.disjointTimerQueryExt["createQueryEXT"]();
            if (!query) {
                GL.recordError(1282);
                while (i < n)
                    HEAP32[ids + i++ * 4 >> 2] = 0;
                return;
            }
            var id = GL.getNewId(GL.queries);
            query.name = id;
            GL.queries[id] = query;
            HEAP32[ids + i * 4 >> 2] = id;
        } };
        _glGenQueriesEXT.sig = "vip";
        var _emscripten_glGenQueriesEXT = _glGenQueriesEXT;
        var _glGenRenderbuffers = (n, renderbuffers) => { GL.genObject(n, renderbuffers, "createRenderbuffer", GL.renderbuffers); };
        _glGenRenderbuffers.sig = "vip";
        var _emscripten_glGenRenderbuffers = _glGenRenderbuffers;
        _emscripten_glGenRenderbuffers.sig = "vip";
        var _glGenSamplers = (n, samplers) => { GL.genObject(n, samplers, "createSampler", GL.samplers); };
        _glGenSamplers.sig = "vip";
        var _emscripten_glGenSamplers = _glGenSamplers;
        _emscripten_glGenSamplers.sig = "vip";
        var _glGenTextures = (n, textures) => { GL.genObject(n, textures, "createTexture", GL.textures); };
        _glGenTextures.sig = "vip";
        var _emscripten_glGenTextures = _glGenTextures;
        _emscripten_glGenTextures.sig = "vip";
        var _glGenTransformFeedbacks = (n, ids) => { GL.genObject(n, ids, "createTransformFeedback", GL.transformFeedbacks); };
        _glGenTransformFeedbacks.sig = "vip";
        var _emscripten_glGenTransformFeedbacks = _glGenTransformFeedbacks;
        _emscripten_glGenTransformFeedbacks.sig = "vip";
        var _glGenVertexArrays = (n, arrays) => { GL.genObject(n, arrays, "createVertexArray", GL.vaos); };
        _glGenVertexArrays.sig = "vip";
        var _emscripten_glGenVertexArrays = _glGenVertexArrays;
        _emscripten_glGenVertexArrays.sig = "vip";
        var _glGenVertexArraysOES = _glGenVertexArrays;
        _glGenVertexArraysOES.sig = "vip";
        var _emscripten_glGenVertexArraysOES = _glGenVertexArraysOES;
        _emscripten_glGenVertexArraysOES.sig = "vip";
        var _glGenerateMipmap = x0 => GLctx.generateMipmap(x0);
        _glGenerateMipmap.sig = "vi";
        var _emscripten_glGenerateMipmap = _glGenerateMipmap;
        _emscripten_glGenerateMipmap.sig = "vi";
        var __glGetActiveAttribOrUniform = (funcName, program, index, bufSize, length, size, type, name) => { program = GL.programs[program]; var info = GLctx[funcName](program, index); if (info) {
            var numBytesWrittenExclNull = name && stringToUTF8(info.name, name, bufSize);
            if (length)
                HEAP32[length >> 2] = numBytesWrittenExclNull;
            if (size)
                HEAP32[size >> 2] = info.size;
            if (type)
                HEAP32[type >> 2] = info.type;
        } };
        var _glGetActiveAttrib = (program, index, bufSize, length, size, type, name) => __glGetActiveAttribOrUniform("getActiveAttrib", program, index, bufSize, length, size, type, name);
        _glGetActiveAttrib.sig = "viiipppp";
        var _emscripten_glGetActiveAttrib = _glGetActiveAttrib;
        _emscripten_glGetActiveAttrib.sig = "viiipppp";
        var _glGetActiveUniform = (program, index, bufSize, length, size, type, name) => __glGetActiveAttribOrUniform("getActiveUniform", program, index, bufSize, length, size, type, name);
        _glGetActiveUniform.sig = "viiipppp";
        var _emscripten_glGetActiveUniform = _glGetActiveUniform;
        _emscripten_glGetActiveUniform.sig = "viiipppp";
        var _glGetActiveUniformBlockName = (program, uniformBlockIndex, bufSize, length, uniformBlockName) => { program = GL.programs[program]; var result = GLctx.getActiveUniformBlockName(program, uniformBlockIndex); if (!result)
            return; if (uniformBlockName && bufSize > 0) {
            var numBytesWrittenExclNull = stringToUTF8(result, uniformBlockName, bufSize);
            if (length)
                HEAP32[length >> 2] = numBytesWrittenExclNull;
        }
        else {
            if (length)
                HEAP32[length >> 2] = 0;
        } };
        _glGetActiveUniformBlockName.sig = "viiipp";
        var _emscripten_glGetActiveUniformBlockName = _glGetActiveUniformBlockName;
        _emscripten_glGetActiveUniformBlockName.sig = "viiipp";
        var _glGetActiveUniformBlockiv = (program, uniformBlockIndex, pname, params) => { if (!params) {
            GL.recordError(1281);
            return;
        } program = GL.programs[program]; if (pname == 35393) {
            var name = GLctx.getActiveUniformBlockName(program, uniformBlockIndex);
            HEAP32[params >> 2] = name.length + 1;
            return;
        } var result = GLctx.getActiveUniformBlockParameter(program, uniformBlockIndex, pname); if (result === null)
            return; if (pname == 35395) {
            for (var i = 0; i < result.length; i++) {
                HEAP32[params + i * 4 >> 2] = result[i];
            }
        }
        else {
            HEAP32[params >> 2] = result;
        } };
        _glGetActiveUniformBlockiv.sig = "viiip";
        var _emscripten_glGetActiveUniformBlockiv = _glGetActiveUniformBlockiv;
        _emscripten_glGetActiveUniformBlockiv.sig = "viiip";
        var _glGetActiveUniformsiv = (program, uniformCount, uniformIndices, pname, params) => { if (!params) {
            GL.recordError(1281);
            return;
        } if (uniformCount > 0 && uniformIndices == 0) {
            GL.recordError(1281);
            return;
        } program = GL.programs[program]; var ids = []; for (var i = 0; i < uniformCount; i++) {
            ids.push(HEAP32[uniformIndices + i * 4 >> 2]);
        } var result = GLctx.getActiveUniforms(program, ids, pname); if (!result)
            return; var len = result.length; for (var i = 0; i < len; i++) {
            HEAP32[params + i * 4 >> 2] = result[i];
        } };
        _glGetActiveUniformsiv.sig = "viipip";
        var _emscripten_glGetActiveUniformsiv = _glGetActiveUniformsiv;
        _emscripten_glGetActiveUniformsiv.sig = "viipip";
        var _glGetAttachedShaders = (program, maxCount, count, shaders) => { var result = GLctx.getAttachedShaders(GL.programs[program]); var len = result.length; if (len > maxCount) {
            len = maxCount;
        } HEAP32[count >> 2] = len; for (var i = 0; i < len; ++i) {
            var id = GL.shaders.indexOf(result[i]);
            HEAP32[shaders + i * 4 >> 2] = id;
        } };
        _glGetAttachedShaders.sig = "viipp";
        var _emscripten_glGetAttachedShaders = _glGetAttachedShaders;
        _emscripten_glGetAttachedShaders.sig = "viipp";
        var _glGetAttribLocation = (program, name) => GLctx.getAttribLocation(GL.programs[program], UTF8ToString(name));
        _glGetAttribLocation.sig = "iip";
        var _emscripten_glGetAttribLocation = _glGetAttribLocation;
        _emscripten_glGetAttribLocation.sig = "iip";
        var writeI53ToI64 = (ptr, num) => { HEAPU32[ptr >> 2] = num; var lower = HEAPU32[ptr >> 2]; HEAPU32[ptr + 4 >> 2] = (num - lower) / 4294967296; };
        var webglGetExtensions = () => { var exts = getEmscriptenSupportedExtensions(GLctx); exts = exts.concat(exts.map(e => "GL_" + e)); return exts; };
        var emscriptenWebGLGet = (name_, p, type) => { if (!p) {
            GL.recordError(1281);
            return;
        } var ret = undefined; switch (name_) {
            case 36346:
                ret = 1;
                break;
            case 36344:
                if (type != 0 && type != 1) {
                    GL.recordError(1280);
                }
                return;
            case 34814:
            case 36345:
                ret = 0;
                break;
            case 34466:
                var formats = GLctx.getParameter(34467);
                ret = formats ? formats.length : 0;
                break;
            case 33309:
                if (GL.currentContext.version < 2) {
                    GL.recordError(1282);
                    return;
                }
                ret = webglGetExtensions().length;
                break;
            case 33307:
            case 33308:
                if (GL.currentContext.version < 2) {
                    GL.recordError(1280);
                    return;
                }
                ret = name_ == 33307 ? 3 : 0;
                break;
        } if (ret === undefined) {
            var result = GLctx.getParameter(name_);
            switch (typeof result) {
                case "number":
                    ret = result;
                    break;
                case "boolean":
                    ret = result ? 1 : 0;
                    break;
                case "string":
                    GL.recordError(1280);
                    return;
                case "object":
                    if (result === null) {
                        switch (name_) {
                            case 34964:
                            case 35725:
                            case 34965:
                            case 36006:
                            case 36007:
                            case 32873:
                            case 34229:
                            case 36662:
                            case 36663:
                            case 35053:
                            case 35055:
                            case 36010:
                            case 35097:
                            case 35869:
                            case 32874:
                            case 36389:
                            case 35983:
                            case 35368:
                            case 34068: {
                                ret = 0;
                                break;
                            }
                            default: {
                                GL.recordError(1280);
                                return;
                            }
                        }
                    }
                    else if (result instanceof Float32Array || result instanceof Uint32Array || result instanceof Int32Array || result instanceof Array) {
                        for (var i = 0; i < result.length; ++i) {
                            switch (type) {
                                case 0:
                                    HEAP32[p + i * 4 >> 2] = result[i];
                                    break;
                                case 2:
                                    HEAPF32[p + i * 4 >> 2] = result[i];
                                    break;
                                case 4:
                                    HEAP8[p + i] = result[i] ? 1 : 0;
                                    break;
                            }
                        }
                        return;
                    }
                    else {
                        try {
                            ret = result.name | 0;
                        }
                        catch (e) {
                            GL.recordError(1280);
                            err(`GL_INVALID_ENUM in glGet${type}v: Unknown object returned from WebGL getParameter(${name_})! (error: ${e})`);
                            return;
                        }
                    }
                    break;
                default:
                    GL.recordError(1280);
                    err(`GL_INVALID_ENUM in glGet${type}v: Native code calling glGet${type}v(${name_}) and it returns ${result} of type ${typeof result}!`);
                    return;
            }
        } switch (type) {
            case 1:
                writeI53ToI64(p, ret);
                break;
            case 0:
                HEAP32[p >> 2] = ret;
                break;
            case 2:
                HEAPF32[p >> 2] = ret;
                break;
            case 4:
                HEAP8[p] = ret ? 1 : 0;
                break;
        } };
        var _glGetBooleanv = (name_, p) => emscriptenWebGLGet(name_, p, 4);
        _glGetBooleanv.sig = "vip";
        var _emscripten_glGetBooleanv = _glGetBooleanv;
        _emscripten_glGetBooleanv.sig = "vip";
        var _glGetBufferParameteri64v = (target, value, data) => { if (!data) {
            GL.recordError(1281);
            return;
        } writeI53ToI64(data, GLctx.getBufferParameter(target, value)); };
        _glGetBufferParameteri64v.sig = "viip";
        var _emscripten_glGetBufferParameteri64v = _glGetBufferParameteri64v;
        _emscripten_glGetBufferParameteri64v.sig = "viip";
        var _glGetBufferParameteriv = (target, value, data) => { if (!data) {
            GL.recordError(1281);
            return;
        } HEAP32[data >> 2] = GLctx.getBufferParameter(target, value); };
        _glGetBufferParameteriv.sig = "viip";
        var _emscripten_glGetBufferParameteriv = _glGetBufferParameteriv;
        _emscripten_glGetBufferParameteriv.sig = "viip";
        var _glGetBufferPointerv = (target, pname, params) => { if (pname == 35005) {
            var ptr = 0;
            var mappedBuffer = GL.mappedBuffers[emscriptenWebGLGetBufferBinding(target)];
            if (mappedBuffer) {
                ptr = mappedBuffer.mem;
            }
            HEAP32[params >> 2] = ptr;
        }
        else {
            GL.recordError(1280);
            err("GL_INVALID_ENUM in glGetBufferPointerv");
        } };
        _glGetBufferPointerv.sig = "viip";
        var _emscripten_glGetBufferPointerv = _glGetBufferPointerv;
        _emscripten_glGetBufferPointerv.sig = "viip";
        var _glGetError = () => { var error = GLctx.getError() || GL.lastError; GL.lastError = 0; return error; };
        _glGetError.sig = "i";
        var _emscripten_glGetError = _glGetError;
        _emscripten_glGetError.sig = "i";
        var _glGetFloatv = (name_, p) => emscriptenWebGLGet(name_, p, 2);
        _glGetFloatv.sig = "vip";
        var _emscripten_glGetFloatv = _glGetFloatv;
        _emscripten_glGetFloatv.sig = "vip";
        var _glGetFragDataLocation = (program, name) => GLctx.getFragDataLocation(GL.programs[program], UTF8ToString(name));
        _glGetFragDataLocation.sig = "iip";
        var _emscripten_glGetFragDataLocation = _glGetFragDataLocation;
        _emscripten_glGetFragDataLocation.sig = "iip";
        var _glGetFramebufferAttachmentParameteriv = (target, attachment, pname, params) => { var result = GLctx.getFramebufferAttachmentParameter(target, attachment, pname); if (result instanceof WebGLRenderbuffer || result instanceof WebGLTexture) {
            result = result.name | 0;
        } HEAP32[params >> 2] = result; };
        _glGetFramebufferAttachmentParameteriv.sig = "viiip";
        var _emscripten_glGetFramebufferAttachmentParameteriv = _glGetFramebufferAttachmentParameteriv;
        _emscripten_glGetFramebufferAttachmentParameteriv.sig = "viiip";
        var emscriptenWebGLGetIndexed = (target, index, data, type) => { if (!data) {
            GL.recordError(1281);
            return;
        } var result = GLctx.getIndexedParameter(target, index); var ret; switch (typeof result) {
            case "boolean":
                ret = result ? 1 : 0;
                break;
            case "number":
                ret = result;
                break;
            case "object":
                if (result === null) {
                    switch (target) {
                        case 35983:
                        case 35368:
                            ret = 0;
                            break;
                        default: {
                            GL.recordError(1280);
                            return;
                        }
                    }
                }
                else if (result instanceof WebGLBuffer) {
                    ret = result.name | 0;
                }
                else {
                    GL.recordError(1280);
                    return;
                }
                break;
            default:
                GL.recordError(1280);
                return;
        } switch (type) {
            case 1:
                writeI53ToI64(data, ret);
                break;
            case 0:
                HEAP32[data >> 2] = ret;
                break;
            case 2:
                HEAPF32[data >> 2] = ret;
                break;
            case 4:
                HEAP8[data] = ret ? 1 : 0;
                break;
            default: throw "internal emscriptenWebGLGetIndexed() error, bad type: " + type;
        } };
        var _glGetInteger64i_v = (target, index, data) => emscriptenWebGLGetIndexed(target, index, data, 1);
        _glGetInteger64i_v.sig = "viip";
        var _emscripten_glGetInteger64i_v = _glGetInteger64i_v;
        _emscripten_glGetInteger64i_v.sig = "viip";
        var _glGetInteger64v = (name_, p) => { emscriptenWebGLGet(name_, p, 1); };
        _glGetInteger64v.sig = "vip";
        var _emscripten_glGetInteger64v = _glGetInteger64v;
        _emscripten_glGetInteger64v.sig = "vip";
        var _glGetIntegeri_v = (target, index, data) => emscriptenWebGLGetIndexed(target, index, data, 0);
        _glGetIntegeri_v.sig = "viip";
        var _emscripten_glGetIntegeri_v = _glGetIntegeri_v;
        _emscripten_glGetIntegeri_v.sig = "viip";
        var _glGetIntegerv = (name_, p) => emscriptenWebGLGet(name_, p, 0);
        _glGetIntegerv.sig = "vip";
        var _emscripten_glGetIntegerv = _glGetIntegerv;
        _emscripten_glGetIntegerv.sig = "vip";
        var _glGetInternalformativ = (target, internalformat, pname, bufSize, params) => { if (bufSize < 0) {
            GL.recordError(1281);
            return;
        } if (!params) {
            GL.recordError(1281);
            return;
        } var ret = GLctx.getInternalformatParameter(target, internalformat, pname); if (ret === null)
            return; for (var i = 0; i < ret.length && i < bufSize; ++i) {
            HEAP32[params + i * 4 >> 2] = ret[i];
        } };
        _glGetInternalformativ.sig = "viiiip";
        var _emscripten_glGetInternalformativ = _glGetInternalformativ;
        _emscripten_glGetInternalformativ.sig = "viiiip";
        var _glGetProgramBinary = (program, bufSize, length, binaryFormat, binary) => { GL.recordError(1282); };
        _glGetProgramBinary.sig = "viippp";
        var _emscripten_glGetProgramBinary = _glGetProgramBinary;
        _emscripten_glGetProgramBinary.sig = "viippp";
        var _glGetProgramInfoLog = (program, maxLength, length, infoLog) => { var log = GLctx.getProgramInfoLog(GL.programs[program]); if (log === null)
            log = "(unknown error)"; var numBytesWrittenExclNull = maxLength > 0 && infoLog ? stringToUTF8(log, infoLog, maxLength) : 0; if (length)
            HEAP32[length >> 2] = numBytesWrittenExclNull; };
        _glGetProgramInfoLog.sig = "viipp";
        var _emscripten_glGetProgramInfoLog = _glGetProgramInfoLog;
        _emscripten_glGetProgramInfoLog.sig = "viipp";
        var _glGetProgramiv = (program, pname, p) => { if (!p) {
            GL.recordError(1281);
            return;
        } if (program >= GL.counter) {
            GL.recordError(1281);
            return;
        } program = GL.programs[program]; if (pname == 35716) {
            var log = GLctx.getProgramInfoLog(program);
            if (log === null)
                log = "(unknown error)";
            HEAP32[p >> 2] = log.length + 1;
        }
        else if (pname == 35719) {
            if (!program.maxUniformLength) {
                var numActiveUniforms = GLctx.getProgramParameter(program, 35718);
                for (var i = 0; i < numActiveUniforms; ++i) {
                    program.maxUniformLength = Math.max(program.maxUniformLength, GLctx.getActiveUniform(program, i).name.length + 1);
                }
            }
            HEAP32[p >> 2] = program.maxUniformLength;
        }
        else if (pname == 35722) {
            if (!program.maxAttributeLength) {
                var numActiveAttributes = GLctx.getProgramParameter(program, 35721);
                for (var i = 0; i < numActiveAttributes; ++i) {
                    program.maxAttributeLength = Math.max(program.maxAttributeLength, GLctx.getActiveAttrib(program, i).name.length + 1);
                }
            }
            HEAP32[p >> 2] = program.maxAttributeLength;
        }
        else if (pname == 35381) {
            if (!program.maxUniformBlockNameLength) {
                var numActiveUniformBlocks = GLctx.getProgramParameter(program, 35382);
                for (var i = 0; i < numActiveUniformBlocks; ++i) {
                    program.maxUniformBlockNameLength = Math.max(program.maxUniformBlockNameLength, GLctx.getActiveUniformBlockName(program, i).length + 1);
                }
            }
            HEAP32[p >> 2] = program.maxUniformBlockNameLength;
        }
        else {
            HEAP32[p >> 2] = GLctx.getProgramParameter(program, pname);
        } };
        _glGetProgramiv.sig = "viip";
        var _emscripten_glGetProgramiv = _glGetProgramiv;
        _emscripten_glGetProgramiv.sig = "viip";
        var _glGetQueryObjecti64vEXT = (id, pname, params) => { if (!params) {
            GL.recordError(1281);
            return;
        } var query = GL.queries[id]; var param; if (GL.currentContext.version < 2) {
            param = GLctx.disjointTimerQueryExt["getQueryObjectEXT"](query, pname);
        }
        else {
            param = GLctx.getQueryParameter(query, pname);
        } var ret; if (typeof param == "boolean") {
            ret = param ? 1 : 0;
        }
        else {
            ret = param;
        } writeI53ToI64(params, ret); };
        _glGetQueryObjecti64vEXT.sig = "viip";
        var _emscripten_glGetQueryObjecti64vEXT = _glGetQueryObjecti64vEXT;
        var _glGetQueryObjectivEXT = (id, pname, params) => { if (!params) {
            GL.recordError(1281);
            return;
        } var query = GL.queries[id]; var param = GLctx.disjointTimerQueryExt["getQueryObjectEXT"](query, pname); var ret; if (typeof param == "boolean") {
            ret = param ? 1 : 0;
        }
        else {
            ret = param;
        } HEAP32[params >> 2] = ret; };
        _glGetQueryObjectivEXT.sig = "viip";
        var _emscripten_glGetQueryObjectivEXT = _glGetQueryObjectivEXT;
        var _glGetQueryObjectui64vEXT = _glGetQueryObjecti64vEXT;
        var _emscripten_glGetQueryObjectui64vEXT = _glGetQueryObjectui64vEXT;
        var _glGetQueryObjectuiv = (id, pname, params) => { if (!params) {
            GL.recordError(1281);
            return;
        } var query = GL.queries[id]; var param = GLctx.getQueryParameter(query, pname); var ret; if (typeof param == "boolean") {
            ret = param ? 1 : 0;
        }
        else {
            ret = param;
        } HEAP32[params >> 2] = ret; };
        _glGetQueryObjectuiv.sig = "viip";
        var _emscripten_glGetQueryObjectuiv = _glGetQueryObjectuiv;
        _emscripten_glGetQueryObjectuiv.sig = "viip";
        var _glGetQueryObjectuivEXT = _glGetQueryObjectivEXT;
        var _emscripten_glGetQueryObjectuivEXT = _glGetQueryObjectuivEXT;
        var _glGetQueryiv = (target, pname, params) => { if (!params) {
            GL.recordError(1281);
            return;
        } HEAP32[params >> 2] = GLctx.getQuery(target, pname); };
        _glGetQueryiv.sig = "viip";
        var _emscripten_glGetQueryiv = _glGetQueryiv;
        _emscripten_glGetQueryiv.sig = "viip";
        var _glGetQueryivEXT = (target, pname, params) => { if (!params) {
            GL.recordError(1281);
            return;
        } HEAP32[params >> 2] = GLctx.disjointTimerQueryExt["getQueryEXT"](target, pname); };
        _glGetQueryivEXT.sig = "viip";
        var _emscripten_glGetQueryivEXT = _glGetQueryivEXT;
        var _glGetRenderbufferParameteriv = (target, pname, params) => { if (!params) {
            GL.recordError(1281);
            return;
        } HEAP32[params >> 2] = GLctx.getRenderbufferParameter(target, pname); };
        _glGetRenderbufferParameteriv.sig = "viip";
        var _emscripten_glGetRenderbufferParameteriv = _glGetRenderbufferParameteriv;
        _emscripten_glGetRenderbufferParameteriv.sig = "viip";
        var _glGetSamplerParameterfv = (sampler, pname, params) => { if (!params) {
            GL.recordError(1281);
            return;
        } HEAPF32[params >> 2] = GLctx.getSamplerParameter(GL.samplers[sampler], pname); };
        _glGetSamplerParameterfv.sig = "viip";
        var _emscripten_glGetSamplerParameterfv = _glGetSamplerParameterfv;
        _emscripten_glGetSamplerParameterfv.sig = "viip";
        var _glGetSamplerParameteriv = (sampler, pname, params) => { if (!params) {
            GL.recordError(1281);
            return;
        } HEAP32[params >> 2] = GLctx.getSamplerParameter(GL.samplers[sampler], pname); };
        _glGetSamplerParameteriv.sig = "viip";
        var _emscripten_glGetSamplerParameteriv = _glGetSamplerParameteriv;
        _emscripten_glGetSamplerParameteriv.sig = "viip";
        var _glGetShaderInfoLog = (shader, maxLength, length, infoLog) => { var log = GLctx.getShaderInfoLog(GL.shaders[shader]); if (log === null)
            log = "(unknown error)"; var numBytesWrittenExclNull = maxLength > 0 && infoLog ? stringToUTF8(log, infoLog, maxLength) : 0; if (length)
            HEAP32[length >> 2] = numBytesWrittenExclNull; };
        _glGetShaderInfoLog.sig = "viipp";
        var _emscripten_glGetShaderInfoLog = _glGetShaderInfoLog;
        _emscripten_glGetShaderInfoLog.sig = "viipp";
        var _glGetShaderPrecisionFormat = (shaderType, precisionType, range, precision) => { var result = GLctx.getShaderPrecisionFormat(shaderType, precisionType); HEAP32[range >> 2] = result.rangeMin; HEAP32[range + 4 >> 2] = result.rangeMax; HEAP32[precision >> 2] = result.precision; };
        _glGetShaderPrecisionFormat.sig = "viipp";
        var _emscripten_glGetShaderPrecisionFormat = _glGetShaderPrecisionFormat;
        _emscripten_glGetShaderPrecisionFormat.sig = "viipp";
        var _glGetShaderSource = (shader, bufSize, length, source) => { var result = GLctx.getShaderSource(GL.shaders[shader]); if (!result)
            return; var numBytesWrittenExclNull = bufSize > 0 && source ? stringToUTF8(result, source, bufSize) : 0; if (length)
            HEAP32[length >> 2] = numBytesWrittenExclNull; };
        _glGetShaderSource.sig = "viipp";
        var _emscripten_glGetShaderSource = _glGetShaderSource;
        _emscripten_glGetShaderSource.sig = "viipp";
        var _glGetShaderiv = (shader, pname, p) => { if (!p) {
            GL.recordError(1281);
            return;
        } if (pname == 35716) {
            var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
            if (log === null)
                log = "(unknown error)";
            var logLength = log ? log.length + 1 : 0;
            HEAP32[p >> 2] = logLength;
        }
        else if (pname == 35720) {
            var source = GLctx.getShaderSource(GL.shaders[shader]);
            var sourceLength = source ? source.length + 1 : 0;
            HEAP32[p >> 2] = sourceLength;
        }
        else {
            HEAP32[p >> 2] = GLctx.getShaderParameter(GL.shaders[shader], pname);
        } };
        _glGetShaderiv.sig = "viip";
        var _emscripten_glGetShaderiv = _glGetShaderiv;
        _emscripten_glGetShaderiv.sig = "viip";
        var _glGetString = name_ => { var ret = GL.stringCache[name_]; if (!ret) {
            switch (name_) {
                case 7939:
                    ret = stringToNewUTF8(webglGetExtensions().join(" "));
                    break;
                case 7936:
                case 7937:
                case 37445:
                case 37446:
                    var s = GLctx.getParameter(name_);
                    if (!s) {
                        GL.recordError(1280);
                    }
                    ret = s ? stringToNewUTF8(s) : 0;
                    break;
                case 7938:
                    var webGLVersion = GLctx.getParameter(7938);
                    var glVersion = `OpenGL ES 2.0 (${webGLVersion})`;
                    if (true)
                        glVersion = `OpenGL ES 3.0 (${webGLVersion})`;
                    ret = stringToNewUTF8(glVersion);
                    break;
                case 35724:
                    var glslVersion = GLctx.getParameter(35724);
                    var ver_re = /^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/;
                    var ver_num = glslVersion.match(ver_re);
                    if (ver_num !== null) {
                        if (ver_num[1].length == 3)
                            ver_num[1] = ver_num[1] + "0";
                        glslVersion = `OpenGL ES GLSL ES ${ver_num[1]} (${glslVersion})`;
                    }
                    ret = stringToNewUTF8(glslVersion);
                    break;
                default: GL.recordError(1280);
            }
            GL.stringCache[name_] = ret;
        } return ret; };
        _glGetString.sig = "pi";
        var _emscripten_glGetString = _glGetString;
        _emscripten_glGetString.sig = "pi";
        var _glGetStringi = (name, index) => { if (GL.currentContext.version < 2) {
            GL.recordError(1282);
            return 0;
        } var stringiCache = GL.stringiCache[name]; if (stringiCache) {
            if (index < 0 || index >= stringiCache.length) {
                GL.recordError(1281);
                return 0;
            }
            return stringiCache[index];
        } switch (name) {
            case 7939:
                var exts = webglGetExtensions().map(stringToNewUTF8);
                stringiCache = GL.stringiCache[name] = exts;
                if (index < 0 || index >= stringiCache.length) {
                    GL.recordError(1281);
                    return 0;
                }
                return stringiCache[index];
            default:
                GL.recordError(1280);
                return 0;
        } };
        _glGetStringi.sig = "pii";
        var _emscripten_glGetStringi = _glGetStringi;
        _emscripten_glGetStringi.sig = "pii";
        var _glGetSynciv = (sync, pname, bufSize, length, values) => { if (bufSize < 0) {
            GL.recordError(1281);
            return;
        } if (!values) {
            GL.recordError(1281);
            return;
        } var ret = GLctx.getSyncParameter(GL.syncs[sync], pname); if (ret !== null) {
            HEAP32[values >> 2] = ret;
            if (length)
                HEAP32[length >> 2] = 1;
        } };
        _glGetSynciv.sig = "vpiipp";
        var _emscripten_glGetSynciv = _glGetSynciv;
        _emscripten_glGetSynciv.sig = "vpiipp";
        var _glGetTexParameterfv = (target, pname, params) => { if (!params) {
            GL.recordError(1281);
            return;
        } HEAPF32[params >> 2] = GLctx.getTexParameter(target, pname); };
        _glGetTexParameterfv.sig = "viip";
        var _emscripten_glGetTexParameterfv = _glGetTexParameterfv;
        _emscripten_glGetTexParameterfv.sig = "viip";
        var _glGetTexParameteriv = (target, pname, params) => { if (!params) {
            GL.recordError(1281);
            return;
        } HEAP32[params >> 2] = GLctx.getTexParameter(target, pname); };
        _glGetTexParameteriv.sig = "viip";
        var _emscripten_glGetTexParameteriv = _glGetTexParameteriv;
        _emscripten_glGetTexParameteriv.sig = "viip";
        var _glGetTransformFeedbackVarying = (program, index, bufSize, length, size, type, name) => { program = GL.programs[program]; var info = GLctx.getTransformFeedbackVarying(program, index); if (!info)
            return; if (name && bufSize > 0) {
            var numBytesWrittenExclNull = stringToUTF8(info.name, name, bufSize);
            if (length)
                HEAP32[length >> 2] = numBytesWrittenExclNull;
        }
        else {
            if (length)
                HEAP32[length >> 2] = 0;
        } if (size)
            HEAP32[size >> 2] = info.size; if (type)
            HEAP32[type >> 2] = info.type; };
        _glGetTransformFeedbackVarying.sig = "viiipppp";
        var _emscripten_glGetTransformFeedbackVarying = _glGetTransformFeedbackVarying;
        _emscripten_glGetTransformFeedbackVarying.sig = "viiipppp";
        var _glGetUniformBlockIndex = (program, uniformBlockName) => GLctx.getUniformBlockIndex(GL.programs[program], UTF8ToString(uniformBlockName));
        _glGetUniformBlockIndex.sig = "iip";
        var _emscripten_glGetUniformBlockIndex = _glGetUniformBlockIndex;
        _emscripten_glGetUniformBlockIndex.sig = "iip";
        var _glGetUniformIndices = (program, uniformCount, uniformNames, uniformIndices) => { if (!uniformIndices) {
            GL.recordError(1281);
            return;
        } if (uniformCount > 0 && (uniformNames == 0 || uniformIndices == 0)) {
            GL.recordError(1281);
            return;
        } program = GL.programs[program]; var names = []; for (var i = 0; i < uniformCount; i++)
            names.push(UTF8ToString(HEAP32[uniformNames + i * 4 >> 2])); var result = GLctx.getUniformIndices(program, names); if (!result)
            return; var len = result.length; for (var i = 0; i < len; i++) {
            HEAP32[uniformIndices + i * 4 >> 2] = result[i];
        } };
        _glGetUniformIndices.sig = "viipp";
        var _emscripten_glGetUniformIndices = _glGetUniformIndices;
        _emscripten_glGetUniformIndices.sig = "viipp";
        var jstoi_q = str => parseInt(str);
        var webglGetLeftBracePos = name => name.slice(-1) == "]" && name.lastIndexOf("[");
        var webglPrepareUniformLocationsBeforeFirstUse = program => { var uniformLocsById = program.uniformLocsById, uniformSizeAndIdsByName = program.uniformSizeAndIdsByName, i, j; if (!uniformLocsById) {
            program.uniformLocsById = uniformLocsById = {};
            program.uniformArrayNamesById = {};
            var numActiveUniforms = GLctx.getProgramParameter(program, 35718);
            for (i = 0; i < numActiveUniforms; ++i) {
                var u = GLctx.getActiveUniform(program, i);
                var nm = u.name;
                var sz = u.size;
                var lb = webglGetLeftBracePos(nm);
                var arrayName = lb > 0 ? nm.slice(0, lb) : nm;
                var id = program.uniformIdCounter;
                program.uniformIdCounter += sz;
                uniformSizeAndIdsByName[arrayName] = [sz, id];
                for (j = 0; j < sz; ++j) {
                    uniformLocsById[id] = j;
                    program.uniformArrayNamesById[id++] = arrayName;
                }
            }
        } };
        var _glGetUniformLocation = (program, name) => { name = UTF8ToString(name); if (program = GL.programs[program]) {
            webglPrepareUniformLocationsBeforeFirstUse(program);
            var uniformLocsById = program.uniformLocsById;
            var arrayIndex = 0;
            var uniformBaseName = name;
            var leftBrace = webglGetLeftBracePos(name);
            if (leftBrace > 0) {
                arrayIndex = jstoi_q(name.slice(leftBrace + 1)) >>> 0;
                uniformBaseName = name.slice(0, leftBrace);
            }
            var sizeAndId = program.uniformSizeAndIdsByName[uniformBaseName];
            if (sizeAndId && arrayIndex < sizeAndId[0]) {
                arrayIndex += sizeAndId[1];
                if (uniformLocsById[arrayIndex] = uniformLocsById[arrayIndex] || GLctx.getUniformLocation(program, name)) {
                    return arrayIndex;
                }
            }
        }
        else {
            GL.recordError(1281);
        } return -1; };
        _glGetUniformLocation.sig = "iip";
        var _emscripten_glGetUniformLocation = _glGetUniformLocation;
        _emscripten_glGetUniformLocation.sig = "iip";
        var webglGetUniformLocation = location => { var p = GLctx.currentProgram; if (p) {
            var webglLoc = p.uniformLocsById[location];
            if (typeof webglLoc == "number") {
                p.uniformLocsById[location] = webglLoc = GLctx.getUniformLocation(p, p.uniformArrayNamesById[location] + (webglLoc > 0 ? `[${webglLoc}]` : ""));
            }
            return webglLoc;
        }
        else {
            GL.recordError(1282);
        } };
        var emscriptenWebGLGetUniform = (program, location, params, type) => { if (!params) {
            GL.recordError(1281);
            return;
        } program = GL.programs[program]; webglPrepareUniformLocationsBeforeFirstUse(program); var data = GLctx.getUniform(program, webglGetUniformLocation(location)); if (typeof data == "number" || typeof data == "boolean") {
            switch (type) {
                case 0:
                    HEAP32[params >> 2] = data;
                    break;
                case 2:
                    HEAPF32[params >> 2] = data;
                    break;
            }
        }
        else {
            for (var i = 0; i < data.length; i++) {
                switch (type) {
                    case 0:
                        HEAP32[params + i * 4 >> 2] = data[i];
                        break;
                    case 2:
                        HEAPF32[params + i * 4 >> 2] = data[i];
                        break;
                }
            }
        } };
        var _glGetUniformfv = (program, location, params) => { emscriptenWebGLGetUniform(program, location, params, 2); };
        _glGetUniformfv.sig = "viip";
        var _emscripten_glGetUniformfv = _glGetUniformfv;
        _emscripten_glGetUniformfv.sig = "viip";
        var _glGetUniformiv = (program, location, params) => { emscriptenWebGLGetUniform(program, location, params, 0); };
        _glGetUniformiv.sig = "viip";
        var _emscripten_glGetUniformiv = _glGetUniformiv;
        _emscripten_glGetUniformiv.sig = "viip";
        var _glGetUniformuiv = (program, location, params) => emscriptenWebGLGetUniform(program, location, params, 0);
        _glGetUniformuiv.sig = "viip";
        var _emscripten_glGetUniformuiv = _glGetUniformuiv;
        _emscripten_glGetUniformuiv.sig = "viip";
        var emscriptenWebGLGetVertexAttrib = (index, pname, params, type) => { if (!params) {
            GL.recordError(1281);
            return;
        } if (GL.currentContext.clientBuffers[index].enabled) {
            err("glGetVertexAttrib*v on client-side array: not supported, bad data returned");
        } var data = GLctx.getVertexAttrib(index, pname); if (pname == 34975) {
            HEAP32[params >> 2] = data && data["name"];
        }
        else if (typeof data == "number" || typeof data == "boolean") {
            switch (type) {
                case 0:
                    HEAP32[params >> 2] = data;
                    break;
                case 2:
                    HEAPF32[params >> 2] = data;
                    break;
                case 5:
                    HEAP32[params >> 2] = Math.fround(data);
                    break;
            }
        }
        else {
            for (var i = 0; i < data.length; i++) {
                switch (type) {
                    case 0:
                        HEAP32[params + i * 4 >> 2] = data[i];
                        break;
                    case 2:
                        HEAPF32[params + i * 4 >> 2] = data[i];
                        break;
                    case 5:
                        HEAP32[params + i * 4 >> 2] = Math.fround(data[i]);
                        break;
                }
            }
        } };
        var _glGetVertexAttribIiv = (index, pname, params) => { emscriptenWebGLGetVertexAttrib(index, pname, params, 0); };
        _glGetVertexAttribIiv.sig = "viip";
        var _emscripten_glGetVertexAttribIiv = _glGetVertexAttribIiv;
        _emscripten_glGetVertexAttribIiv.sig = "viip";
        var _glGetVertexAttribIuiv = _glGetVertexAttribIiv;
        _glGetVertexAttribIuiv.sig = "viip";
        var _emscripten_glGetVertexAttribIuiv = _glGetVertexAttribIuiv;
        _emscripten_glGetVertexAttribIuiv.sig = "viip";
        var _glGetVertexAttribPointerv = (index, pname, pointer) => { if (!pointer) {
            GL.recordError(1281);
            return;
        } if (GL.currentContext.clientBuffers[index].enabled) {
            err("glGetVertexAttribPointer on client-side array: not supported, bad data returned");
        } HEAP32[pointer >> 2] = GLctx.getVertexAttribOffset(index, pname); };
        _glGetVertexAttribPointerv.sig = "viip";
        var _emscripten_glGetVertexAttribPointerv = _glGetVertexAttribPointerv;
        _emscripten_glGetVertexAttribPointerv.sig = "viip";
        var _glGetVertexAttribfv = (index, pname, params) => { emscriptenWebGLGetVertexAttrib(index, pname, params, 2); };
        _glGetVertexAttribfv.sig = "viip";
        var _emscripten_glGetVertexAttribfv = _glGetVertexAttribfv;
        _emscripten_glGetVertexAttribfv.sig = "viip";
        var _glGetVertexAttribiv = (index, pname, params) => { emscriptenWebGLGetVertexAttrib(index, pname, params, 5); };
        _glGetVertexAttribiv.sig = "viip";
        var _emscripten_glGetVertexAttribiv = _glGetVertexAttribiv;
        _emscripten_glGetVertexAttribiv.sig = "viip";
        var _glHint = (x0, x1) => GLctx.hint(x0, x1);
        _glHint.sig = "vii";
        var _emscripten_glHint = _glHint;
        _emscripten_glHint.sig = "vii";
        var _glInvalidateFramebuffer = (target, numAttachments, attachments) => { var list = tempFixedLengthArray[numAttachments]; for (var i = 0; i < numAttachments; i++) {
            list[i] = HEAP32[attachments + i * 4 >> 2];
        } GLctx.invalidateFramebuffer(target, list); };
        _glInvalidateFramebuffer.sig = "viip";
        var _emscripten_glInvalidateFramebuffer = _glInvalidateFramebuffer;
        _emscripten_glInvalidateFramebuffer.sig = "viip";
        var _glInvalidateSubFramebuffer = (target, numAttachments, attachments, x, y, width, height) => { var list = tempFixedLengthArray[numAttachments]; for (var i = 0; i < numAttachments; i++) {
            list[i] = HEAP32[attachments + i * 4 >> 2];
        } GLctx.invalidateSubFramebuffer(target, list, x, y, width, height); };
        _glInvalidateSubFramebuffer.sig = "viipiiii";
        var _emscripten_glInvalidateSubFramebuffer = _glInvalidateSubFramebuffer;
        _emscripten_glInvalidateSubFramebuffer.sig = "viipiiii";
        var _glIsBuffer = buffer => { var b = GL.buffers[buffer]; if (!b)
            return 0; return GLctx.isBuffer(b); };
        _glIsBuffer.sig = "ii";
        var _emscripten_glIsBuffer = _glIsBuffer;
        _emscripten_glIsBuffer.sig = "ii";
        var _glIsEnabled = x0 => GLctx.isEnabled(x0);
        _glIsEnabled.sig = "ii";
        var _emscripten_glIsEnabled = _glIsEnabled;
        _emscripten_glIsEnabled.sig = "ii";
        var _glIsFramebuffer = framebuffer => { var fb = GL.framebuffers[framebuffer]; if (!fb)
            return 0; return GLctx.isFramebuffer(fb); };
        _glIsFramebuffer.sig = "ii";
        var _emscripten_glIsFramebuffer = _glIsFramebuffer;
        _emscripten_glIsFramebuffer.sig = "ii";
        var _glIsProgram = program => { program = GL.programs[program]; if (!program)
            return 0; return GLctx.isProgram(program); };
        _glIsProgram.sig = "ii";
        var _emscripten_glIsProgram = _glIsProgram;
        _emscripten_glIsProgram.sig = "ii";
        var _glIsQuery = id => { var query = GL.queries[id]; if (!query)
            return 0; return GLctx.isQuery(query); };
        _glIsQuery.sig = "ii";
        var _emscripten_glIsQuery = _glIsQuery;
        _emscripten_glIsQuery.sig = "ii";
        var _glIsQueryEXT = id => { var query = GL.queries[id]; if (!query)
            return 0; return GLctx.disjointTimerQueryExt["isQueryEXT"](query); };
        _glIsQueryEXT.sig = "ii";
        var _emscripten_glIsQueryEXT = _glIsQueryEXT;
        var _glIsRenderbuffer = renderbuffer => { var rb = GL.renderbuffers[renderbuffer]; if (!rb)
            return 0; return GLctx.isRenderbuffer(rb); };
        _glIsRenderbuffer.sig = "ii";
        var _emscripten_glIsRenderbuffer = _glIsRenderbuffer;
        _emscripten_glIsRenderbuffer.sig = "ii";
        var _glIsSampler = id => { var sampler = GL.samplers[id]; if (!sampler)
            return 0; return GLctx.isSampler(sampler); };
        _glIsSampler.sig = "ii";
        var _emscripten_glIsSampler = _glIsSampler;
        _emscripten_glIsSampler.sig = "ii";
        var _glIsShader = shader => { var s = GL.shaders[shader]; if (!s)
            return 0; return GLctx.isShader(s); };
        _glIsShader.sig = "ii";
        var _emscripten_glIsShader = _glIsShader;
        _emscripten_glIsShader.sig = "ii";
        var _glIsSync = sync => GLctx.isSync(GL.syncs[sync]);
        _glIsSync.sig = "ip";
        var _emscripten_glIsSync = _glIsSync;
        _emscripten_glIsSync.sig = "ip";
        var _glIsTexture = id => { var texture = GL.textures[id]; if (!texture)
            return 0; return GLctx.isTexture(texture); };
        _glIsTexture.sig = "ii";
        var _emscripten_glIsTexture = _glIsTexture;
        _emscripten_glIsTexture.sig = "ii";
        var _glIsTransformFeedback = id => GLctx.isTransformFeedback(GL.transformFeedbacks[id]);
        _glIsTransformFeedback.sig = "ii";
        var _emscripten_glIsTransformFeedback = _glIsTransformFeedback;
        _emscripten_glIsTransformFeedback.sig = "ii";
        var _glIsVertexArray = array => { var vao = GL.vaos[array]; if (!vao)
            return 0; return GLctx.isVertexArray(vao); };
        _glIsVertexArray.sig = "ii";
        var _emscripten_glIsVertexArray = _glIsVertexArray;
        _emscripten_glIsVertexArray.sig = "ii";
        var _glIsVertexArrayOES = _glIsVertexArray;
        _glIsVertexArrayOES.sig = "ii";
        var _emscripten_glIsVertexArrayOES = _glIsVertexArrayOES;
        _emscripten_glIsVertexArrayOES.sig = "ii";
        var _glLineWidth = x0 => GLctx.lineWidth(x0);
        _glLineWidth.sig = "vf";
        var _emscripten_glLineWidth = _glLineWidth;
        _emscripten_glLineWidth.sig = "vf";
        var _glLinkProgram = program => { program = GL.programs[program]; GLctx.linkProgram(program); program.uniformLocsById = 0; program.uniformSizeAndIdsByName = {}; };
        _glLinkProgram.sig = "vi";
        var _emscripten_glLinkProgram = _glLinkProgram;
        _emscripten_glLinkProgram.sig = "vi";
        var _glMapBufferRange = (target, offset, length, access) => { var _a; if ((access & (1 | 32)) != 0) {
            err("glMapBufferRange access does not support MAP_READ or MAP_UNSYNCHRONIZED");
            return 0;
        } if ((access & 2) == 0) {
            err("glMapBufferRange access must include MAP_WRITE");
            return 0;
        } if ((access & (4 | 8)) == 0) {
            err("glMapBufferRange access must include INVALIDATE_BUFFER or INVALIDATE_RANGE");
            return 0;
        } if (!emscriptenWebGLValidateMapBufferTarget(target)) {
            GL.recordError(1280);
            err("GL_INVALID_ENUM in glMapBufferRange");
            return 0;
        } var mem = _malloc(length), binding = emscriptenWebGLGetBufferBinding(target); if (!mem)
            return 0; binding = (_a = GL.mappedBuffers)[binding] ?? (_a[binding] = {}); binding.offset = offset; binding.length = length; binding.mem = mem; binding.access = access; return mem; };
        _glMapBufferRange.sig = "pippi";
        var _emscripten_glMapBufferRange = _glMapBufferRange;
        _emscripten_glMapBufferRange.sig = "pippi";
        var _glPauseTransformFeedback = () => GLctx.pauseTransformFeedback();
        _glPauseTransformFeedback.sig = "v";
        var _emscripten_glPauseTransformFeedback = _glPauseTransformFeedback;
        _emscripten_glPauseTransformFeedback.sig = "v";
        var _glPixelStorei = (pname, param) => { if (pname == 3317) {
            GL.unpackAlignment = param;
        }
        else if (pname == 3314) {
            GL.unpackRowLength = param;
        } GLctx.pixelStorei(pname, param); };
        _glPixelStorei.sig = "vii";
        var _emscripten_glPixelStorei = _glPixelStorei;
        _emscripten_glPixelStorei.sig = "vii";
        var _glPolygonModeWEBGL = (face, mode) => { GLctx.webglPolygonMode["polygonModeWEBGL"](face, mode); };
        _glPolygonModeWEBGL.sig = "vii";
        var _emscripten_glPolygonModeWEBGL = _glPolygonModeWEBGL;
        var _glPolygonOffset = (x0, x1) => GLctx.polygonOffset(x0, x1);
        _glPolygonOffset.sig = "vff";
        var _emscripten_glPolygonOffset = _glPolygonOffset;
        _emscripten_glPolygonOffset.sig = "vff";
        var _glPolygonOffsetClampEXT = (factor, units, clamp) => { GLctx.extPolygonOffsetClamp["polygonOffsetClampEXT"](factor, units, clamp); };
        _glPolygonOffsetClampEXT.sig = "vfff";
        var _emscripten_glPolygonOffsetClampEXT = _glPolygonOffsetClampEXT;
        var _glProgramBinary = (program, binaryFormat, binary, length) => { GL.recordError(1280); };
        _glProgramBinary.sig = "viipi";
        var _emscripten_glProgramBinary = _glProgramBinary;
        _emscripten_glProgramBinary.sig = "viipi";
        var _glProgramParameteri = (program, pname, value) => { GL.recordError(1280); };
        _glProgramParameteri.sig = "viii";
        var _emscripten_glProgramParameteri = _glProgramParameteri;
        _emscripten_glProgramParameteri.sig = "viii";
        var _glQueryCounterEXT = (id, target) => { GLctx.disjointTimerQueryExt["queryCounterEXT"](GL.queries[id], target); };
        _glQueryCounterEXT.sig = "vii";
        var _emscripten_glQueryCounterEXT = _glQueryCounterEXT;
        var _glReadBuffer = x0 => GLctx.readBuffer(x0);
        _glReadBuffer.sig = "vi";
        var _emscripten_glReadBuffer = _glReadBuffer;
        _emscripten_glReadBuffer.sig = "vi";
        var heapObjectForWebGLType = type => { type -= 5120; if (type == 0)
            return HEAP8; if (type == 1)
            return HEAPU8; if (type == 2)
            return HEAP16; if (type == 4)
            return HEAP32; if (type == 6)
            return HEAPF32; if (type == 5 || type == 28922 || type == 28520 || type == 30779 || type == 30782)
            return HEAPU32; return HEAPU16; };
        var toTypedArrayIndex = (pointer, heap) => pointer >>> 31 - Math.clz32(heap.BYTES_PER_ELEMENT);
        var _glReadPixels = (x, y, width, height, format, type, pixels) => { if (true) {
            if (GLctx.currentPixelPackBufferBinding) {
                GLctx.readPixels(x, y, width, height, format, type, pixels);
                return;
            }
            var heap = heapObjectForWebGLType(type);
            var target = toTypedArrayIndex(pixels, heap);
            GLctx.readPixels(x, y, width, height, format, type, heap, target);
            return;
        } };
        _glReadPixels.sig = "viiiiiip";
        var _emscripten_glReadPixels = _glReadPixels;
        _emscripten_glReadPixels.sig = "viiiiiip";
        var _glReleaseShaderCompiler = () => { };
        _glReleaseShaderCompiler.sig = "v";
        var _emscripten_glReleaseShaderCompiler = _glReleaseShaderCompiler;
        _emscripten_glReleaseShaderCompiler.sig = "v";
        var _glRenderbufferStorage = (x0, x1, x2, x3) => GLctx.renderbufferStorage(x0, x1, x2, x3);
        _glRenderbufferStorage.sig = "viiii";
        var _emscripten_glRenderbufferStorage = _glRenderbufferStorage;
        _emscripten_glRenderbufferStorage.sig = "viiii";
        var _glRenderbufferStorageMultisample = (x0, x1, x2, x3, x4) => GLctx.renderbufferStorageMultisample(x0, x1, x2, x3, x4);
        _glRenderbufferStorageMultisample.sig = "viiiii";
        var _emscripten_glRenderbufferStorageMultisample = _glRenderbufferStorageMultisample;
        _emscripten_glRenderbufferStorageMultisample.sig = "viiiii";
        var _glResumeTransformFeedback = () => GLctx.resumeTransformFeedback();
        _glResumeTransformFeedback.sig = "v";
        var _emscripten_glResumeTransformFeedback = _glResumeTransformFeedback;
        _emscripten_glResumeTransformFeedback.sig = "v";
        var _glSampleCoverage = (value, invert) => { GLctx.sampleCoverage(value, !!invert); };
        _glSampleCoverage.sig = "vfi";
        var _emscripten_glSampleCoverage = _glSampleCoverage;
        _emscripten_glSampleCoverage.sig = "vfi";
        var _glSamplerParameterf = (sampler, pname, param) => { GLctx.samplerParameterf(GL.samplers[sampler], pname, param); };
        _glSamplerParameterf.sig = "viif";
        var _emscripten_glSamplerParameterf = _glSamplerParameterf;
        _emscripten_glSamplerParameterf.sig = "viif";
        var _glSamplerParameterfv = (sampler, pname, params) => { var param = HEAPF32[params >> 2]; GLctx.samplerParameterf(GL.samplers[sampler], pname, param); };
        _glSamplerParameterfv.sig = "viip";
        var _emscripten_glSamplerParameterfv = _glSamplerParameterfv;
        _emscripten_glSamplerParameterfv.sig = "viip";
        var _glSamplerParameteri = (sampler, pname, param) => { GLctx.samplerParameteri(GL.samplers[sampler], pname, param); };
        _glSamplerParameteri.sig = "viii";
        var _emscripten_glSamplerParameteri = _glSamplerParameteri;
        _emscripten_glSamplerParameteri.sig = "viii";
        var _glSamplerParameteriv = (sampler, pname, params) => { var param = HEAP32[params >> 2]; GLctx.samplerParameteri(GL.samplers[sampler], pname, param); };
        _glSamplerParameteriv.sig = "viip";
        var _emscripten_glSamplerParameteriv = _glSamplerParameteriv;
        _emscripten_glSamplerParameteriv.sig = "viip";
        var _glScissor = (x0, x1, x2, x3) => GLctx.scissor(x0, x1, x2, x3);
        _glScissor.sig = "viiii";
        var _emscripten_glScissor = _glScissor;
        _emscripten_glScissor.sig = "viiii";
        var _glShaderBinary = (count, shaders, binaryformat, binary, length) => { GL.recordError(1280); };
        _glShaderBinary.sig = "vipipi";
        var _emscripten_glShaderBinary = _glShaderBinary;
        _emscripten_glShaderBinary.sig = "vipipi";
        var _glShaderSource = (shader, count, string, length) => { var source = GL.getSource(shader, count, string, length); GLctx.shaderSource(GL.shaders[shader], source); };
        _glShaderSource.sig = "viipp";
        var _emscripten_glShaderSource = _glShaderSource;
        _emscripten_glShaderSource.sig = "viipp";
        var _glStencilFunc = (x0, x1, x2) => GLctx.stencilFunc(x0, x1, x2);
        _glStencilFunc.sig = "viii";
        var _emscripten_glStencilFunc = _glStencilFunc;
        _emscripten_glStencilFunc.sig = "viii";
        var _glStencilFuncSeparate = (x0, x1, x2, x3) => GLctx.stencilFuncSeparate(x0, x1, x2, x3);
        _glStencilFuncSeparate.sig = "viiii";
        var _emscripten_glStencilFuncSeparate = _glStencilFuncSeparate;
        _emscripten_glStencilFuncSeparate.sig = "viiii";
        var _glStencilMask = x0 => GLctx.stencilMask(x0);
        _glStencilMask.sig = "vi";
        var _emscripten_glStencilMask = _glStencilMask;
        _emscripten_glStencilMask.sig = "vi";
        var _glStencilMaskSeparate = (x0, x1) => GLctx.stencilMaskSeparate(x0, x1);
        _glStencilMaskSeparate.sig = "vii";
        var _emscripten_glStencilMaskSeparate = _glStencilMaskSeparate;
        _emscripten_glStencilMaskSeparate.sig = "vii";
        var _glStencilOp = (x0, x1, x2) => GLctx.stencilOp(x0, x1, x2);
        _glStencilOp.sig = "viii";
        var _emscripten_glStencilOp = _glStencilOp;
        _emscripten_glStencilOp.sig = "viii";
        var _glStencilOpSeparate = (x0, x1, x2, x3) => GLctx.stencilOpSeparate(x0, x1, x2, x3);
        _glStencilOpSeparate.sig = "viiii";
        var _emscripten_glStencilOpSeparate = _glStencilOpSeparate;
        _emscripten_glStencilOpSeparate.sig = "viiii";
        var computeUnpackAlignedImageSize = (width, height, sizePerPixel) => { function roundedToNextMultipleOf(x, y) { return x + y - 1 & -y; } var plainRowSize = (GL.unpackRowLength || width) * sizePerPixel; var alignedRowSize = roundedToNextMultipleOf(plainRowSize, GL.unpackAlignment); return height * alignedRowSize; };
        var colorChannelsInGlTextureFormat = format => { var colorChannels = { 5: 3, 6: 4, 8: 2, 29502: 3, 29504: 4, 26917: 2, 26918: 2, 29846: 3, 29847: 4 }; return colorChannels[format - 6402] || 1; };
        var emscriptenWebGLGetTexPixelData = (type, format, width, height, pixels, internalFormat) => { var heap = heapObjectForWebGLType(type); var sizePerPixel = colorChannelsInGlTextureFormat(format) * heap.BYTES_PER_ELEMENT; var bytes = computeUnpackAlignedImageSize(width, height, sizePerPixel); return heap.subarray(toTypedArrayIndex(pixels, heap), toTypedArrayIndex(pixels + bytes, heap)); };
        var _glTexImage2D = (target, level, internalFormat, width, height, border, format, type, pixels) => { if (true) {
            if (GLctx.currentPixelUnpackBufferBinding) {
                GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixels);
                return;
            }
            if (pixels) {
                var heap = heapObjectForWebGLType(type);
                var index = toTypedArrayIndex(pixels, heap);
                GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, heap, index);
                return;
            }
        } var pixelData = pixels ? emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) : null; GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixelData); };
        _glTexImage2D.sig = "viiiiiiiip";
        var _emscripten_glTexImage2D = _glTexImage2D;
        _emscripten_glTexImage2D.sig = "viiiiiiiip";
        var _glTexImage3D = (target, level, internalFormat, width, height, depth, border, format, type, pixels) => { if (GLctx.currentPixelUnpackBufferBinding) {
            GLctx.texImage3D(target, level, internalFormat, width, height, depth, border, format, type, pixels);
        }
        else if (pixels) {
            var heap = heapObjectForWebGLType(type);
            GLctx.texImage3D(target, level, internalFormat, width, height, depth, border, format, type, heap, toTypedArrayIndex(pixels, heap));
        }
        else {
            GLctx.texImage3D(target, level, internalFormat, width, height, depth, border, format, type, null);
        } };
        _glTexImage3D.sig = "viiiiiiiiip";
        var _emscripten_glTexImage3D = _glTexImage3D;
        _emscripten_glTexImage3D.sig = "viiiiiiiiip";
        var _glTexParameterf = (x0, x1, x2) => GLctx.texParameterf(x0, x1, x2);
        _glTexParameterf.sig = "viif";
        var _emscripten_glTexParameterf = _glTexParameterf;
        _emscripten_glTexParameterf.sig = "viif";
        var _glTexParameterfv = (target, pname, params) => { var param = HEAPF32[params >> 2]; GLctx.texParameterf(target, pname, param); };
        _glTexParameterfv.sig = "viip";
        var _emscripten_glTexParameterfv = _glTexParameterfv;
        _emscripten_glTexParameterfv.sig = "viip";
        var _glTexParameteri = (x0, x1, x2) => GLctx.texParameteri(x0, x1, x2);
        _glTexParameteri.sig = "viii";
        var _emscripten_glTexParameteri = _glTexParameteri;
        _emscripten_glTexParameteri.sig = "viii";
        var _glTexParameteriv = (target, pname, params) => { var param = HEAP32[params >> 2]; GLctx.texParameteri(target, pname, param); };
        _glTexParameteriv.sig = "viip";
        var _emscripten_glTexParameteriv = _glTexParameteriv;
        _emscripten_glTexParameteriv.sig = "viip";
        var _glTexStorage2D = (x0, x1, x2, x3, x4) => GLctx.texStorage2D(x0, x1, x2, x3, x4);
        _glTexStorage2D.sig = "viiiii";
        var _emscripten_glTexStorage2D = _glTexStorage2D;
        _emscripten_glTexStorage2D.sig = "viiiii";
        var _glTexStorage3D = (x0, x1, x2, x3, x4, x5) => GLctx.texStorage3D(x0, x1, x2, x3, x4, x5);
        _glTexStorage3D.sig = "viiiiii";
        var _emscripten_glTexStorage3D = _glTexStorage3D;
        _emscripten_glTexStorage3D.sig = "viiiiii";
        var _glTexSubImage2D = (target, level, xoffset, yoffset, width, height, format, type, pixels) => { if (true) {
            if (GLctx.currentPixelUnpackBufferBinding) {
                GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels);
                return;
            }
            if (pixels) {
                var heap = heapObjectForWebGLType(type);
                GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, heap, toTypedArrayIndex(pixels, heap));
                return;
            }
        } var pixelData = pixels ? emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, 0) : null; GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixelData); };
        _glTexSubImage2D.sig = "viiiiiiiip";
        var _emscripten_glTexSubImage2D = _glTexSubImage2D;
        _emscripten_glTexSubImage2D.sig = "viiiiiiiip";
        var _glTexSubImage3D = (target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, pixels) => { if (GLctx.currentPixelUnpackBufferBinding) {
            GLctx.texSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, pixels);
        }
        else if (pixels) {
            var heap = heapObjectForWebGLType(type);
            GLctx.texSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, heap, toTypedArrayIndex(pixels, heap));
        }
        else {
            GLctx.texSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, null);
        } };
        _glTexSubImage3D.sig = "viiiiiiiiiip";
        var _emscripten_glTexSubImage3D = _glTexSubImage3D;
        _emscripten_glTexSubImage3D.sig = "viiiiiiiiiip";
        var _glTransformFeedbackVaryings = (program, count, varyings, bufferMode) => { program = GL.programs[program]; var vars = []; for (var i = 0; i < count; i++)
            vars.push(UTF8ToString(HEAP32[varyings + i * 4 >> 2])); GLctx.transformFeedbackVaryings(program, vars, bufferMode); };
        _glTransformFeedbackVaryings.sig = "viipi";
        var _emscripten_glTransformFeedbackVaryings = _glTransformFeedbackVaryings;
        _emscripten_glTransformFeedbackVaryings.sig = "viipi";
        var _glUniform1f = (location, v0) => { GLctx.uniform1f(webglGetUniformLocation(location), v0); };
        _glUniform1f.sig = "vif";
        var _emscripten_glUniform1f = _glUniform1f;
        _emscripten_glUniform1f.sig = "vif";
        var _glUniform1fv = (location, count, value) => { count && GLctx.uniform1fv(webglGetUniformLocation(location), HEAPF32, value >> 2, count); };
        _glUniform1fv.sig = "viip";
        var _emscripten_glUniform1fv = _glUniform1fv;
        _emscripten_glUniform1fv.sig = "viip";
        var _glUniform1i = (location, v0) => { GLctx.uniform1i(webglGetUniformLocation(location), v0); };
        _glUniform1i.sig = "vii";
        var _emscripten_glUniform1i = _glUniform1i;
        _emscripten_glUniform1i.sig = "vii";
        var _glUniform1iv = (location, count, value) => { count && GLctx.uniform1iv(webglGetUniformLocation(location), HEAP32, value >> 2, count); };
        _glUniform1iv.sig = "viip";
        var _emscripten_glUniform1iv = _glUniform1iv;
        _emscripten_glUniform1iv.sig = "viip";
        var _glUniform1ui = (location, v0) => { GLctx.uniform1ui(webglGetUniformLocation(location), v0); };
        _glUniform1ui.sig = "vii";
        var _emscripten_glUniform1ui = _glUniform1ui;
        _emscripten_glUniform1ui.sig = "vii";
        var _glUniform1uiv = (location, count, value) => { count && GLctx.uniform1uiv(webglGetUniformLocation(location), HEAPU32, value >> 2, count); };
        _glUniform1uiv.sig = "viip";
        var _emscripten_glUniform1uiv = _glUniform1uiv;
        _emscripten_glUniform1uiv.sig = "viip";
        var _glUniform2f = (location, v0, v1) => { GLctx.uniform2f(webglGetUniformLocation(location), v0, v1); };
        _glUniform2f.sig = "viff";
        var _emscripten_glUniform2f = _glUniform2f;
        _emscripten_glUniform2f.sig = "viff";
        var _glUniform2fv = (location, count, value) => { count && GLctx.uniform2fv(webglGetUniformLocation(location), HEAPF32, value >> 2, count * 2); };
        _glUniform2fv.sig = "viip";
        var _emscripten_glUniform2fv = _glUniform2fv;
        _emscripten_glUniform2fv.sig = "viip";
        var _glUniform2i = (location, v0, v1) => { GLctx.uniform2i(webglGetUniformLocation(location), v0, v1); };
        _glUniform2i.sig = "viii";
        var _emscripten_glUniform2i = _glUniform2i;
        _emscripten_glUniform2i.sig = "viii";
        var _glUniform2iv = (location, count, value) => { count && GLctx.uniform2iv(webglGetUniformLocation(location), HEAP32, value >> 2, count * 2); };
        _glUniform2iv.sig = "viip";
        var _emscripten_glUniform2iv = _glUniform2iv;
        _emscripten_glUniform2iv.sig = "viip";
        var _glUniform2ui = (location, v0, v1) => { GLctx.uniform2ui(webglGetUniformLocation(location), v0, v1); };
        _glUniform2ui.sig = "viii";
        var _emscripten_glUniform2ui = _glUniform2ui;
        _emscripten_glUniform2ui.sig = "viii";
        var _glUniform2uiv = (location, count, value) => { count && GLctx.uniform2uiv(webglGetUniformLocation(location), HEAPU32, value >> 2, count * 2); };
        _glUniform2uiv.sig = "viip";
        var _emscripten_glUniform2uiv = _glUniform2uiv;
        _emscripten_glUniform2uiv.sig = "viip";
        var _glUniform3f = (location, v0, v1, v2) => { GLctx.uniform3f(webglGetUniformLocation(location), v0, v1, v2); };
        _glUniform3f.sig = "vifff";
        var _emscripten_glUniform3f = _glUniform3f;
        _emscripten_glUniform3f.sig = "vifff";
        var _glUniform3fv = (location, count, value) => { count && GLctx.uniform3fv(webglGetUniformLocation(location), HEAPF32, value >> 2, count * 3); };
        _glUniform3fv.sig = "viip";
        var _emscripten_glUniform3fv = _glUniform3fv;
        _emscripten_glUniform3fv.sig = "viip";
        var _glUniform3i = (location, v0, v1, v2) => { GLctx.uniform3i(webglGetUniformLocation(location), v0, v1, v2); };
        _glUniform3i.sig = "viiii";
        var _emscripten_glUniform3i = _glUniform3i;
        _emscripten_glUniform3i.sig = "viiii";
        var _glUniform3iv = (location, count, value) => { count && GLctx.uniform3iv(webglGetUniformLocation(location), HEAP32, value >> 2, count * 3); };
        _glUniform3iv.sig = "viip";
        var _emscripten_glUniform3iv = _glUniform3iv;
        _emscripten_glUniform3iv.sig = "viip";
        var _glUniform3ui = (location, v0, v1, v2) => { GLctx.uniform3ui(webglGetUniformLocation(location), v0, v1, v2); };
        _glUniform3ui.sig = "viiii";
        var _emscripten_glUniform3ui = _glUniform3ui;
        _emscripten_glUniform3ui.sig = "viiii";
        var _glUniform3uiv = (location, count, value) => { count && GLctx.uniform3uiv(webglGetUniformLocation(location), HEAPU32, value >> 2, count * 3); };
        _glUniform3uiv.sig = "viip";
        var _emscripten_glUniform3uiv = _glUniform3uiv;
        _emscripten_glUniform3uiv.sig = "viip";
        var _glUniform4f = (location, v0, v1, v2, v3) => { GLctx.uniform4f(webglGetUniformLocation(location), v0, v1, v2, v3); };
        _glUniform4f.sig = "viffff";
        var _emscripten_glUniform4f = _glUniform4f;
        _emscripten_glUniform4f.sig = "viffff";
        var _glUniform4fv = (location, count, value) => { count && GLctx.uniform4fv(webglGetUniformLocation(location), HEAPF32, value >> 2, count * 4); };
        _glUniform4fv.sig = "viip";
        var _emscripten_glUniform4fv = _glUniform4fv;
        _emscripten_glUniform4fv.sig = "viip";
        var _glUniform4i = (location, v0, v1, v2, v3) => { GLctx.uniform4i(webglGetUniformLocation(location), v0, v1, v2, v3); };
        _glUniform4i.sig = "viiiii";
        var _emscripten_glUniform4i = _glUniform4i;
        _emscripten_glUniform4i.sig = "viiiii";
        var _glUniform4iv = (location, count, value) => { count && GLctx.uniform4iv(webglGetUniformLocation(location), HEAP32, value >> 2, count * 4); };
        _glUniform4iv.sig = "viip";
        var _emscripten_glUniform4iv = _glUniform4iv;
        _emscripten_glUniform4iv.sig = "viip";
        var _glUniform4ui = (location, v0, v1, v2, v3) => { GLctx.uniform4ui(webglGetUniformLocation(location), v0, v1, v2, v3); };
        _glUniform4ui.sig = "viiiii";
        var _emscripten_glUniform4ui = _glUniform4ui;
        _emscripten_glUniform4ui.sig = "viiiii";
        var _glUniform4uiv = (location, count, value) => { count && GLctx.uniform4uiv(webglGetUniformLocation(location), HEAPU32, value >> 2, count * 4); };
        _glUniform4uiv.sig = "viip";
        var _emscripten_glUniform4uiv = _glUniform4uiv;
        _emscripten_glUniform4uiv.sig = "viip";
        var _glUniformBlockBinding = (program, uniformBlockIndex, uniformBlockBinding) => { program = GL.programs[program]; GLctx.uniformBlockBinding(program, uniformBlockIndex, uniformBlockBinding); };
        _glUniformBlockBinding.sig = "viii";
        var _emscripten_glUniformBlockBinding = _glUniformBlockBinding;
        _emscripten_glUniformBlockBinding.sig = "viii";
        var _glUniformMatrix2fv = (location, count, transpose, value) => { count && GLctx.uniformMatrix2fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 4); };
        _glUniformMatrix2fv.sig = "viiip";
        var _emscripten_glUniformMatrix2fv = _glUniformMatrix2fv;
        _emscripten_glUniformMatrix2fv.sig = "viiip";
        var _glUniformMatrix2x3fv = (location, count, transpose, value) => { count && GLctx.uniformMatrix2x3fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 6); };
        _glUniformMatrix2x3fv.sig = "viiip";
        var _emscripten_glUniformMatrix2x3fv = _glUniformMatrix2x3fv;
        _emscripten_glUniformMatrix2x3fv.sig = "viiip";
        var _glUniformMatrix2x4fv = (location, count, transpose, value) => { count && GLctx.uniformMatrix2x4fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 8); };
        _glUniformMatrix2x4fv.sig = "viiip";
        var _emscripten_glUniformMatrix2x4fv = _glUniformMatrix2x4fv;
        _emscripten_glUniformMatrix2x4fv.sig = "viiip";
        var _glUniformMatrix3fv = (location, count, transpose, value) => { count && GLctx.uniformMatrix3fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 9); };
        _glUniformMatrix3fv.sig = "viiip";
        var _emscripten_glUniformMatrix3fv = _glUniformMatrix3fv;
        _emscripten_glUniformMatrix3fv.sig = "viiip";
        var _glUniformMatrix3x2fv = (location, count, transpose, value) => { count && GLctx.uniformMatrix3x2fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 6); };
        _glUniformMatrix3x2fv.sig = "viiip";
        var _emscripten_glUniformMatrix3x2fv = _glUniformMatrix3x2fv;
        _emscripten_glUniformMatrix3x2fv.sig = "viiip";
        var _glUniformMatrix3x4fv = (location, count, transpose, value) => { count && GLctx.uniformMatrix3x4fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 12); };
        _glUniformMatrix3x4fv.sig = "viiip";
        var _emscripten_glUniformMatrix3x4fv = _glUniformMatrix3x4fv;
        _emscripten_glUniformMatrix3x4fv.sig = "viiip";
        var _glUniformMatrix4fv = (location, count, transpose, value) => { count && GLctx.uniformMatrix4fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 16); };
        _glUniformMatrix4fv.sig = "viiip";
        var _emscripten_glUniformMatrix4fv = _glUniformMatrix4fv;
        _emscripten_glUniformMatrix4fv.sig = "viiip";
        var _glUniformMatrix4x2fv = (location, count, transpose, value) => { count && GLctx.uniformMatrix4x2fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 8); };
        _glUniformMatrix4x2fv.sig = "viiip";
        var _emscripten_glUniformMatrix4x2fv = _glUniformMatrix4x2fv;
        _emscripten_glUniformMatrix4x2fv.sig = "viiip";
        var _glUniformMatrix4x3fv = (location, count, transpose, value) => { count && GLctx.uniformMatrix4x3fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 12); };
        _glUniformMatrix4x3fv.sig = "viiip";
        var _emscripten_glUniformMatrix4x3fv = _glUniformMatrix4x3fv;
        _emscripten_glUniformMatrix4x3fv.sig = "viiip";
        var _glUnmapBuffer = target => { if (!emscriptenWebGLValidateMapBufferTarget(target)) {
            GL.recordError(1280);
            err("GL_INVALID_ENUM in glUnmapBuffer");
            return 0;
        } var buffer = emscriptenWebGLGetBufferBinding(target); var mapping = GL.mappedBuffers[buffer]; if (!mapping || !mapping.mem) {
            GL.recordError(1282);
            err("buffer was never mapped in glUnmapBuffer");
            return 0;
        } if (!(mapping.access & 16)) {
            if (true) {
                GLctx.bufferSubData(target, mapping.offset, HEAPU8, mapping.mem, mapping.length);
            }
            else
                GLctx.bufferSubData(target, mapping.offset, HEAPU8.subarray(mapping.mem, mapping.mem + mapping.length));
        } _free(mapping.mem); mapping.mem = 0; return 1; };
        _glUnmapBuffer.sig = "ii";
        var _emscripten_glUnmapBuffer = _glUnmapBuffer;
        _emscripten_glUnmapBuffer.sig = "ii";
        var _glUseProgram = program => { program = GL.programs[program]; GLctx.useProgram(program); GLctx.currentProgram = program; };
        _glUseProgram.sig = "vi";
        var _emscripten_glUseProgram = _glUseProgram;
        _emscripten_glUseProgram.sig = "vi";
        var _glValidateProgram = program => { GLctx.validateProgram(GL.programs[program]); };
        _glValidateProgram.sig = "vi";
        var _emscripten_glValidateProgram = _glValidateProgram;
        _emscripten_glValidateProgram.sig = "vi";
        var _glVertexAttrib1f = (x0, x1) => GLctx.vertexAttrib1f(x0, x1);
        _glVertexAttrib1f.sig = "vif";
        var _emscripten_glVertexAttrib1f = _glVertexAttrib1f;
        _emscripten_glVertexAttrib1f.sig = "vif";
        var _glVertexAttrib1fv = (index, v) => { GLctx.vertexAttrib1f(index, HEAPF32[v >> 2]); };
        _glVertexAttrib1fv.sig = "vip";
        var _emscripten_glVertexAttrib1fv = _glVertexAttrib1fv;
        _emscripten_glVertexAttrib1fv.sig = "vip";
        var _glVertexAttrib2f = (x0, x1, x2) => GLctx.vertexAttrib2f(x0, x1, x2);
        _glVertexAttrib2f.sig = "viff";
        var _emscripten_glVertexAttrib2f = _glVertexAttrib2f;
        _emscripten_glVertexAttrib2f.sig = "viff";
        var _glVertexAttrib2fv = (index, v) => { GLctx.vertexAttrib2f(index, HEAPF32[v >> 2], HEAPF32[v + 4 >> 2]); };
        _glVertexAttrib2fv.sig = "vip";
        var _emscripten_glVertexAttrib2fv = _glVertexAttrib2fv;
        _emscripten_glVertexAttrib2fv.sig = "vip";
        var _glVertexAttrib3f = (x0, x1, x2, x3) => GLctx.vertexAttrib3f(x0, x1, x2, x3);
        _glVertexAttrib3f.sig = "vifff";
        var _emscripten_glVertexAttrib3f = _glVertexAttrib3f;
        _emscripten_glVertexAttrib3f.sig = "vifff";
        var _glVertexAttrib3fv = (index, v) => { GLctx.vertexAttrib3f(index, HEAPF32[v >> 2], HEAPF32[v + 4 >> 2], HEAPF32[v + 8 >> 2]); };
        _glVertexAttrib3fv.sig = "vip";
        var _emscripten_glVertexAttrib3fv = _glVertexAttrib3fv;
        _emscripten_glVertexAttrib3fv.sig = "vip";
        var _glVertexAttrib4f = (x0, x1, x2, x3, x4) => GLctx.vertexAttrib4f(x0, x1, x2, x3, x4);
        _glVertexAttrib4f.sig = "viffff";
        var _emscripten_glVertexAttrib4f = _glVertexAttrib4f;
        _emscripten_glVertexAttrib4f.sig = "viffff";
        var _glVertexAttrib4fv = (index, v) => { GLctx.vertexAttrib4f(index, HEAPF32[v >> 2], HEAPF32[v + 4 >> 2], HEAPF32[v + 8 >> 2], HEAPF32[v + 12 >> 2]); };
        _glVertexAttrib4fv.sig = "vip";
        var _emscripten_glVertexAttrib4fv = _glVertexAttrib4fv;
        _emscripten_glVertexAttrib4fv.sig = "vip";
        var _glVertexAttribDivisor = (index, divisor) => { GLctx.vertexAttribDivisor(index, divisor); };
        _glVertexAttribDivisor.sig = "vii";
        var _emscripten_glVertexAttribDivisor = _glVertexAttribDivisor;
        _emscripten_glVertexAttribDivisor.sig = "vii";
        var _glVertexAttribDivisorANGLE = _glVertexAttribDivisor;
        var _emscripten_glVertexAttribDivisorANGLE = _glVertexAttribDivisorANGLE;
        var _glVertexAttribDivisorARB = _glVertexAttribDivisor;
        var _emscripten_glVertexAttribDivisorARB = _glVertexAttribDivisorARB;
        var _glVertexAttribDivisorEXT = _glVertexAttribDivisor;
        var _emscripten_glVertexAttribDivisorEXT = _glVertexAttribDivisorEXT;
        var _glVertexAttribDivisorNV = _glVertexAttribDivisor;
        var _emscripten_glVertexAttribDivisorNV = _glVertexAttribDivisorNV;
        var _glVertexAttribI4i = (x0, x1, x2, x3, x4) => GLctx.vertexAttribI4i(x0, x1, x2, x3, x4);
        _glVertexAttribI4i.sig = "viiiii";
        var _emscripten_glVertexAttribI4i = _glVertexAttribI4i;
        _emscripten_glVertexAttribI4i.sig = "viiiii";
        var _glVertexAttribI4iv = (index, v) => { GLctx.vertexAttribI4i(index, HEAP32[v >> 2], HEAP32[v + 4 >> 2], HEAP32[v + 8 >> 2], HEAP32[v + 12 >> 2]); };
        _glVertexAttribI4iv.sig = "vip";
        var _emscripten_glVertexAttribI4iv = _glVertexAttribI4iv;
        _emscripten_glVertexAttribI4iv.sig = "vip";
        var _glVertexAttribI4ui = (x0, x1, x2, x3, x4) => GLctx.vertexAttribI4ui(x0, x1, x2, x3, x4);
        _glVertexAttribI4ui.sig = "viiiii";
        var _emscripten_glVertexAttribI4ui = _glVertexAttribI4ui;
        _emscripten_glVertexAttribI4ui.sig = "viiiii";
        var _glVertexAttribI4uiv = (index, v) => { GLctx.vertexAttribI4ui(index, HEAPU32[v >> 2], HEAPU32[v + 4 >> 2], HEAPU32[v + 8 >> 2], HEAPU32[v + 12 >> 2]); };
        _glVertexAttribI4uiv.sig = "vip";
        var _emscripten_glVertexAttribI4uiv = _glVertexAttribI4uiv;
        _emscripten_glVertexAttribI4uiv.sig = "vip";
        var _glVertexAttribIPointer = (index, size, type, stride, ptr) => { var cb = GL.currentContext.clientBuffers[index]; if (!GLctx.currentArrayBufferBinding) {
            cb.size = size;
            cb.type = type;
            cb.normalized = false;
            cb.stride = stride;
            cb.ptr = ptr;
            cb.clientside = true;
            cb.vertexAttribPointerAdaptor = function (index, size, type, normalized, stride, ptr) { this.vertexAttribIPointer(index, size, type, stride, ptr); };
            return;
        } cb.clientside = false; GLctx.vertexAttribIPointer(index, size, type, stride, ptr); };
        _glVertexAttribIPointer.sig = "viiiip";
        var _emscripten_glVertexAttribIPointer = _glVertexAttribIPointer;
        _emscripten_glVertexAttribIPointer.sig = "viiiip";
        var _glVertexAttribPointer = (index, size, type, normalized, stride, ptr) => { var cb = GL.currentContext.clientBuffers[index]; if (!GLctx.currentArrayBufferBinding) {
            cb.size = size;
            cb.type = type;
            cb.normalized = normalized;
            cb.stride = stride;
            cb.ptr = ptr;
            cb.clientside = true;
            cb.vertexAttribPointerAdaptor = function (index, size, type, normalized, stride, ptr) { this.vertexAttribPointer(index, size, type, normalized, stride, ptr); };
            return;
        } cb.clientside = false; GLctx.vertexAttribPointer(index, size, type, !!normalized, stride, ptr); };
        _glVertexAttribPointer.sig = "viiiiip";
        var _emscripten_glVertexAttribPointer = _glVertexAttribPointer;
        _emscripten_glVertexAttribPointer.sig = "viiiiip";
        var _glViewport = (x0, x1, x2, x3) => GLctx.viewport(x0, x1, x2, x3);
        _glViewport.sig = "viiii";
        var _emscripten_glViewport = _glViewport;
        _emscripten_glViewport.sig = "viiii";
        var _glWaitSync = (sync, flags, timeout) => { timeout = Number(timeout); GLctx.waitSync(GL.syncs[sync], flags, timeout); };
        _glWaitSync.sig = "vpij";
        var _emscripten_glWaitSync = _glWaitSync;
        _emscripten_glWaitSync.sig = "vpij";
        var _emscripten_has_asyncify = () => 0;
        _emscripten_has_asyncify.sig = "i";
        var _emscripten_out = str => out(UTF8ToString(str));
        _emscripten_out.sig = "vp";
        class HandleAllocator {
            constructor() {
                this.allocated = [undefined];
                this.freelist = [];
            }
            get(id) { return this.allocated[id]; }
            has(id) { return this.allocated[id] !== undefined; }
            allocate(handle) { var id = this.freelist.pop() || this.allocated.length; this.allocated[id] = handle; return id; }
            free(id) { this.allocated[id] = undefined; this.freelist.push(id); }
        }
        var promiseMap = new HandleAllocator;
        var makePromise = () => { var promiseInfo = {}; promiseInfo.promise = new Promise((resolve, reject) => { promiseInfo.reject = reject; promiseInfo.resolve = resolve; }); promiseInfo.id = promiseMap.allocate(promiseInfo); return promiseInfo; };
        var _emscripten_promise_create = () => makePromise().id;
        _emscripten_promise_create.sig = "p";
        var _emscripten_promise_destroy = id => { promiseMap.free(id); };
        _emscripten_promise_destroy.sig = "vp";
        var getPromise = id => promiseMap.get(id).promise;
        var _emscripten_promise_resolve = (id, result, value) => { var info = promiseMap.get(id); switch (result) {
            case 0:
                info.resolve(value);
                return;
            case 1:
                info.resolve(getPromise(value));
                return;
            case 2:
                info.resolve(getPromise(value));
                _emscripten_promise_destroy(value);
                return;
            case 3:
                info.reject(value);
                return;
        } };
        _emscripten_promise_resolve.sig = "vpip";
        var doRequestFullscreen = (target, strategy) => { if (!JSEvents.fullscreenEnabled())
            return -1; target = findEventTarget(target); if (!target)
            return -4; if (!target.requestFullscreen && !target.webkitRequestFullscreen) {
            return -3;
        } if (!JSEvents.canPerformEventHandlerRequests()) {
            if (strategy.deferUntilInEventHandler) {
                JSEvents.deferCall(JSEvents_requestFullscreen, 1, [target, strategy]);
                return 1;
            }
            return -2;
        } return JSEvents_requestFullscreen(target, strategy); };
        var _emscripten_request_fullscreen_strategy = (target, deferUntilInEventHandler, fullscreenStrategy) => { var strategy = { scaleMode: HEAP32[fullscreenStrategy >> 2], canvasResolutionScaleMode: HEAP32[fullscreenStrategy + 4 >> 2], filteringMode: HEAP32[fullscreenStrategy + 8 >> 2], deferUntilInEventHandler, canvasResizedCallback: HEAP32[fullscreenStrategy + 12 >> 2], canvasResizedCallbackUserData: HEAP32[fullscreenStrategy + 16 >> 2] }; return doRequestFullscreen(target, strategy); };
        _emscripten_request_fullscreen_strategy.sig = "ipip";
        var _emscripten_request_pointerlock = (target, deferUntilInEventHandler) => { target = findEventTarget(target); if (!target)
            return -4; if (!target.requestPointerLock) {
            return -1;
        } if (!JSEvents.canPerformEventHandlerRequests()) {
            if (deferUntilInEventHandler) {
                JSEvents.deferCall(requestPointerLock, 2, [target]);
                return 1;
            }
            return -2;
        } return requestPointerLock(target); };
        _emscripten_request_pointerlock.sig = "ipi";
        var growMemory = size => { var oldHeapSize = wasmMemory.buffer.byteLength; var pages = (size - oldHeapSize + 65535) / 65536 | 0; try {
            wasmMemory.grow(pages);
            updateMemoryViews();
            return 1;
        }
        catch (e) { } };
        var _emscripten_resize_heap = requestedSize => { var oldSize = HEAPU8.length; requestedSize >>>= 0; var maxHeapSize = getHeapMax(); if (requestedSize > maxHeapSize) {
            return false;
        } for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
            var overGrownHeapSize = oldSize * (1 + .2 / cutDown);
            overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
            var newSize = Math.min(maxHeapSize, alignMemory(Math.max(requestedSize, overGrownHeapSize), 65536));
            var replacement = growMemory(newSize);
            if (replacement) {
                return true;
            }
        } return false; };
        _emscripten_resize_heap.sig = "ip";
        var _emscripten_sample_gamepad_data = () => { try {
            if (navigator.getGamepads)
                return (JSEvents.lastGamepadState = navigator.getGamepads()) ? 0 : -1;
        }
        catch (e) {
            navigator.getGamepads = null;
        } return -1; };
        _emscripten_sample_gamepad_data.sig = "i";
        var registerBeforeUnloadEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) => { var beforeUnloadEventHandlerFunc = (e = event) => { var confirmationMessage = getWasmTableEntry(callbackfunc)(eventTypeId, 0, userData); if (confirmationMessage) {
            confirmationMessage = UTF8ToString(confirmationMessage);
        } if (confirmationMessage) {
            e.preventDefault();
            e.returnValue = confirmationMessage;
            return confirmationMessage;
        } }; var eventHandler = { target: findEventTarget(target), eventTypeString, callbackfunc, handlerFunc: beforeUnloadEventHandlerFunc, useCapture }; return JSEvents.registerOrRemoveHandler(eventHandler); };
        var _emscripten_set_beforeunload_callback_on_thread = (userData, callbackfunc, targetThread) => { if (typeof onbeforeunload == "undefined")
            return -1; if (targetThread !== 1)
            return -5; return registerBeforeUnloadEventCallback(2, userData, true, callbackfunc, 28, "beforeunload"); };
        _emscripten_set_beforeunload_callback_on_thread.sig = "ippp";
        var registerFocusEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => { JSEvents.focusEvent || (JSEvents.focusEvent = _malloc(256)); var focusEventHandlerFunc = (e = event) => { var nodeName = JSEvents.getNodeNameForTarget(e.target); var id = e.target.id ? e.target.id : ""; var focusEvent = JSEvents.focusEvent; stringToUTF8(nodeName, focusEvent + 0, 128); stringToUTF8(id, focusEvent + 128, 128); if (getWasmTableEntry(callbackfunc)(eventTypeId, focusEvent, userData))
            e.preventDefault(); }; var eventHandler = { target: findEventTarget(target), eventTypeString, callbackfunc, handlerFunc: focusEventHandlerFunc, useCapture }; return JSEvents.registerOrRemoveHandler(eventHandler); };
        var _emscripten_set_blur_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerFocusEventCallback(target, userData, useCapture, callbackfunc, 12, "blur", targetThread);
        _emscripten_set_blur_callback_on_thread.sig = "ippipp";
        var _emscripten_set_element_css_size = (target, width, height) => { target = findEventTarget(target); if (!target)
            return -4; target.style.width = width + "px"; target.style.height = height + "px"; return 0; };
        _emscripten_set_element_css_size.sig = "ipdd";
        var _emscripten_set_focus_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerFocusEventCallback(target, userData, useCapture, callbackfunc, 13, "focus", targetThread);
        _emscripten_set_focus_callback_on_thread.sig = "ippipp";
        var fillFullscreenChangeEventData = eventStruct => { var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement; var isFullscreen = !!fullscreenElement; HEAP8[eventStruct] = isFullscreen; HEAP8[eventStruct + 1] = JSEvents.fullscreenEnabled(); var reportedElement = isFullscreen ? fullscreenElement : JSEvents.previousFullscreenElement; var nodeName = JSEvents.getNodeNameForTarget(reportedElement); var id = reportedElement?.id || ""; stringToUTF8(nodeName, eventStruct + 2, 128); stringToUTF8(id, eventStruct + 130, 128); HEAP32[eventStruct + 260 >> 2] = reportedElement ? reportedElement.clientWidth : 0; HEAP32[eventStruct + 264 >> 2] = reportedElement ? reportedElement.clientHeight : 0; HEAP32[eventStruct + 268 >> 2] = screen.width; HEAP32[eventStruct + 272 >> 2] = screen.height; if (isFullscreen) {
            JSEvents.previousFullscreenElement = fullscreenElement;
        } };
        var registerFullscreenChangeEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => { JSEvents.fullscreenChangeEvent || (JSEvents.fullscreenChangeEvent = _malloc(276)); var fullscreenChangeEventhandlerFunc = (e = event) => { var fullscreenChangeEvent = JSEvents.fullscreenChangeEvent; fillFullscreenChangeEventData(fullscreenChangeEvent); if (getWasmTableEntry(callbackfunc)(eventTypeId, fullscreenChangeEvent, userData))
            e.preventDefault(); }; var eventHandler = { target, eventTypeString, callbackfunc, handlerFunc: fullscreenChangeEventhandlerFunc, useCapture }; return JSEvents.registerOrRemoveHandler(eventHandler); };
        var _emscripten_set_fullscreenchange_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => { if (!JSEvents.fullscreenEnabled())
            return -1; target = findEventTarget(target); if (!target)
            return -4; registerFullscreenChangeEventCallback(target, userData, useCapture, callbackfunc, 19, "webkitfullscreenchange", targetThread); return registerFullscreenChangeEventCallback(target, userData, useCapture, callbackfunc, 19, "fullscreenchange", targetThread); };
        _emscripten_set_fullscreenchange_callback_on_thread.sig = "ippipp";
        var registerGamepadEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => { JSEvents.gamepadEvent || (JSEvents.gamepadEvent = _malloc(1240)); var gamepadEventHandlerFunc = (e = event) => { var gamepadEvent = JSEvents.gamepadEvent; fillGamepadEventData(gamepadEvent, e["gamepad"]); if (getWasmTableEntry(callbackfunc)(eventTypeId, gamepadEvent, userData))
            e.preventDefault(); }; var eventHandler = { target: findEventTarget(target), allowsDeferredCalls: true, eventTypeString, callbackfunc, handlerFunc: gamepadEventHandlerFunc, useCapture }; return JSEvents.registerOrRemoveHandler(eventHandler); };
        var _emscripten_set_gamepadconnected_callback_on_thread = (userData, useCapture, callbackfunc, targetThread) => { if (_emscripten_sample_gamepad_data())
            return -1; return registerGamepadEventCallback(2, userData, useCapture, callbackfunc, 26, "gamepadconnected", targetThread); };
        _emscripten_set_gamepadconnected_callback_on_thread.sig = "ipipp";
        var _emscripten_set_gamepaddisconnected_callback_on_thread = (userData, useCapture, callbackfunc, targetThread) => { if (_emscripten_sample_gamepad_data())
            return -1; return registerGamepadEventCallback(2, userData, useCapture, callbackfunc, 27, "gamepaddisconnected", targetThread); };
        _emscripten_set_gamepaddisconnected_callback_on_thread.sig = "ipipp";
        var registerKeyEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => { JSEvents.keyEvent || (JSEvents.keyEvent = _malloc(160)); var keyEventHandlerFunc = e => { var keyEventData = JSEvents.keyEvent; HEAPF64[keyEventData >> 3] = e.timeStamp; var idx = keyEventData >> 2; HEAP32[idx + 2] = e.location; HEAP8[keyEventData + 12] = e.ctrlKey; HEAP8[keyEventData + 13] = e.shiftKey; HEAP8[keyEventData + 14] = e.altKey; HEAP8[keyEventData + 15] = e.metaKey; HEAP8[keyEventData + 16] = e.repeat; HEAP32[idx + 5] = e.charCode; HEAP32[idx + 6] = e.keyCode; HEAP32[idx + 7] = e.which; stringToUTF8(e.key || "", keyEventData + 32, 32); stringToUTF8(e.code || "", keyEventData + 64, 32); stringToUTF8(e.char || "", keyEventData + 96, 32); stringToUTF8(e.locale || "", keyEventData + 128, 32); if (getWasmTableEntry(callbackfunc)(eventTypeId, keyEventData, userData))
            e.preventDefault(); }; var eventHandler = { target: findEventTarget(target), eventTypeString, callbackfunc, handlerFunc: keyEventHandlerFunc, useCapture }; return JSEvents.registerOrRemoveHandler(eventHandler); };
        var _emscripten_set_keydown_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerKeyEventCallback(target, userData, useCapture, callbackfunc, 2, "keydown", targetThread);
        _emscripten_set_keydown_callback_on_thread.sig = "ippipp";
        var _emscripten_set_keypress_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerKeyEventCallback(target, userData, useCapture, callbackfunc, 1, "keypress", targetThread);
        _emscripten_set_keypress_callback_on_thread.sig = "ippipp";
        var _emscripten_set_keyup_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerKeyEventCallback(target, userData, useCapture, callbackfunc, 3, "keyup", targetThread);
        _emscripten_set_keyup_callback_on_thread.sig = "ippipp";
        var _emscripten_set_main_loop_arg = (func, arg, fps, simulateInfiniteLoop) => { var iterFunc = () => getWasmTableEntry(func)(arg); setMainLoop(iterFunc, fps, simulateInfiniteLoop, arg); };
        _emscripten_set_main_loop_arg.sig = "vppii";
        var fillMouseEventData = (eventStruct, e, target) => { HEAPF64[eventStruct >> 3] = e.timeStamp; var idx = eventStruct >> 2; HEAP32[idx + 2] = e.screenX; HEAP32[idx + 3] = e.screenY; HEAP32[idx + 4] = e.clientX; HEAP32[idx + 5] = e.clientY; HEAP8[eventStruct + 24] = e.ctrlKey; HEAP8[eventStruct + 25] = e.shiftKey; HEAP8[eventStruct + 26] = e.altKey; HEAP8[eventStruct + 27] = e.metaKey; HEAP16[idx * 2 + 14] = e.button; HEAP16[idx * 2 + 15] = e.buttons; HEAP32[idx + 8] = e["movementX"]; HEAP32[idx + 9] = e["movementY"]; var rect = getBoundingClientRect(target); HEAP32[idx + 10] = e.clientX - (rect.left | 0); HEAP32[idx + 11] = e.clientY - (rect.top | 0); };
        var registerMouseEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => { JSEvents.mouseEvent || (JSEvents.mouseEvent = _malloc(64)); target = findEventTarget(target); var mouseEventHandlerFunc = (e = event) => { fillMouseEventData(JSEvents.mouseEvent, e, target); if (getWasmTableEntry(callbackfunc)(eventTypeId, JSEvents.mouseEvent, userData))
            e.preventDefault(); }; var eventHandler = { target, allowsDeferredCalls: eventTypeString != "mousemove" && eventTypeString != "mouseenter" && eventTypeString != "mouseleave", eventTypeString, callbackfunc, handlerFunc: mouseEventHandlerFunc, useCapture }; return JSEvents.registerOrRemoveHandler(eventHandler); };
        var _emscripten_set_mousedown_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerMouseEventCallback(target, userData, useCapture, callbackfunc, 5, "mousedown", targetThread);
        _emscripten_set_mousedown_callback_on_thread.sig = "ippipp";
        var _emscripten_set_mouseenter_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerMouseEventCallback(target, userData, useCapture, callbackfunc, 33, "mouseenter", targetThread);
        _emscripten_set_mouseenter_callback_on_thread.sig = "ippipp";
        var _emscripten_set_mouseleave_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerMouseEventCallback(target, userData, useCapture, callbackfunc, 34, "mouseleave", targetThread);
        _emscripten_set_mouseleave_callback_on_thread.sig = "ippipp";
        var _emscripten_set_mousemove_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerMouseEventCallback(target, userData, useCapture, callbackfunc, 8, "mousemove", targetThread);
        _emscripten_set_mousemove_callback_on_thread.sig = "ippipp";
        var _emscripten_set_mouseup_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerMouseEventCallback(target, userData, useCapture, callbackfunc, 6, "mouseup", targetThread);
        _emscripten_set_mouseup_callback_on_thread.sig = "ippipp";
        var fillPointerlockChangeEventData = eventStruct => { var pointerLockElement = document.pointerLockElement; var isPointerlocked = !!pointerLockElement; HEAP8[eventStruct] = isPointerlocked; var nodeName = JSEvents.getNodeNameForTarget(pointerLockElement); var id = pointerLockElement?.id || ""; stringToUTF8(nodeName, eventStruct + 1, 128); stringToUTF8(id, eventStruct + 129, 128); };
        var registerPointerlockChangeEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => { JSEvents.pointerlockChangeEvent || (JSEvents.pointerlockChangeEvent = _malloc(257)); var pointerlockChangeEventHandlerFunc = (e = event) => { var pointerlockChangeEvent = JSEvents.pointerlockChangeEvent; fillPointerlockChangeEventData(pointerlockChangeEvent); if (getWasmTableEntry(callbackfunc)(eventTypeId, pointerlockChangeEvent, userData))
            e.preventDefault(); }; var eventHandler = { target, eventTypeString, callbackfunc, handlerFunc: pointerlockChangeEventHandlerFunc, useCapture }; return JSEvents.registerOrRemoveHandler(eventHandler); };
        var _emscripten_set_pointerlockchange_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => { if (!document.body?.requestPointerLock) {
            return -1;
        } target = findEventTarget(target); if (!target)
            return -4; return registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "pointerlockchange", targetThread); };
        _emscripten_set_pointerlockchange_callback_on_thread.sig = "ippipp";
        var registerUiEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => { JSEvents.uiEvent || (JSEvents.uiEvent = _malloc(36)); target = findEventTarget(target); var uiEventHandlerFunc = (e = event) => { if (e.target != target) {
            return;
        } var b = document.body; if (!b) {
            return;
        } var uiEvent = JSEvents.uiEvent; HEAP32[uiEvent >> 2] = 0; HEAP32[uiEvent + 4 >> 2] = b.clientWidth; HEAP32[uiEvent + 8 >> 2] = b.clientHeight; HEAP32[uiEvent + 12 >> 2] = innerWidth; HEAP32[uiEvent + 16 >> 2] = innerHeight; HEAP32[uiEvent + 20 >> 2] = outerWidth; HEAP32[uiEvent + 24 >> 2] = outerHeight; HEAP32[uiEvent + 28 >> 2] = pageXOffset | 0; HEAP32[uiEvent + 32 >> 2] = pageYOffset | 0; if (getWasmTableEntry(callbackfunc)(eventTypeId, uiEvent, userData))
            e.preventDefault(); }; var eventHandler = { target, eventTypeString, callbackfunc, handlerFunc: uiEventHandlerFunc, useCapture }; return JSEvents.registerOrRemoveHandler(eventHandler); };
        var _emscripten_set_resize_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerUiEventCallback(target, userData, useCapture, callbackfunc, 10, "resize", targetThread);
        _emscripten_set_resize_callback_on_thread.sig = "ippipp";
        var _emscripten_set_timeout = (cb, msecs, userData) => safeSetTimeout(() => getWasmTableEntry(cb)(userData), msecs);
        _emscripten_set_timeout.sig = "ipdp";
        var registerTouchEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => { JSEvents.touchEvent || (JSEvents.touchEvent = _malloc(1552)); target = findEventTarget(target); var touchEventHandlerFunc = e => { var t, touches = {}, et = e.touches; for (let t of et) {
            t.isChanged = t.onTarget = 0;
            touches[t.identifier] = t;
        } for (let t of e.changedTouches) {
            t.isChanged = 1;
            touches[t.identifier] = t;
        } for (let t of e.targetTouches) {
            touches[t.identifier].onTarget = 1;
        } var touchEvent = JSEvents.touchEvent; HEAPF64[touchEvent >> 3] = e.timeStamp; HEAP8[touchEvent + 12] = e.ctrlKey; HEAP8[touchEvent + 13] = e.shiftKey; HEAP8[touchEvent + 14] = e.altKey; HEAP8[touchEvent + 15] = e.metaKey; var idx = touchEvent + 16; var targetRect = getBoundingClientRect(target); var numTouches = 0; for (let t of Object.values(touches)) {
            var idx32 = idx >> 2;
            HEAP32[idx32 + 0] = t.identifier;
            HEAP32[idx32 + 1] = t.screenX;
            HEAP32[idx32 + 2] = t.screenY;
            HEAP32[idx32 + 3] = t.clientX;
            HEAP32[idx32 + 4] = t.clientY;
            HEAP32[idx32 + 5] = t.pageX;
            HEAP32[idx32 + 6] = t.pageY;
            HEAP8[idx + 28] = t.isChanged;
            HEAP8[idx + 29] = t.onTarget;
            HEAP32[idx32 + 8] = t.clientX - (targetRect.left | 0);
            HEAP32[idx32 + 9] = t.clientY - (targetRect.top | 0);
            idx += 48;
            if (++numTouches > 31) {
                break;
            }
        } HEAP32[touchEvent + 8 >> 2] = numTouches; if (getWasmTableEntry(callbackfunc)(eventTypeId, touchEvent, userData))
            e.preventDefault(); }; var eventHandler = { target, allowsDeferredCalls: eventTypeString == "touchstart" || eventTypeString == "touchend", eventTypeString, callbackfunc, handlerFunc: touchEventHandlerFunc, useCapture }; return JSEvents.registerOrRemoveHandler(eventHandler); };
        var _emscripten_set_touchcancel_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerTouchEventCallback(target, userData, useCapture, callbackfunc, 25, "touchcancel", targetThread);
        _emscripten_set_touchcancel_callback_on_thread.sig = "ippipp";
        var _emscripten_set_touchend_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerTouchEventCallback(target, userData, useCapture, callbackfunc, 23, "touchend", targetThread);
        _emscripten_set_touchend_callback_on_thread.sig = "ippipp";
        var _emscripten_set_touchmove_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerTouchEventCallback(target, userData, useCapture, callbackfunc, 24, "touchmove", targetThread);
        _emscripten_set_touchmove_callback_on_thread.sig = "ippipp";
        var _emscripten_set_touchstart_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerTouchEventCallback(target, userData, useCapture, callbackfunc, 22, "touchstart", targetThread);
        _emscripten_set_touchstart_callback_on_thread.sig = "ippipp";
        var fillVisibilityChangeEventData = eventStruct => { var visibilityStates = ["hidden", "visible", "prerender", "unloaded"]; var visibilityState = visibilityStates.indexOf(document.visibilityState); HEAP8[eventStruct] = document.hidden; HEAP32[eventStruct + 4 >> 2] = visibilityState; };
        var registerVisibilityChangeEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => { JSEvents.visibilityChangeEvent || (JSEvents.visibilityChangeEvent = _malloc(8)); var visibilityChangeEventHandlerFunc = (e = event) => { var visibilityChangeEvent = JSEvents.visibilityChangeEvent; fillVisibilityChangeEventData(visibilityChangeEvent); if (getWasmTableEntry(callbackfunc)(eventTypeId, visibilityChangeEvent, userData))
            e.preventDefault(); }; var eventHandler = { target, eventTypeString, callbackfunc, handlerFunc: visibilityChangeEventHandlerFunc, useCapture }; return JSEvents.registerOrRemoveHandler(eventHandler); };
        var _emscripten_set_visibilitychange_callback_on_thread = (userData, useCapture, callbackfunc, targetThread) => registerVisibilityChangeEventCallback(specialHTMLTargets[1], userData, useCapture, callbackfunc, 21, "visibilitychange", targetThread);
        _emscripten_set_visibilitychange_callback_on_thread.sig = "ipipp";
        var registerWheelEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => { JSEvents.wheelEvent || (JSEvents.wheelEvent = _malloc(96)); var wheelHandlerFunc = (e = event) => { var wheelEvent = JSEvents.wheelEvent; fillMouseEventData(wheelEvent, e, target); HEAPF64[wheelEvent + 64 >> 3] = e["deltaX"]; HEAPF64[wheelEvent + 72 >> 3] = e["deltaY"]; HEAPF64[wheelEvent + 80 >> 3] = e["deltaZ"]; HEAP32[wheelEvent + 88 >> 2] = e["deltaMode"]; if (getWasmTableEntry(callbackfunc)(eventTypeId, wheelEvent, userData))
            e.preventDefault(); }; var eventHandler = { target, allowsDeferredCalls: true, eventTypeString, callbackfunc, handlerFunc: wheelHandlerFunc, useCapture }; return JSEvents.registerOrRemoveHandler(eventHandler); };
        var _emscripten_set_wheel_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => { target = findEventTarget(target); if (!target)
            return -4; if (typeof target.onwheel != "undefined") {
            return registerWheelEventCallback(target, userData, useCapture, callbackfunc, 9, "wheel", targetThread);
        }
        else {
            return -1;
        } };
        _emscripten_set_wheel_callback_on_thread.sig = "ippipp";
        var _emscripten_set_window_title = title => document.title = UTF8ToString(title);
        _emscripten_set_window_title.sig = "vp";
        var _emscripten_sleep = () => { throw "Please compile your program with async support in order to use asynchronous operations like emscripten_sleep"; };
        _emscripten_sleep.sig = "vi";
        var _emscripten_wget_data = (url, pbuffer, pnum, perror) => { throw "Please compile your program with async support in order to use asynchronous operations like emscripten_wget_data"; };
        _emscripten_wget_data.sig = "vpppp";
        var ENV = {};
        var getEnvStrings = () => { if (!getEnvStrings.strings) {
            var lang = (typeof navigator == "object" && navigator.language || "C").replace("-", "_") + ".UTF-8";
            var env = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: lang, _: getExecutableName() };
            for (var x in ENV) {
                if (ENV[x] === undefined)
                    delete env[x];
                else
                    env[x] = ENV[x];
            }
            var strings = [];
            for (var x in env) {
                strings.push(`${x}=${env[x]}`);
            }
            getEnvStrings.strings = strings;
        } return getEnvStrings.strings; };
        var _environ_get = (__environ, environ_buf) => { var bufSize = 0; var envp = 0; for (var string of getEnvStrings()) {
            var ptr = environ_buf + bufSize;
            HEAPU32[__environ + envp >> 2] = ptr;
            bufSize += stringToUTF8(string, ptr, Infinity) + 1;
            envp += 4;
        } return 0; };
        _environ_get.sig = "ipp";
        var _environ_sizes_get = (penviron_count, penviron_buf_size) => { var strings = getEnvStrings(); HEAPU32[penviron_count >> 2] = strings.length; var bufSize = 0; for (var string of strings) {
            bufSize += lengthBytesUTF8(string) + 1;
        } HEAPU32[penviron_buf_size >> 2] = bufSize; return 0; };
        _environ_sizes_get.sig = "ipp";
        function _fd_close(fd) { try {
            var stream = SYSCALLS.getStreamFromFD(fd);
            FS.close(stream);
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return e.errno;
        } }
        _fd_close.sig = "ii";
        function _fd_fdstat_get(fd, pbuf) { try {
            var rightsBase = 0;
            var rightsInheriting = 0;
            var flags = 0;
            {
                var stream = SYSCALLS.getStreamFromFD(fd);
                var type = stream.tty ? 2 : FS.isDir(stream.mode) ? 3 : FS.isLink(stream.mode) ? 7 : 4;
            }
            HEAP8[pbuf] = type;
            HEAP16[pbuf + 2 >> 1] = flags;
            HEAP64[pbuf + 8 >> 3] = BigInt(rightsBase);
            HEAP64[pbuf + 16 >> 3] = BigInt(rightsInheriting);
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return e.errno;
        } }
        _fd_fdstat_get.sig = "iip";
        var doReadv = (stream, iov, iovcnt, offset) => { var ret = 0; for (var i = 0; i < iovcnt; i++) {
            var ptr = HEAPU32[iov >> 2];
            var len = HEAPU32[iov + 4 >> 2];
            iov += 8;
            var curr = FS.read(stream, HEAP8, ptr, len, offset);
            if (curr < 0)
                return -1;
            ret += curr;
            if (curr < len)
                break;
            if (typeof offset != "undefined") {
                offset += curr;
            }
        } return ret; };
        function _fd_pread(fd, iov, iovcnt, offset, pnum) { offset = bigintToI53Checked(offset); try {
            if (isNaN(offset))
                return 61;
            var stream = SYSCALLS.getStreamFromFD(fd);
            var num = doReadv(stream, iov, iovcnt, offset);
            HEAPU32[pnum >> 2] = num;
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return e.errno;
        } }
        _fd_pread.sig = "iippjp";
        var doWritev = (stream, iov, iovcnt, offset) => { var ret = 0; for (var i = 0; i < iovcnt; i++) {
            var ptr = HEAPU32[iov >> 2];
            var len = HEAPU32[iov + 4 >> 2];
            iov += 8;
            var curr = FS.write(stream, HEAP8, ptr, len, offset);
            if (curr < 0)
                return -1;
            ret += curr;
            if (curr < len) {
                break;
            }
            if (typeof offset != "undefined") {
                offset += curr;
            }
        } return ret; };
        function _fd_pwrite(fd, iov, iovcnt, offset, pnum) { offset = bigintToI53Checked(offset); try {
            if (isNaN(offset))
                return 61;
            var stream = SYSCALLS.getStreamFromFD(fd);
            var num = doWritev(stream, iov, iovcnt, offset);
            HEAPU32[pnum >> 2] = num;
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return e.errno;
        } }
        _fd_pwrite.sig = "iippjp";
        function _fd_read(fd, iov, iovcnt, pnum) { try {
            var stream = SYSCALLS.getStreamFromFD(fd);
            var num = doReadv(stream, iov, iovcnt);
            HEAPU32[pnum >> 2] = num;
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return e.errno;
        } }
        _fd_read.sig = "iippp";
        function _fd_seek(fd, offset, whence, newOffset) { offset = bigintToI53Checked(offset); try {
            if (isNaN(offset))
                return 61;
            var stream = SYSCALLS.getStreamFromFD(fd);
            FS.llseek(stream, offset, whence);
            HEAP64[newOffset >> 3] = BigInt(stream.position);
            if (stream.getdents && offset === 0 && whence === 0)
                stream.getdents = null;
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return e.errno;
        } }
        _fd_seek.sig = "iijip";
        function _fd_sync(fd) { try {
            var stream = SYSCALLS.getStreamFromFD(fd);
            if (stream.stream_ops?.fsync) {
                return stream.stream_ops.fsync(stream);
            }
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return e.errno;
        } }
        _fd_sync.sig = "ii";
        function _fd_write(fd, iov, iovcnt, pnum) { try {
            var stream = SYSCALLS.getStreamFromFD(fd);
            var num = doWritev(stream, iov, iovcnt);
            HEAPU32[pnum >> 2] = num;
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return e.errno;
        } }
        _fd_write.sig = "iippp";
        var _getaddrinfo = (node, service, hint, out) => { var addrs = []; var canon = null; var addr = 0; var port = 0; var flags = 0; var family = 0; var type = 0; var proto = 0; var ai, last; function allocaddrinfo(family, type, proto, canon, addr, port) { var sa, salen, ai; var errno; salen = family === 10 ? 28 : 16; addr = family === 10 ? inetNtop6(addr) : inetNtop4(addr); sa = _malloc(salen); errno = writeSockaddr(sa, family, addr, port); assert(!errno); ai = _malloc(32); HEAP32[ai + 4 >> 2] = family; HEAP32[ai + 8 >> 2] = type; HEAP32[ai + 12 >> 2] = proto; HEAPU32[ai + 24 >> 2] = canon; HEAPU32[ai + 20 >> 2] = sa; if (family === 10) {
            HEAP32[ai + 16 >> 2] = 28;
        }
        else {
            HEAP32[ai + 16 >> 2] = 16;
        } HEAP32[ai + 28 >> 2] = 0; return ai; } if (hint) {
            flags = HEAP32[hint >> 2];
            family = HEAP32[hint + 4 >> 2];
            type = HEAP32[hint + 8 >> 2];
            proto = HEAP32[hint + 12 >> 2];
        } if (type && !proto) {
            proto = type === 2 ? 17 : 6;
        } if (!type && proto) {
            type = proto === 17 ? 2 : 1;
        } if (proto === 0) {
            proto = 6;
        } if (type === 0) {
            type = 1;
        } if (!node && !service) {
            return -2;
        } if (flags & ~(1 | 2 | 4 | 1024 | 8 | 16 | 32)) {
            return -1;
        } if (hint !== 0 && HEAP32[hint >> 2] & 2 && !node) {
            return -1;
        } if (flags & 32) {
            return -2;
        } if (type !== 0 && type !== 1 && type !== 2) {
            return -7;
        } if (family !== 0 && family !== 2 && family !== 10) {
            return -6;
        } if (service) {
            service = UTF8ToString(service);
            port = parseInt(service, 10);
            if (isNaN(port)) {
                if (flags & 1024) {
                    return -2;
                }
                return -8;
            }
        } if (!node) {
            if (family === 0) {
                family = 2;
            }
            if ((flags & 1) === 0) {
                if (family === 2) {
                    addr = _htonl(2130706433);
                }
                else {
                    addr = [0, 0, 0, _htonl(1)];
                }
            }
            ai = allocaddrinfo(family, type, proto, null, addr, port);
            HEAPU32[out >> 2] = ai;
            return 0;
        } node = UTF8ToString(node); addr = inetPton4(node); if (addr !== null) {
            if (family === 0 || family === 2) {
                family = 2;
            }
            else if (family === 10 && flags & 8) {
                addr = [0, 0, _htonl(65535), addr];
                family = 10;
            }
            else {
                return -2;
            }
        }
        else {
            addr = inetPton6(node);
            if (addr !== null) {
                if (family === 0 || family === 10) {
                    family = 10;
                }
                else {
                    return -2;
                }
            }
        } if (addr != null) {
            ai = allocaddrinfo(family, type, proto, node, addr, port);
            HEAPU32[out >> 2] = ai;
            return 0;
        } if (flags & 4) {
            return -2;
        } node = DNS.lookup_name(node); addr = inetPton4(node); if (family === 0) {
            family = 2;
        }
        else if (family === 10) {
            addr = [0, 0, _htonl(65535), addr];
        } ai = allocaddrinfo(family, type, proto, null, addr, port); HEAPU32[out >> 2] = ai; return 0; };
        _getaddrinfo.sig = "ipppp";
        var _getnameinfo = (sa, salen, node, nodelen, serv, servlen, flags) => { var info = readSockaddr(sa, salen); if (info.errno) {
            return -6;
        } var port = info.port; var addr = info.addr; var overflowed = false; if (node && nodelen) {
            var lookup;
            if (flags & 1 || !(lookup = DNS.lookup_addr(addr))) {
                if (flags & 8) {
                    return -2;
                }
            }
            else {
                addr = lookup;
            }
            var numBytesWrittenExclNull = stringToUTF8(addr, node, nodelen);
            if (numBytesWrittenExclNull + 1 >= nodelen) {
                overflowed = true;
            }
        } if (serv && servlen) {
            port = "" + port;
            var numBytesWrittenExclNull = stringToUTF8(port, serv, servlen);
            if (numBytesWrittenExclNull + 1 >= servlen) {
                overflowed = true;
            }
        } if (overflowed) {
            return -12;
        } return 0; };
        _getnameinfo.sig = "ipipipii";
        function _random_get(buffer, size) { try {
            randomFill(HEAPU8.subarray(buffer, buffer + size));
            return 0;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return e.errno;
        } }
        _random_get.sig = "ipp";
        function _recvfrom_js(sockfd, buf, len, flags, src_addr, addrlen) { return moduleArg.recvfrom?.(sockfd, buf, len, flags, src_addr, addrlen) ?? -1; }
        function _sendto_js(sockfd, packets, sizes, packet_count, seq_num, to, to_len) { return moduleArg.sendto?.(sockfd, packets, sizes, packet_count, seq_num, to, to_len) ?? 0; }
        var getCFunc = ident => { var func = Module["_" + ident]; return func; };
        var writeArrayToMemory = (array, buffer) => { HEAP8.set(array, buffer); };
        var ccall = (ident, returnType, argTypes, args, opts) => { var toC = { string: str => { var ret = 0; if (str !== null && str !== undefined && str !== 0) {
                ret = stringToUTF8OnStack(str);
            } return ret; }, array: arr => { var ret = stackAlloc(arr.length); writeArrayToMemory(arr, ret); return ret; } }; function convertReturnValue(ret) { if (returnType === "string") {
            return UTF8ToString(ret);
        } if (returnType === "boolean")
            return Boolean(ret); return ret; } var func = getCFunc(ident); var cArgs = []; var stack = 0; if (args) {
            for (var i = 0; i < args.length; i++) {
                var converter = toC[argTypes[i]];
                if (converter) {
                    if (stack === 0)
                        stack = stackSave();
                    cArgs[i] = converter(args[i]);
                }
                else {
                    cArgs[i] = args[i];
                }
            }
        } var ret = func(...cArgs); function onDone(ret) { if (stack !== 0)
            stackRestore(stack); return convertReturnValue(ret); } ret = onDone(ret); return ret; };
        var createContext = Browser.createContext;
        var writeI53ToI64Clamped = (ptr, num) => { if (num > 0x8000000000000000) {
            HEAPU32[ptr >> 2] = 4294967295;
            HEAPU32[ptr + 4 >> 2] = 2147483647;
        }
        else if (num < -0x8000000000000000) {
            HEAPU32[ptr >> 2] = 0;
            HEAPU32[ptr + 4 >> 2] = 2147483648;
        }
        else {
            writeI53ToI64(ptr, num);
        } };
        var writeI53ToI64Signaling = (ptr, num) => { if (num > 0x8000000000000000 || num < -0x8000000000000000) {
            throw `RangeError: ${num}`;
        } writeI53ToI64(ptr, num); };
        var writeI53ToU64Clamped = (ptr, num) => { if (num > 0x10000000000000000) {
            HEAPU32[ptr >> 2] = 4294967295;
            HEAPU32[ptr + 4 >> 2] = 4294967295;
        }
        else if (num < 0) {
            HEAPU32[ptr >> 2] = 0;
            HEAPU32[ptr + 4 >> 2] = 0;
        }
        else {
            writeI53ToI64(ptr, num);
        } };
        var writeI53ToU64Signaling = (ptr, num) => { if (num < 0 || num > 0x10000000000000000) {
            throw `RangeError: ${num}`;
        } writeI53ToI64(ptr, num); };
        var readI53FromU64 = ptr => HEAPU32[ptr >> 2] + HEAPU32[ptr + 4 >> 2] * 4294967296;
        var convertI32PairToI53 = (lo, hi) => (lo >>> 0) + hi * 4294967296;
        var convertI32PairToI53Checked = (lo, hi) => hi + 2097152 >>> 0 < 4194305 - !!lo ? (lo >>> 0) + hi * 4294967296 : NaN;
        var convertU32PairToI53 = (lo, hi) => (lo >>> 0) + (hi >>> 0) * 4294967296;
        var getTempRet0 = val => __emscripten_tempret_get();
        var setTempRet0 = val => __emscripten_tempret_set(val);
        var _stackAlloc = stackAlloc;
        var _stackSave = stackSave;
        var _stackRestore = stackSave;
        var _setTempRet0 = setTempRet0;
        var _getTempRet0 = getTempRet0;
        var _emscripten_notify_memory_growth = memoryIndex => { updateMemoryViews(); };
        _emscripten_notify_memory_growth.sig = "vp";
        var ERRNO_CODES = { EPERM: 63, ENOENT: 44, ESRCH: 71, EINTR: 27, EIO: 29, ENXIO: 60, E2BIG: 1, ENOEXEC: 45, EBADF: 8, ECHILD: 12, EAGAIN: 6, EWOULDBLOCK: 6, ENOMEM: 48, EACCES: 2, EFAULT: 21, ENOTBLK: 105, EBUSY: 10, EEXIST: 20, EXDEV: 75, ENODEV: 43, ENOTDIR: 54, EISDIR: 31, EINVAL: 28, ENFILE: 41, EMFILE: 33, ENOTTY: 59, ETXTBSY: 74, EFBIG: 22, ENOSPC: 51, ESPIPE: 70, EROFS: 69, EMLINK: 34, EPIPE: 64, EDOM: 18, ERANGE: 68, ENOMSG: 49, EIDRM: 24, ECHRNG: 106, EL2NSYNC: 156, EL3HLT: 107, EL3RST: 108, ELNRNG: 109, EUNATCH: 110, ENOCSI: 111, EL2HLT: 112, EDEADLK: 16, ENOLCK: 46, EBADE: 113, EBADR: 114, EXFULL: 115, ENOANO: 104, EBADRQC: 103, EBADSLT: 102, EDEADLOCK: 16, EBFONT: 101, ENOSTR: 100, ENODATA: 116, ETIME: 117, ENOSR: 118, ENONET: 119, ENOPKG: 120, EREMOTE: 121, ENOLINK: 47, EADV: 122, ESRMNT: 123, ECOMM: 124, EPROTO: 65, EMULTIHOP: 36, EDOTDOT: 125, EBADMSG: 9, ENOTUNIQ: 126, EBADFD: 127, EREMCHG: 128, ELIBACC: 129, ELIBBAD: 130, ELIBSCN: 131, ELIBMAX: 132, ELIBEXEC: 133, ENOSYS: 52, ENOTEMPTY: 55, ENAMETOOLONG: 37, ELOOP: 32, EOPNOTSUPP: 138, EPFNOSUPPORT: 139, ECONNRESET: 15, ENOBUFS: 42, EAFNOSUPPORT: 5, EPROTOTYPE: 67, ENOTSOCK: 57, ENOPROTOOPT: 50, ESHUTDOWN: 140, ECONNREFUSED: 14, EADDRINUSE: 3, ECONNABORTED: 13, ENETUNREACH: 40, ENETDOWN: 38, ETIMEDOUT: 73, EHOSTDOWN: 142, EHOSTUNREACH: 23, EINPROGRESS: 26, EALREADY: 7, EDESTADDRREQ: 17, EMSGSIZE: 35, EPROTONOSUPPORT: 66, ESOCKTNOSUPPORT: 137, EADDRNOTAVAIL: 4, ENETRESET: 39, EISCONN: 30, ENOTCONN: 53, ETOOMANYREFS: 141, EUSERS: 136, EDQUOT: 19, ESTALE: 72, ENOTSUP: 138, ENOMEDIUM: 148, EILSEQ: 25, EOVERFLOW: 61, ECANCELED: 11, ENOTRECOVERABLE: 56, EOWNERDEAD: 62, ESTRPIPE: 135 };
        var strError = errno => UTF8ToString(_strerror(errno));
        var Protocols = { list: [], map: {} };
        var stringToAscii = (str, buffer) => { for (var i = 0; i < str.length; ++i) {
            HEAP8[buffer++] = str.charCodeAt(i);
        } HEAP8[buffer] = 0; };
        var _setprotoent = stayopen => { function allocprotoent(name, proto, aliases) { var nameBuf = _malloc(name.length + 1); stringToAscii(name, nameBuf); var j = 0; var length = aliases.length; var aliasListBuf = _malloc((length + 1) * 4); for (var i = 0; i < length; i++, j += 4) {
            var alias = aliases[i];
            var aliasBuf = _malloc(alias.length + 1);
            stringToAscii(alias, aliasBuf);
            HEAPU32[aliasListBuf + j >> 2] = aliasBuf;
        } HEAPU32[aliasListBuf + j >> 2] = 0; var pe = _malloc(12); HEAPU32[pe >> 2] = nameBuf; HEAPU32[pe + 4 >> 2] = aliasListBuf; HEAP32[pe + 8 >> 2] = proto; return pe; } var list = Protocols.list; var map = Protocols.map; if (list.length === 0) {
            var entry = allocprotoent("tcp", 6, ["TCP"]);
            list.push(entry);
            map["tcp"] = map["6"] = entry;
            entry = allocprotoent("udp", 17, ["UDP"]);
            list.push(entry);
            map["udp"] = map["17"] = entry;
        } _setprotoent.index = 0; };
        _setprotoent.sig = "vi";
        var _endprotoent = () => { };
        _endprotoent.sig = "v";
        var _getprotoent = number => { if (_setprotoent.index === Protocols.list.length) {
            return 0;
        } var result = Protocols.list[_setprotoent.index++]; return result; };
        _getprotoent.sig = "p";
        var _getprotobyname = name => { name = UTF8ToString(name); _setprotoent(true); var result = Protocols.map[name]; return result; };
        _getprotobyname.sig = "pp";
        var _getprotobynumber = number => { _setprotoent(true); var result = Protocols.map[number]; return result; };
        _getprotobynumber.sig = "pi";
        var Sockets = { BUFFER_SIZE: 10240, MAX_BUFFER_SIZE: 10485760, nextFd: 1, fds: {}, nextport: 1, maxport: 65535, peer: null, connections: {}, portmap: {}, localAddr: 4261412874, addrPool: [33554442, 50331658, 67108874, 83886090, 100663306, 117440522, 134217738, 150994954, 167772170, 184549386, 201326602, 218103818, 234881034] };
        var _emscripten_run_script = ptr => { eval(UTF8ToString(ptr)); };
        _emscripten_run_script.sig = "vp";
        var _emscripten_run_script_int = ptr => eval(UTF8ToString(ptr)) | 0;
        _emscripten_run_script_int.sig = "ip";
        var _emscripten_run_script_string = ptr => { var s = eval(UTF8ToString(ptr)); if (s == null) {
            return 0;
        } s += ""; var me = _emscripten_run_script_string; me.bufferSize = lengthBytesUTF8(s) + 1; me.buffer = _realloc(me.buffer ?? 0, me.bufferSize); stringToUTF8(s, me.buffer, me.bufferSize); return me.buffer; };
        _emscripten_run_script_string.sig = "pp";
        var _emscripten_random = () => Math.random();
        _emscripten_random.sig = "f";
        var _emscripten_performance_now = () => performance.now();
        _emscripten_performance_now.sig = "d";
        var __emscripten_get_now_is_monotonic = () => nowIsMonotonic;
        __emscripten_get_now_is_monotonic.sig = "i";
        var _emscripten_get_compiler_setting = name => { throw "You must build with -sRETAIN_COMPILER_SETTINGS for getCompilerSetting or emscripten_get_compiler_setting to work"; };
        _emscripten_get_compiler_setting.sig = "pp";
        var _emscripten_debugger = () => { debugger; };
        _emscripten_debugger.sig = "v";
        var _emscripten_print_double = (x, to, max) => { var str = x + ""; if (to)
            return stringToUTF8(str, to, max);
        else
            return lengthBytesUTF8(str); };
        _emscripten_print_double.sig = "idpi";
        var _emscripten_asm_const_double = (code, sigPtr, argbuf) => runEmAsmFunction(code, sigPtr, argbuf);
        _emscripten_asm_const_double.sig = "dppp";
        var _emscripten_asm_const_ptr = (code, sigPtr, argbuf) => runEmAsmFunction(code, sigPtr, argbuf);
        _emscripten_asm_const_ptr.sig = "pppp";
        var _emscripten_asm_const_double_sync_on_main_thread = _emscripten_asm_const_int_sync_on_main_thread;
        _emscripten_asm_const_double_sync_on_main_thread.sig = "dppp";
        var _emscripten_asm_const_async_on_main_thread = (emAsmAddr, sigPtr, argbuf) => runMainThreadEmAsm(emAsmAddr, sigPtr, argbuf, 0);
        _emscripten_asm_const_async_on_main_thread.sig = "vppp";
        var __Unwind_Backtrace = (func, arg) => { var trace = getCallstack(); var parts = trace.split("\n"); for (var i = 0; i < parts.length; i++) {
            var ret = getWasmTableEntry(func)(0, arg);
            if (ret !== 0)
                return;
        } };
        __Unwind_Backtrace.sig = "ipp";
        var __Unwind_GetIPInfo = (context, ipBefore) => abort("Unwind_GetIPInfo");
        __Unwind_GetIPInfo.sig = "ppp";
        var __Unwind_FindEnclosingFunction = ip => 0;
        __Unwind_FindEnclosingFunction.sig = "pp";
        class ExceptionInfo {
            constructor(excPtr) { this.excPtr = excPtr; this.ptr = excPtr - 24; }
            set_type(type) { HEAPU32[this.ptr + 4 >> 2] = type; }
            get_type() { return HEAPU32[this.ptr + 4 >> 2]; }
            set_destructor(destructor) { HEAPU32[this.ptr + 8 >> 2] = destructor; }
            get_destructor() { return HEAPU32[this.ptr + 8 >> 2]; }
            set_caught(caught) { caught = caught ? 1 : 0; HEAP8[this.ptr + 12] = caught; }
            get_caught() { return HEAP8[this.ptr + 12] != 0; }
            set_rethrown(rethrown) { rethrown = rethrown ? 1 : 0; HEAP8[this.ptr + 13] = rethrown; }
            get_rethrown() { return HEAP8[this.ptr + 13] != 0; }
            init(type, destructor) { this.set_adjusted_ptr(0); this.set_type(type); this.set_destructor(destructor); }
            set_adjusted_ptr(adjustedPtr) { HEAPU32[this.ptr + 16 >> 2] = adjustedPtr; }
            get_adjusted_ptr() { return HEAPU32[this.ptr + 16 >> 2]; }
        }
        var exceptionLast = 0;
        var uncaughtExceptionCount = 0;
        var ___cxa_throw = (ptr, type, destructor) => { var info = new ExceptionInfo(ptr); info.init(type, destructor); exceptionLast = ptr; uncaughtExceptionCount++; throw exceptionLast; };
        ___cxa_throw.sig = "vppp";
        var __Unwind_RaiseException = ex => { err("Warning: _Unwind_RaiseException is not correctly implemented"); return ___cxa_throw(ex, 0, 0); };
        __Unwind_RaiseException.sig = "ip";
        var __Unwind_DeleteException = ex => err("TODO: Unwind_DeleteException");
        __Unwind_DeleteException.sig = "vp";
        var ___handle_stack_overflow = requested => { var base = _emscripten_stack_get_base(); var end = _emscripten_stack_get_end(); abort(`stack overflow (Attempt to set SP to ${ptrToString(requested)}` + `, with stack limits [${ptrToString(end)} - ${ptrToString(base)}` + "]). If you require more stack space build with -sSTACK_SIZE=<bytes>"); };
        ___handle_stack_overflow.sig = "vp";
        var getDynCaller = (sig, ptr, promising = false) => (...args) => dynCall(sig, ptr, args, promising);
        var _emscripten_exit_with_live_runtime = () => { throw "unwind"; };
        _emscripten_exit_with_live_runtime.sig = "v";
        var _emscripten_outn = (str, len) => out(UTF8ToString(str, len));
        _emscripten_outn.sig = "vpp";
        var _emscripten_errn = (str, len) => err(UTF8ToString(str, len));
        _emscripten_errn.sig = "vpp";
        var _emscripten_throw_number = number => { throw number; };
        _emscripten_throw_number.sig = "vd";
        var _emscripten_throw_string = str => { throw UTF8ToString(str); };
        _emscripten_throw_string.sig = "vp";
        var runtimeKeepalivePush = () => { runtimeKeepaliveCounter += 1; };
        runtimeKeepalivePush.sig = "v";
        var runtimeKeepalivePop = () => { runtimeKeepaliveCounter -= 1; };
        runtimeKeepalivePop.sig = "v";
        var _emscripten_runtime_keepalive_push = runtimeKeepalivePush;
        _emscripten_runtime_keepalive_push.sig = "v";
        var _emscripten_runtime_keepalive_pop = runtimeKeepalivePop;
        _emscripten_runtime_keepalive_pop.sig = "v";
        var _emscripten_runtime_keepalive_check = keepRuntimeAlive;
        _emscripten_runtime_keepalive_check.sig = "i";
        var asmjsMangle = x => { if (x == "__main_argc_argv") {
            x = "main";
        } return x.startsWith("dynCall_") ? x : "_" + x; };
        var ___global_base = 1024;
        var __emscripten_fs_load_embedded_files = ptr => { do {
            var name_addr = HEAPU32[ptr >> 2];
            ptr += 4;
            var len = HEAPU32[ptr >> 2];
            ptr += 4;
            var content = HEAPU32[ptr >> 2];
            ptr += 4;
            var name = UTF8ToString(name_addr);
            FS.createPath("/", PATH.dirname(name), true, true);
            FS.createDataFile(name, null, HEAP8.subarray(content, content + len), true, true, true);
        } while (HEAPU32[ptr >> 2]); };
        __emscripten_fs_load_embedded_files.sig = "vp";
        var POINTER_SIZE = 4;
        function getNativeTypeSize(type) { switch (type) {
            case "i1":
            case "i8":
            case "u8": return 1;
            case "i16":
            case "u16": return 2;
            case "i32":
            case "u32": return 4;
            case "i64":
            case "u64": return 8;
            case "float": return 4;
            case "double": return 8;
            default: {
                if (type.endsWith("*")) {
                    return POINTER_SIZE;
                }
                if (type[0] === "i") {
                    const bits = Number(type.slice(1));
                    assert(bits % 8 === 0, `getNativeTypeSize invalid bits ${bits}, ${type} type`);
                    return bits / 8;
                }
                return 0;
            }
        } }
        var onInits = [];
        var addOnInit = cb => onInits.push(cb);
        var onMains = [];
        var addOnPreMain = cb => onMains.push(cb);
        var STACK_SIZE = 16777216;
        var STACK_ALIGN = 16;
        var ASSERTIONS = 0;
        var cwrap = (ident, returnType, argTypes, opts) => { var numericArgs = !argTypes || argTypes.every(type => type === "number" || type === "boolean"); var numericRet = returnType !== "string"; if (numericRet && numericArgs && !opts) {
            return getCFunc(ident);
        } return (...args) => ccall(ident, returnType, argTypes, args, opts); };
        var removeFunction = index => { functionsInTableMap.delete(getWasmTableEntry(index)); setWasmTableEntry(index, null); freeTableIndexes.push(index); };
        var _emscripten_math_cbrt = Math.cbrt;
        _emscripten_math_cbrt.sig = "dd";
        var _emscripten_math_pow = Math.pow;
        _emscripten_math_pow.sig = "ddd";
        var _emscripten_math_random = Math.random;
        _emscripten_math_random.sig = "d";
        var _emscripten_math_sign = Math.sign;
        _emscripten_math_sign.sig = "dd";
        var _emscripten_math_sqrt = Math.sqrt;
        _emscripten_math_sqrt.sig = "dd";
        var _emscripten_math_exp = Math.exp;
        _emscripten_math_exp.sig = "dd";
        var _emscripten_math_expm1 = Math.expm1;
        _emscripten_math_expm1.sig = "dd";
        var _emscripten_math_fmod = (x, y) => x % y;
        _emscripten_math_fmod.sig = "ddd";
        var _emscripten_math_log = Math.log;
        _emscripten_math_log.sig = "dd";
        var _emscripten_math_log1p = Math.log1p;
        _emscripten_math_log1p.sig = "dd";
        var _emscripten_math_log10 = Math.log10;
        _emscripten_math_log10.sig = "dd";
        var _emscripten_math_log2 = Math.log2;
        _emscripten_math_log2.sig = "dd";
        var _emscripten_math_round = Math.round;
        _emscripten_math_round.sig = "dd";
        var _emscripten_math_acos = Math.acos;
        _emscripten_math_acos.sig = "dd";
        var _emscripten_math_acosh = Math.acosh;
        _emscripten_math_acosh.sig = "dd";
        var _emscripten_math_asin = Math.asin;
        _emscripten_math_asin.sig = "dd";
        var _emscripten_math_asinh = Math.asinh;
        _emscripten_math_asinh.sig = "dd";
        var _emscripten_math_atan = Math.atan;
        _emscripten_math_atan.sig = "dd";
        var _emscripten_math_atanh = Math.atanh;
        _emscripten_math_atanh.sig = "dd";
        var _emscripten_math_atan2 = Math.atan2;
        _emscripten_math_atan2.sig = "ddd";
        var _emscripten_math_cos = Math.cos;
        _emscripten_math_cos.sig = "dd";
        var _emscripten_math_cosh = Math.cosh;
        _emscripten_math_cosh.sig = "dd";
        var _emscripten_math_hypot = (count, varargs) => { var args = []; for (var i = 0; i < count; ++i) {
            args.push(HEAPF64[varargs + i * 8 >> 3]);
        } return Math.hypot(...args); };
        _emscripten_math_hypot.sig = "dip";
        var _emscripten_math_sin = Math.sin;
        _emscripten_math_sin.sig = "dd";
        var _emscripten_math_sinh = Math.sinh;
        _emscripten_math_sinh.sig = "dd";
        var _emscripten_math_tan = Math.tan;
        _emscripten_math_tan.sig = "dd";
        var _emscripten_math_tanh = Math.tanh;
        _emscripten_math_tanh.sig = "dd";
        var intArrayToString = array => { var ret = []; for (var i = 0; i < array.length; i++) {
            var chr = array[i];
            if (chr > 255) {
                chr &= 255;
            }
            ret.push(String.fromCharCode(chr));
        } return ret.join(""); };
        var AsciiToString = ptr => { var str = ""; while (1) {
            var ch = HEAPU8[ptr++];
            if (!ch)
                return str;
            str += String.fromCharCode(ch);
        } };
        var UTF16Decoder = new TextDecoder("utf-16le");
        var UTF16ToString = (ptr, maxBytesToRead, ignoreNul) => { var idx = ptr >> 1; var endIdx = findStringEnd(HEAPU16, idx, maxBytesToRead / 2, ignoreNul); return UTF16Decoder.decode(HEAPU16.subarray(idx, endIdx)); };
        var stringToUTF16 = (str, outPtr, maxBytesToWrite) => { maxBytesToWrite ?? (maxBytesToWrite = 2147483647); if (maxBytesToWrite < 2)
            return 0; maxBytesToWrite -= 2; var startPtr = outPtr; var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length; for (var i = 0; i < numCharsToWrite; ++i) {
            var codeUnit = str.charCodeAt(i);
            HEAP16[outPtr >> 1] = codeUnit;
            outPtr += 2;
        } HEAP16[outPtr >> 1] = 0; return outPtr - startPtr; };
        var lengthBytesUTF16 = str => str.length * 2;
        var UTF32ToString = (ptr, maxBytesToRead, ignoreNul) => { var str = ""; var startIdx = ptr >> 2; for (var i = 0; !(i >= maxBytesToRead / 4); i++) {
            var utf32 = HEAPU32[startIdx + i];
            if (!utf32 && !ignoreNul)
                break;
            str += String.fromCodePoint(utf32);
        } return str; };
        var stringToUTF32 = (str, outPtr, maxBytesToWrite) => { maxBytesToWrite ?? (maxBytesToWrite = 2147483647); if (maxBytesToWrite < 4)
            return 0; var startPtr = outPtr; var endPtr = startPtr + maxBytesToWrite - 4; for (var i = 0; i < str.length; ++i) {
            var codePoint = str.codePointAt(i);
            if (codePoint > 65535) {
                i++;
            }
            HEAP32[outPtr >> 2] = codePoint;
            outPtr += 4;
            if (outPtr + 4 > endPtr)
                break;
        } HEAP32[outPtr >> 2] = 0; return outPtr - startPtr; };
        var lengthBytesUTF32 = str => { var len = 0; for (var i = 0; i < str.length; ++i) {
            var codePoint = str.codePointAt(i);
            if (codePoint > 65535) {
                i++;
            }
            len += 4;
        } return len; };
        var _emscripten_set_click_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerMouseEventCallback(target, userData, useCapture, callbackfunc, 4, "click", targetThread);
        _emscripten_set_click_callback_on_thread.sig = "ippipp";
        var _emscripten_set_dblclick_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerMouseEventCallback(target, userData, useCapture, callbackfunc, 7, "dblclick", targetThread);
        _emscripten_set_dblclick_callback_on_thread.sig = "ippipp";
        var _emscripten_set_mouseover_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerMouseEventCallback(target, userData, useCapture, callbackfunc, 35, "mouseover", targetThread);
        _emscripten_set_mouseover_callback_on_thread.sig = "ippipp";
        var _emscripten_set_mouseout_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerMouseEventCallback(target, userData, useCapture, callbackfunc, 36, "mouseout", targetThread);
        _emscripten_set_mouseout_callback_on_thread.sig = "ippipp";
        var _emscripten_get_mouse_status = mouseState => { if (!JSEvents.mouseEvent)
            return -7; JSEvents.memcpy(mouseState, JSEvents.mouseEvent, 64); return 0; };
        _emscripten_get_mouse_status.sig = "ip";
        var _emscripten_set_scroll_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerUiEventCallback(target, userData, useCapture, callbackfunc, 11, "scroll", targetThread);
        _emscripten_set_scroll_callback_on_thread.sig = "ippipp";
        var _emscripten_set_focusin_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerFocusEventCallback(target, userData, useCapture, callbackfunc, 14, "focusin", targetThread);
        _emscripten_set_focusin_callback_on_thread.sig = "ippipp";
        var _emscripten_set_focusout_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerFocusEventCallback(target, userData, useCapture, callbackfunc, 15, "focusout", targetThread);
        _emscripten_set_focusout_callback_on_thread.sig = "ippipp";
        var fillDeviceOrientationEventData = (eventStruct, e, target) => { HEAPF64[eventStruct >> 3] = e.alpha; HEAPF64[eventStruct + 8 >> 3] = e.beta; HEAPF64[eventStruct + 16 >> 3] = e.gamma; HEAP8[eventStruct + 24] = e.absolute; };
        var registerDeviceOrientationEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => { JSEvents.deviceOrientationEvent || (JSEvents.deviceOrientationEvent = _malloc(32)); var deviceOrientationEventHandlerFunc = (e = event) => { fillDeviceOrientationEventData(JSEvents.deviceOrientationEvent, e, target); if (getWasmTableEntry(callbackfunc)(eventTypeId, JSEvents.deviceOrientationEvent, userData))
            e.preventDefault(); }; var eventHandler = { target: findEventTarget(target), eventTypeString, callbackfunc, handlerFunc: deviceOrientationEventHandlerFunc, useCapture }; return JSEvents.registerOrRemoveHandler(eventHandler); };
        var _emscripten_set_deviceorientation_callback_on_thread = (userData, useCapture, callbackfunc, targetThread) => registerDeviceOrientationEventCallback(2, userData, useCapture, callbackfunc, 16, "deviceorientation", targetThread);
        _emscripten_set_deviceorientation_callback_on_thread.sig = "ipipp";
        var _emscripten_get_deviceorientation_status = orientationState => { if (!JSEvents.deviceOrientationEvent)
            return -7; JSEvents.memcpy(orientationState, JSEvents.deviceOrientationEvent, 32); return 0; };
        _emscripten_get_deviceorientation_status.sig = "ip";
        var fillDeviceMotionEventData = (eventStruct, e, target) => { var supportedFields = 0; var a = e["acceleration"]; supportedFields |= a && 1; var ag = e["accelerationIncludingGravity"]; supportedFields |= ag && 2; var rr = e["rotationRate"]; supportedFields |= rr && 4; a = a || {}; ag = ag || {}; rr = rr || {}; HEAPF64[eventStruct >> 3] = a["x"]; HEAPF64[eventStruct + 8 >> 3] = a["y"]; HEAPF64[eventStruct + 16 >> 3] = a["z"]; HEAPF64[eventStruct + 24 >> 3] = ag["x"]; HEAPF64[eventStruct + 32 >> 3] = ag["y"]; HEAPF64[eventStruct + 40 >> 3] = ag["z"]; HEAPF64[eventStruct + 48 >> 3] = rr["alpha"]; HEAPF64[eventStruct + 56 >> 3] = rr["beta"]; HEAPF64[eventStruct + 64 >> 3] = rr["gamma"]; };
        var registerDeviceMotionEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => { JSEvents.deviceMotionEvent || (JSEvents.deviceMotionEvent = _malloc(80)); var deviceMotionEventHandlerFunc = (e = event) => { fillDeviceMotionEventData(JSEvents.deviceMotionEvent, e, target); if (getWasmTableEntry(callbackfunc)(eventTypeId, JSEvents.deviceMotionEvent, userData))
            e.preventDefault(); }; var eventHandler = { target: findEventTarget(target), eventTypeString, callbackfunc, handlerFunc: deviceMotionEventHandlerFunc, useCapture }; return JSEvents.registerOrRemoveHandler(eventHandler); };
        var _emscripten_set_devicemotion_callback_on_thread = (userData, useCapture, callbackfunc, targetThread) => registerDeviceMotionEventCallback(2, userData, useCapture, callbackfunc, 17, "devicemotion", targetThread);
        _emscripten_set_devicemotion_callback_on_thread.sig = "ipipp";
        var _emscripten_get_devicemotion_status = motionState => { if (!JSEvents.deviceMotionEvent)
            return -7; JSEvents.memcpy(motionState, JSEvents.deviceMotionEvent, 80); return 0; };
        _emscripten_get_devicemotion_status.sig = "ip";
        var screenOrientation = () => { if (!window.screen)
            return undefined; return screen.orientation || screen["mozOrientation"] || screen["webkitOrientation"]; };
        var fillOrientationChangeEventData = eventStruct => { var orientationsType1 = ["portrait-primary", "portrait-secondary", "landscape-primary", "landscape-secondary"]; var orientationsType2 = ["portrait", "portrait", "landscape", "landscape"]; var orientationIndex = 0; var orientationAngle = 0; var screenOrientObj = screenOrientation(); if (typeof screenOrientObj === "object") {
            orientationIndex = orientationsType1.indexOf(screenOrientObj.type);
            if (orientationIndex < 0) {
                orientationIndex = orientationsType2.indexOf(screenOrientObj.type);
            }
            if (orientationIndex >= 0) {
                orientationIndex = 1 << orientationIndex;
            }
            orientationAngle = screenOrientObj.angle;
        }
        else {
            orientationAngle = window.orientation;
        } HEAP32[eventStruct >> 2] = orientationIndex; HEAP32[eventStruct + 4 >> 2] = orientationAngle; };
        var registerOrientationChangeEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => { JSEvents.orientationChangeEvent || (JSEvents.orientationChangeEvent = _malloc(8)); var orientationChangeEventHandlerFunc = (e = event) => { var orientationChangeEvent = JSEvents.orientationChangeEvent; fillOrientationChangeEventData(orientationChangeEvent); if (getWasmTableEntry(callbackfunc)(eventTypeId, orientationChangeEvent, userData))
            e.preventDefault(); }; var eventHandler = { target, eventTypeString, callbackfunc, handlerFunc: orientationChangeEventHandlerFunc, useCapture }; return JSEvents.registerOrRemoveHandler(eventHandler); };
        var _emscripten_set_orientationchange_callback_on_thread = (userData, useCapture, callbackfunc, targetThread) => { if (!window.screen || !screen.orientation)
            return -1; return registerOrientationChangeEventCallback(screen.orientation, userData, useCapture, callbackfunc, 18, "change", targetThread); };
        _emscripten_set_orientationchange_callback_on_thread.sig = "ipipp";
        var _emscripten_get_orientation_status = orientationChangeEvent => { if (!screenOrientation() && typeof orientation == "undefined")
            return -1; fillOrientationChangeEventData(orientationChangeEvent); return 0; };
        _emscripten_get_orientation_status.sig = "ip";
        var _emscripten_lock_orientation = allowedOrientations => { var orientations = []; if (allowedOrientations & 1)
            orientations.push("portrait-primary"); if (allowedOrientations & 2)
            orientations.push("portrait-secondary"); if (allowedOrientations & 4)
            orientations.push("landscape-primary"); if (allowedOrientations & 8)
            orientations.push("landscape-secondary"); var succeeded; if (screen.lockOrientation) {
            succeeded = screen.lockOrientation(orientations);
        }
        else if (screen.mozLockOrientation) {
            succeeded = screen.mozLockOrientation(orientations);
        }
        else if (screen.webkitLockOrientation) {
            succeeded = screen.webkitLockOrientation(orientations);
        }
        else {
            return -1;
        } if (succeeded) {
            return 0;
        } return -6; };
        _emscripten_lock_orientation.sig = "ii";
        var _emscripten_unlock_orientation = () => { if (screen.unlockOrientation) {
            screen.unlockOrientation();
        }
        else if (screen.mozUnlockOrientation) {
            screen.mozUnlockOrientation();
        }
        else if (screen.webkitUnlockOrientation) {
            screen.webkitUnlockOrientation();
        }
        else {
            return -1;
        } return 0; };
        _emscripten_unlock_orientation.sig = "i";
        var _emscripten_get_fullscreen_status = fullscreenStatus => { if (!JSEvents.fullscreenEnabled())
            return -1; fillFullscreenChangeEventData(fullscreenStatus); return 0; };
        _emscripten_get_fullscreen_status.sig = "ip";
        var hideEverythingExceptGivenElement = onlyVisibleElement => { var child = onlyVisibleElement; var parent = child.parentNode; var hiddenElements = []; while (child != document.body) {
            var children = parent.children;
            for (var currChild of children) {
                if (currChild != child) {
                    hiddenElements.push({ node: currChild, displayState: currChild.style.display });
                    currChild.style.display = "none";
                }
            }
            child = parent;
            parent = parent.parentNode;
        } return hiddenElements; };
        var restoreHiddenElements = hiddenElements => { for (var elem of hiddenElements) {
            elem.node.style.display = elem.displayState;
        } };
        var restoreOldWindowedStyle = null;
        var softFullscreenResizeWebGLRenderTarget = () => { var dpr = devicePixelRatio; var inHiDPIFullscreenMode = currentFullscreenStrategy.canvasResolutionScaleMode == 2; var inAspectRatioFixedFullscreenMode = currentFullscreenStrategy.scaleMode == 2; var inPixelPerfectFullscreenMode = currentFullscreenStrategy.canvasResolutionScaleMode != 0; var inCenteredWithoutScalingFullscreenMode = currentFullscreenStrategy.scaleMode == 3; var screenWidth = inHiDPIFullscreenMode ? Math.round(innerWidth * dpr) : innerWidth; var screenHeight = inHiDPIFullscreenMode ? Math.round(innerHeight * dpr) : innerHeight; var w = screenWidth; var h = screenHeight; var canvas = currentFullscreenStrategy.target; var canvasSize = getCanvasElementSize(canvas); var x = canvasSize[0]; var y = canvasSize[1]; var topMargin; if (inAspectRatioFixedFullscreenMode) {
            if (w * y < x * h)
                h = w * y / x | 0;
            else if (w * y > x * h)
                w = h * x / y | 0;
            topMargin = (screenHeight - h) / 2 | 0;
        } if (inPixelPerfectFullscreenMode) {
            setCanvasElementSize(canvas, w, h);
            if (canvas.GLctxObject)
                canvas.GLctxObject.GLctx.viewport(0, 0, w, h);
        } if (inHiDPIFullscreenMode) {
            topMargin /= dpr;
            w /= dpr;
            h /= dpr;
            w = Math.round(w * 1e4) / 1e4;
            h = Math.round(h * 1e4) / 1e4;
            topMargin = Math.round(topMargin * 1e4) / 1e4;
        } if (inCenteredWithoutScalingFullscreenMode) {
            var t = (innerHeight - jstoi_q(canvas.style.height)) / 2;
            var b = (innerWidth - jstoi_q(canvas.style.width)) / 2;
            setLetterbox(canvas, t, b);
        }
        else {
            canvas.style.width = w + "px";
            canvas.style.height = h + "px";
            var b = (innerWidth - w) / 2;
            setLetterbox(canvas, topMargin, b);
        } if (!inCenteredWithoutScalingFullscreenMode && currentFullscreenStrategy.canvasResizedCallback) {
            getWasmTableEntry(currentFullscreenStrategy.canvasResizedCallback)(37, 0, currentFullscreenStrategy.canvasResizedCallbackUserData);
        } };
        var _emscripten_request_fullscreen = (target, deferUntilInEventHandler) => { var strategy = { scaleMode: 0, canvasResolutionScaleMode: 0, filteringMode: 0, deferUntilInEventHandler, canvasResizedCallbackTargetThread: 2 }; return doRequestFullscreen(target, strategy); };
        _emscripten_request_fullscreen.sig = "ipi";
        var _emscripten_enter_soft_fullscreen = (target, fullscreenStrategy) => { target = findEventTarget(target); if (!target)
            return -4; var strategy = { scaleMode: HEAP32[fullscreenStrategy >> 2], canvasResolutionScaleMode: HEAP32[fullscreenStrategy + 4 >> 2], filteringMode: HEAP32[fullscreenStrategy + 8 >> 2], canvasResizedCallback: HEAP32[fullscreenStrategy + 12 >> 2], canvasResizedCallbackUserData: HEAP32[fullscreenStrategy + 16 >> 2], target, softFullscreen: true }; var restoreOldStyle = JSEvents_resizeCanvasForFullscreen(target, strategy); document.documentElement.style.overflow = "hidden"; document.body.scroll = "no"; document.body.style.margin = "0px"; var hiddenElements = hideEverythingExceptGivenElement(target); function restoreWindowedState() { restoreOldStyle(); restoreHiddenElements(hiddenElements); removeEventListener("resize", softFullscreenResizeWebGLRenderTarget); if (strategy.canvasResizedCallback) {
            getWasmTableEntry(strategy.canvasResizedCallback)(37, 0, strategy.canvasResizedCallbackUserData);
        } currentFullscreenStrategy = 0; } restoreOldWindowedStyle = restoreWindowedState; currentFullscreenStrategy = strategy; addEventListener("resize", softFullscreenResizeWebGLRenderTarget); if (strategy.canvasResizedCallback) {
            getWasmTableEntry(strategy.canvasResizedCallback)(37, 0, strategy.canvasResizedCallbackUserData);
        } return 0; };
        _emscripten_enter_soft_fullscreen.sig = "ipp";
        var _emscripten_exit_soft_fullscreen = () => { restoreOldWindowedStyle?.(); restoreOldWindowedStyle = null; return 0; };
        _emscripten_exit_soft_fullscreen.sig = "i";
        var registerPointerlockErrorEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => { var pointerlockErrorEventHandlerFunc = (e = event) => { if (getWasmTableEntry(callbackfunc)(eventTypeId, 0, userData))
            e.preventDefault(); }; var eventHandler = { target, eventTypeString, callbackfunc, handlerFunc: pointerlockErrorEventHandlerFunc, useCapture }; return JSEvents.registerOrRemoveHandler(eventHandler); };
        var _emscripten_set_pointerlockerror_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => { if (!document.body?.requestPointerLock) {
            return -1;
        } target = findEventTarget(target); if (!target)
            return -4; return registerPointerlockErrorEventCallback(target, userData, useCapture, callbackfunc, 38, "pointerlockerror", targetThread); };
        _emscripten_set_pointerlockerror_callback_on_thread.sig = "ippipp";
        var _emscripten_get_pointerlock_status = pointerlockStatus => { if (pointerlockStatus)
            fillPointerlockChangeEventData(pointerlockStatus); if (!document.body?.requestPointerLock) {
            return -1;
        } return 0; };
        _emscripten_get_pointerlock_status.sig = "ip";
        var _emscripten_vibrate = msecs => { if (!navigator.vibrate)
            return -1; navigator.vibrate(msecs); return 0; };
        _emscripten_vibrate.sig = "ii";
        var _emscripten_vibrate_pattern = (msecsArray, numEntries) => { if (!navigator.vibrate)
            return -1; var vibrateList = []; for (var i = 0; i < numEntries; ++i) {
            var msecs = HEAP32[msecsArray + i * 4 >> 2];
            vibrateList.push(msecs);
        } navigator.vibrate(vibrateList); return 0; };
        _emscripten_vibrate_pattern.sig = "ipi";
        var _emscripten_get_visibility_status = visibilityStatus => { if (typeof document.visibilityState == "undefined" && typeof document.hidden == "undefined") {
            return -1;
        } fillVisibilityChangeEventData(visibilityStatus); return 0; };
        _emscripten_get_visibility_status.sig = "ip";
        var registerBatteryEventCallback = (battery, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => { JSEvents.batteryEvent || (JSEvents.batteryEvent = _malloc(32)); var batteryEventHandlerFunc = (e = event) => { var batteryEvent = JSEvents.batteryEvent; fillBatteryEventData(batteryEvent, battery); if (getWasmTableEntry(callbackfunc)(eventTypeId, batteryEvent, userData))
            e.preventDefault(); }; var eventHandler = { target: battery, eventTypeString, callbackfunc, handlerFunc: batteryEventHandlerFunc, useCapture }; return JSEvents.registerOrRemoveHandler(eventHandler); };
        var _emscripten_set_batterychargingchange_callback_on_thread = (userData, callbackfunc, targetThread) => { if (!hasBatteryAPI())
            return -1; navigator.getBattery().then(b => { registerBatteryEventCallback(b, userData, true, callbackfunc, 29, "chargingchange", targetThread); }); };
        _emscripten_set_batterychargingchange_callback_on_thread.sig = "ippp";
        var _emscripten_set_batterylevelchange_callback_on_thread = (userData, callbackfunc, targetThread) => { if (!hasBatteryAPI())
            return -1; navigator.getBattery().then(b => { registerBatteryEventCallback(b, userData, true, callbackfunc, 30, "levelchange", targetThread); }); };
        _emscripten_set_batterylevelchange_callback_on_thread.sig = "ippp";
        var _emscripten_html5_remove_all_event_listeners = () => JSEvents.removeAllEventListeners();
        _emscripten_html5_remove_all_event_listeners.sig = "v";
        var _emscripten_request_animation_frame = (cb, userData) => requestAnimationFrame(timeStamp => getWasmTableEntry(cb)(timeStamp, userData));
        _emscripten_request_animation_frame.sig = "ipp";
        var _emscripten_cancel_animation_frame = id => cancelAnimationFrame(id);
        _emscripten_cancel_animation_frame.sig = "vi";
        var _emscripten_request_animation_frame_loop = (cb, userData) => { function tick(timeStamp) { if (getWasmTableEntry(cb)(timeStamp, userData)) {
            requestAnimationFrame(tick);
        } } return requestAnimationFrame(tick); };
        _emscripten_request_animation_frame_loop.sig = "vpp";
        var _emscripten_get_callstack = (flags, str, maxbytes) => { var callstack = getCallstack(flags); if (!str || maxbytes <= 0) {
            return lengthBytesUTF8(callstack) + 1;
        } var bytesWrittenExcludingNull = stringToUTF8(callstack, str, maxbytes); return bytesWrittenExcludingNull + 1; };
        _emscripten_get_callstack.sig = "iipi";
        var convertFrameToPC = frame => { var match; if (match = /\bwasm-function\[\d+\]:(0x[0-9a-f]+)/.exec(frame)) {
            return +match[1];
        }
        else if (match = /\bwasm-function\[(\d+)\]:(\d+)/.exec(frame)) {
            abort("Legacy backtrace format detected but -sUSE_OFFSET_CONVERTER not present.");
        }
        else if (match = /:(\d+):\d+(?:\)|$)/.exec(frame)) {
            return 2147483648 | +match[1];
        } return 0; };
        var _emscripten_return_address = level => { var callstack = jsStackTrace().split("\n"); if (callstack[0] == "Error") {
            callstack.shift();
        } var caller = callstack[level + 3]; return convertFrameToPC(caller); };
        _emscripten_return_address.sig = "pi";
        var UNWIND_CACHE = {};
        var saveInUnwindCache = callstack => { callstack.forEach(frame => { var pc = convertFrameToPC(frame); if (pc) {
            UNWIND_CACHE[pc] = frame;
        } }); };
        var _emscripten_stack_snapshot = () => { var callstack = jsStackTrace().split("\n"); if (callstack[0] == "Error") {
            callstack.shift();
        } saveInUnwindCache(callstack); UNWIND_CACHE.last_addr = convertFrameToPC(callstack[3]); UNWIND_CACHE.last_stack = callstack; return UNWIND_CACHE.last_addr; };
        _emscripten_stack_snapshot.sig = "p";
        var _emscripten_stack_unwind_buffer = (addr, buffer, count) => { var stack; if (UNWIND_CACHE.last_addr == addr) {
            stack = UNWIND_CACHE.last_stack;
        }
        else {
            stack = jsStackTrace().split("\n");
            if (stack[0] == "Error") {
                stack.shift();
            }
            saveInUnwindCache(stack);
        } var offset = 3; while (stack[offset] && convertFrameToPC(stack[offset]) != addr) {
            ++offset;
        } for (var i = 0; i < count && stack[i + offset]; ++i) {
            HEAP32[buffer + i * 4 >> 2] = convertFrameToPC(stack[i + offset]);
        } return i; };
        _emscripten_stack_unwind_buffer.sig = "ippi";
        var _emscripten_pc_get_function = pc => { var name; if (pc & 2147483648) {
            var frame = UNWIND_CACHE[pc];
            if (!frame)
                return 0;
            var match;
            if (match = /^\s+at (.*) \(.*\)$/.exec(frame)) {
                name = match[1];
            }
            else if (match = /^(.+?)@/.exec(frame)) {
                name = match[1];
            }
            else {
                return 0;
            }
        }
        else {
            abort("Cannot use emscripten_pc_get_function on native functions without -sUSE_OFFSET_CONVERTER");
            return 0;
        } _free(_emscripten_pc_get_function.ret ?? 0); _emscripten_pc_get_function.ret = stringToNewUTF8(name); return _emscripten_pc_get_function.ret; };
        _emscripten_pc_get_function.sig = "pp";
        var convertPCtoSourceLocation = pc => { if (UNWIND_CACHE.last_get_source_pc == pc)
            return UNWIND_CACHE.last_source; var match; var source; if (!source) {
            var frame = UNWIND_CACHE[pc];
            if (!frame)
                return null;
            if (match = /\((.*):(\d+):(\d+)\)$/.exec(frame)) {
                source = { file: match[1], line: match[2], column: match[3] };
            }
            else if (match = /@(.*):(\d+):(\d+)/.exec(frame)) {
                source = { file: match[1], line: match[2], column: match[3] };
            }
        } UNWIND_CACHE.last_get_source_pc = pc; UNWIND_CACHE.last_source = source; return source; };
        var _emscripten_pc_get_file = pc => { var result = convertPCtoSourceLocation(pc); if (!result)
            return 0; _free(_emscripten_pc_get_file.ret ?? 0); _emscripten_pc_get_file.ret = stringToNewUTF8(result.file); return _emscripten_pc_get_file.ret; };
        _emscripten_pc_get_file.sig = "pp";
        var _emscripten_pc_get_line = pc => { var result = convertPCtoSourceLocation(pc); return result ? result.line : 0; };
        _emscripten_pc_get_line.sig = "ip";
        var _emscripten_pc_get_column = pc => { var result = convertPCtoSourceLocation(pc); return result ? result.column || 0 : 0; };
        _emscripten_pc_get_column.sig = "ip";
        var _sched_yield = () => 0;
        _sched_yield.sig = "i";
        var wasiRightsToMuslOFlags = rights => { if (rights & 2 && rights & 64) {
            return 2;
        } if (rights & 2) {
            return 0;
        } if (rights & 64) {
            return 1;
        } throw new FS.ErrnoError(28); };
        var wasiOFlagsToMuslOFlags = oflags => { var musl_oflags = 0; if (oflags & 1) {
            musl_oflags |= 64;
        } if (oflags & 8) {
            musl_oflags |= 512;
        } if (oflags & 2) {
            musl_oflags |= 65536;
        } if (oflags & 4) {
            musl_oflags |= 128;
        } return musl_oflags; };
        var _emscripten_unwind_to_js_event_loop = () => { throw "unwind"; };
        _emscripten_unwind_to_js_event_loop.sig = "v";
        var setImmediateWrapped = func => { setImmediateWrapped.mapping || (setImmediateWrapped.mapping = []); var id = setImmediateWrapped.mapping.length; setImmediateWrapped.mapping[id] = setImmediate(() => { setImmediateWrapped.mapping[id] = undefined; func(); }); return id; };
        var safeRequestAnimationFrame = func => MainLoop.requestAnimationFrame(() => { callUserCallback(func); });
        var clearImmediateWrapped = id => { clearImmediate(setImmediateWrapped.mapping[id]); setImmediateWrapped.mapping[id] = undefined; };
        var emClearImmediate;
        var emSetImmediate;
        var emClearImmediate_deps = ["$emSetImmediate"];
        var _emscripten_set_immediate = (cb, userData) => emSetImmediate(() => { callUserCallback(() => getWasmTableEntry(cb)(userData)); });
        _emscripten_set_immediate.sig = "ipp";
        var _emscripten_clear_immediate = id => { emClearImmediate(id); };
        _emscripten_clear_immediate.sig = "vi";
        var _emscripten_set_immediate_loop = (cb, userData) => { function tick() { callUserCallback(() => { if (getWasmTableEntry(cb)(userData)) {
            emSetImmediate(tick);
        }
        else { } }); } emSetImmediate(tick); };
        _emscripten_set_immediate_loop.sig = "vpp";
        var _emscripten_set_timeout_loop = (cb, msecs, userData) => { function tick() { var t = _emscripten_get_now(); var n = t + msecs; callUserCallback(() => { if (getWasmTableEntry(cb)(t, userData)) {
            var remaining = n - _emscripten_get_now();
            setTimeout(tick, remaining);
        } }); } return setTimeout(tick, 0); };
        _emscripten_set_timeout_loop.sig = "vpdp";
        var _emscripten_set_interval = (cb, msecs, userData) => setInterval(() => { callUserCallback(() => getWasmTableEntry(cb)(userData)); }, msecs);
        _emscripten_set_interval.sig = "ipdp";
        var _emscripten_clear_interval = id => { clearInterval(id); };
        _emscripten_clear_interval.sig = "vi";
        var _emscripten_async_call = (func, arg, millis) => { var wrapper = () => getWasmTableEntry(func)(arg); if (millis >= 0) {
            safeSetTimeout(wrapper, millis);
        }
        else {
            safeRequestAnimationFrame(wrapper);
        } };
        _emscripten_async_call.sig = "vppi";
        var registerPostMainLoop = f => { typeof MainLoop != "undefined" && MainLoop.postMainLoop.push(f); };
        var _emscripten_get_main_loop_timing = (mode, value) => { if (mode)
            HEAP32[mode >> 2] = MainLoop.timingMode; if (value)
            HEAP32[value >> 2] = MainLoop.timingValue; };
        _emscripten_get_main_loop_timing.sig = "vpp";
        var _emscripten_set_main_loop = (func, fps, simulateInfiniteLoop) => { var iterFunc = getWasmTableEntry(func); setMainLoop(iterFunc, fps, simulateInfiniteLoop); };
        _emscripten_set_main_loop.sig = "vpii";
        var _emscripten_pause_main_loop = () => MainLoop.pause();
        _emscripten_pause_main_loop.sig = "v";
        var _emscripten_resume_main_loop = () => MainLoop.resume();
        _emscripten_resume_main_loop.sig = "v";
        var __emscripten_push_main_loop_blocker = (func, arg, name) => { MainLoop.queue.push({ func: () => { getWasmTableEntry(func)(arg); }, name: UTF8ToString(name), counted: true }); MainLoop.updateStatus(); };
        __emscripten_push_main_loop_blocker.sig = "vppp";
        var __emscripten_push_uncounted_main_loop_blocker = (func, arg, name) => { MainLoop.queue.push({ func: () => { getWasmTableEntry(func)(arg); }, name: UTF8ToString(name), counted: false }); MainLoop.updateStatus(); };
        __emscripten_push_uncounted_main_loop_blocker.sig = "vppp";
        var _emscripten_set_main_loop_expected_blockers = num => { MainLoop.expectedBlockers = num; MainLoop.remainingBlockers = num; MainLoop.updateStatus(); };
        _emscripten_set_main_loop_expected_blockers.sig = "vi";
        var idsToPromises = (idBuf, size) => { var promises = []; for (var i = 0; i < size; i++) {
            var id = HEAP32[idBuf + i * 4 >> 2];
            promises[i] = getPromise(id);
        } return promises; };
        var makePromiseCallback = (callback, userData) => value => { var stack = stackSave(); var resultPtr = stackAlloc(POINTER_SIZE); HEAPU32[resultPtr >> 2] = 0; try {
            var result = getWasmTableEntry(callback)(resultPtr, userData, value);
            var resultVal = HEAPU32[resultPtr >> 2];
        }
        catch (e) {
            if (typeof e != "number") {
                throw 0;
            }
            throw e;
        }
        finally {
            stackRestore(stack);
        } switch (result) {
            case 0: return resultVal;
            case 1: return getPromise(resultVal);
            case 2:
                var ret = getPromise(resultVal);
                _emscripten_promise_destroy(resultVal);
                return ret;
            case 3: throw resultVal;
        } };
        var _emscripten_promise_then = (id, onFulfilled, onRejected, userData) => { var promise = getPromise(id); var newId = promiseMap.allocate({ promise: promise.then(makePromiseCallback(onFulfilled, userData), makePromiseCallback(onRejected, userData)) }); return newId; };
        _emscripten_promise_then.sig = "ppppp";
        var _emscripten_promise_all = (idBuf, resultBuf, size) => { var promises = idsToPromises(idBuf, size); var id = promiseMap.allocate({ promise: Promise.all(promises).then(results => { if (resultBuf) {
                for (var i = 0; i < size; i++) {
                    var result = results[i];
                    HEAPU32[resultBuf + i * 4 >> 2] = result;
                }
            } return resultBuf; }) }); return id; };
        _emscripten_promise_all.sig = "pppp";
        var setPromiseResult = (ptr, fulfill, value) => { var result = fulfill ? 0 : 3; HEAP32[ptr >> 2] = result; HEAPU32[ptr + 4 >> 2] = value; };
        var _emscripten_promise_all_settled = (idBuf, resultBuf, size) => { var promises = idsToPromises(idBuf, size); var id = promiseMap.allocate({ promise: Promise.allSettled(promises).then(results => { if (resultBuf) {
                var offset = resultBuf;
                for (var i = 0; i < size; i++, offset += 8) {
                    if (results[i].status === "fulfilled") {
                        setPromiseResult(offset, true, results[i].value);
                    }
                    else {
                        setPromiseResult(offset, false, results[i].reason);
                    }
                }
            } return resultBuf; }) }); return id; };
        _emscripten_promise_all_settled.sig = "pppp";
        var _emscripten_promise_any = (idBuf, errorBuf, size) => { var promises = idsToPromises(idBuf, size); var id = promiseMap.allocate({ promise: Promise.any(promises).catch(err => { if (errorBuf) {
                for (var i = 0; i < size; i++) {
                    HEAPU32[errorBuf + i * 4 >> 2] = err.errors[i];
                }
            } throw errorBuf; }) }); return id; };
        _emscripten_promise_any.sig = "pppp";
        var _emscripten_promise_race = (idBuf, size) => { var promises = idsToPromises(idBuf, size); var id = promiseMap.allocate({ promise: Promise.race(promises) }); return id; };
        _emscripten_promise_race.sig = "ppp";
        var _emscripten_promise_await = (returnValuePtr, id) => { abort("emscripten_promise_await is only available with ASYNCIFY"); };
        _emscripten_promise_await.sig = "vpp";
        var findMatchingCatch = args => { var thrown = exceptionLast; if (!thrown) {
            setTempRet0(0);
            return 0;
        } var info = new ExceptionInfo(thrown); info.set_adjusted_ptr(thrown); var thrownType = info.get_type(); if (!thrownType) {
            setTempRet0(0);
            return thrown;
        } for (var caughtType of args) {
            if (caughtType === 0 || caughtType === thrownType) {
                break;
            }
            var adjusted_ptr_addr = info.ptr + 16;
            if (___cxa_can_catch(caughtType, thrownType, adjusted_ptr_addr)) {
                setTempRet0(caughtType);
                return thrown;
            }
        } setTempRet0(thrownType); return thrown; };
        var ___cxa_find_matching_catch_2 = () => findMatchingCatch([]);
        ___cxa_find_matching_catch_2.sig = "p";
        var ___cxa_find_matching_catch_3 = arg0 => findMatchingCatch([arg0]);
        ___cxa_find_matching_catch_3.sig = "pp";
        var ___cxa_find_matching_catch_4 = (arg0, arg1) => findMatchingCatch([arg0, arg1]);
        ___cxa_find_matching_catch_4.sig = "ppp";
        var exceptionCaught = [];
        var ___cxa_rethrow = () => { var info = exceptionCaught.pop(); if (!info) {
            abort("no exception to throw");
        } var ptr = info.excPtr; if (!info.get_rethrown()) {
            exceptionCaught.push(info);
            info.set_rethrown(true);
            info.set_caught(false);
            uncaughtExceptionCount++;
        } exceptionLast = ptr; throw exceptionLast; };
        ___cxa_rethrow.sig = "v";
        var _llvm_eh_typeid_for = type => type;
        _llvm_eh_typeid_for.sig = "vp";
        var ___cxa_begin_catch = ptr => { var info = new ExceptionInfo(ptr); if (!info.get_caught()) {
            info.set_caught(true);
            uncaughtExceptionCount--;
        } info.set_rethrown(false); exceptionCaught.push(info); ___cxa_increment_exception_refcount(ptr); return ___cxa_get_exception_ptr(ptr); };
        ___cxa_begin_catch.sig = "pp";
        var ___cxa_end_catch = () => { _setThrew(0, 0); var info = exceptionCaught.pop(); ___cxa_decrement_exception_refcount(info.excPtr); exceptionLast = 0; };
        ___cxa_end_catch.sig = "v";
        var ___cxa_uncaught_exceptions = () => uncaughtExceptionCount;
        ___cxa_uncaught_exceptions.sig = "i";
        var ___cxa_call_unexpected = exception => abort("Unexpected exception thrown, this is not properly supported - aborting");
        ___cxa_call_unexpected.sig = "vp";
        var ___cxa_current_primary_exception = () => { if (!exceptionCaught.length) {
            return 0;
        } var info = exceptionCaught[exceptionCaught.length - 1]; ___cxa_increment_exception_refcount(info.excPtr); return info.excPtr; };
        ___cxa_current_primary_exception.sig = "p";
        function ___cxa_current_exception_type() { if (!exceptionCaught.length) {
            return 0;
        } var info = exceptionCaught[exceptionCaught.length - 1]; return info.get_type(); }
        ___cxa_current_exception_type.sig = "p";
        var ___cxa_rethrow_primary_exception = ptr => { if (!ptr)
            return; var info = new ExceptionInfo(ptr); exceptionCaught.push(info); info.set_rethrown(true); ___cxa_rethrow(); };
        ___cxa_rethrow_primary_exception.sig = "vp";
        var ___resumeException = ptr => { if (!exceptionLast) {
            exceptionLast = ptr;
        } throw exceptionLast; };
        ___resumeException.sig = "vp";
        var requestFullscreen = Browser.requestFullscreen;
        var setCanvasSize = Browser.setCanvasSize;
        var getUserMedia = Browser.getUserMedia;
        var _emscripten_run_preload_plugins = (file, onload, onerror) => { var _file = UTF8ToString(file); var data = FS.analyzePath(_file); if (!data.exists)
            return -1; FS.createPreloadedFile(PATH.dirname(_file), PATH.basename(_file), new Uint8Array(data.object.contents), true, true, () => { if (onload)
            getWasmTableEntry(onload)(file); }, () => { if (onerror)
            getWasmTableEntry(onerror)(file); }, true); return 0; };
        _emscripten_run_preload_plugins.sig = "ippp";
        var Browser_asyncPrepareDataCounter = 0;
        var _emscripten_run_preload_plugins_data = (data, size, suffix, arg, onload, onerror) => { var _suffix = UTF8ToString(suffix); var name = "prepare_data_" + Browser_asyncPrepareDataCounter++ + "." + _suffix; var cname = stringToNewUTF8(name); FS.createPreloadedFile("/", name, HEAPU8.subarray(data, data + size), true, true, () => { if (onload)
            getWasmTableEntry(onload)(arg, cname); }, () => { if (onerror)
            getWasmTableEntry(onerror)(arg); }, true); };
        _emscripten_run_preload_plugins_data.sig = "vpipppp";
        var _emscripten_async_run_script = (script, millis) => { safeSetTimeout(() => _emscripten_run_script(script), millis); };
        _emscripten_async_run_script.sig = "vpi";
        var _emscripten_async_load_script = async (url, onload, onerror) => { url = UTF8ToString(url); var loadDone = () => { if (onload) {
            var onloadCallback = () => callUserCallback(getWasmTableEntry(onload));
            if (runDependencies > 0) {
                dependenciesFulfilled = onloadCallback;
            }
            else {
                onloadCallback();
            }
        } }; var loadError = () => { if (onerror) {
            callUserCallback(getWasmTableEntry(onerror));
        } }; var script = document.createElement("script"); script.onload = loadDone; script.onerror = loadError; script.src = url; document.body.appendChild(script); };
        _emscripten_async_load_script.sig = "vppp";
        var _emscripten_get_window_title = () => { var buflen = 256; if (!_emscripten_get_window_title.buffer) {
            _emscripten_get_window_title.buffer = _malloc(buflen);
        } stringToUTF8(document.title, _emscripten_get_window_title.buffer, buflen); return _emscripten_get_window_title.buffer; };
        _emscripten_get_window_title.sig = "p";
        var _emscripten_hide_mouse = () => { var styleSheet = document.styleSheets[0]; var rules = styleSheet.cssRules; for (var i = 0; i < rules.length; i++) {
            if (rules[i].cssText.startsWith("canvas")) {
                styleSheet.deleteRule(i);
                i--;
            }
        } styleSheet.insertRule("canvas.emscripten { border: 1px solid black; cursor: none; }", 0); };
        _emscripten_hide_mouse.sig = "v";
        var _emscripten_set_canvas_size = (width, height) => Browser.setCanvasSize(width, height);
        _emscripten_set_canvas_size.sig = "vii";
        var _emscripten_get_canvas_size = (width, height, isFullscreen) => { var canvas = Browser.getCanvas(); HEAP32[width >> 2] = canvas.width; HEAP32[height >> 2] = canvas.height; HEAP32[isFullscreen >> 2] = Browser.isFullscreen ? 1 : 0; };
        _emscripten_get_canvas_size.sig = "vppp";
        var _emscripten_create_worker = url => { url = UTF8ToString(url); var id = Browser.workers.length; var info = { worker: new Worker(url), callbacks: [], awaited: 0, buffer: 0 }; info.worker.onmessage = function info_worker_onmessage(msg) { if (ABORT)
            return; var info = Browser.workers[id]; if (!info)
            return; var callbackId = msg.data["callbackId"]; var callbackInfo = info.callbacks[callbackId]; if (!callbackInfo)
            return; if (msg.data["finalResponse"]) {
            info.awaited--;
            info.callbacks[callbackId] = null;
        } var data = msg.data["data"]; if (data) {
            if (!data.byteLength)
                data = new Uint8Array(data);
            info.buffer = _realloc(info.buffer, data.length);
            HEAPU8.set(data, info.buffer);
            callbackInfo.func(info.buffer, data.length, callbackInfo.arg);
        }
        else {
            callbackInfo.func(0, 0, callbackInfo.arg);
        } }; Browser.workers.push(info); return id; };
        _emscripten_create_worker.sig = "ip";
        var _emscripten_destroy_worker = id => { var info = Browser.workers[id]; info.worker.terminate(); _free(info.buffer); Browser.workers[id] = null; };
        _emscripten_destroy_worker.sig = "vi";
        var _emscripten_call_worker = (id, funcName, data, size, callback, arg) => { funcName = UTF8ToString(funcName); var info = Browser.workers[id]; var callbackId = -1; if (callback) {
            callbackId = info.callbacks.length;
            info.callbacks.push({ func: getWasmTableEntry(callback), arg });
            info.awaited++;
        } var transferObject = { funcName, callbackId, data: data ? new Uint8Array(HEAPU8.subarray(data, data + size)) : 0 }; if (data) {
            info.worker.postMessage(transferObject, [transferObject.data.buffer]);
        }
        else {
            info.worker.postMessage(transferObject);
        } };
        _emscripten_call_worker.sig = "vippipp";
        var _emscripten_get_worker_queue_size = id => { var info = Browser.workers[id]; if (!info)
            return -1; return info.awaited; };
        _emscripten_get_worker_queue_size.sig = "ii";
        var getPreloadedImageData = (path, w, h) => { path = PATH_FS.resolve(path); var canvas = Browser.preloadedImages[path]; if (!canvas)
            return 0; var ctx = canvas.getContext("2d"); var image = ctx.getImageData(0, 0, canvas.width, canvas.height); var buf = _malloc(canvas.width * canvas.height * 4); HEAPU8.set(image.data, buf); HEAP32[w >> 2] = canvas.width; HEAP32[h >> 2] = canvas.height; return buf; };
        var _emscripten_get_preloaded_image_data = (path, w, h) => getPreloadedImageData(UTF8ToString(path), w, h);
        _emscripten_get_preloaded_image_data.sig = "pppp";
        var getPreloadedImageData__data = ["$PATH_FS", "malloc"];
        var _emscripten_get_preloaded_image_data_from_FILE = (file, w, h) => { var fd = _fileno(file); var stream = FS.getStream(fd); if (stream) {
            return getPreloadedImageData(stream.path, w, h);
        } return 0; };
        _emscripten_get_preloaded_image_data_from_FILE.sig = "pppp";
        var wget = { wgetRequests: {}, nextWgetRequestHandle: 0, getNextWgetRequestHandle() { var handle = wget.nextWgetRequestHandle; wget.nextWgetRequestHandle++; return handle; } };
        var FS_mkdirTree = (path, mode) => FS.mkdirTree(path, mode);
        var FS_unlink = (...args) => FS.unlink(...args);
        var _emscripten_async_wget = (url, file, onload, onerror) => { var _url = UTF8ToString(url); var _file = UTF8ToString(file); _file = PATH_FS.resolve(_file); function doCallback(callback) { if (callback) {
            callUserCallback(() => { var sp = stackSave(); getWasmTableEntry(callback)(stringToUTF8OnStack(_file)); stackRestore(sp); });
        } } var destinationDirectory = PATH.dirname(_file); FS_createPreloadedFile(destinationDirectory, PATH.basename(_file), _url, true, true, () => doCallback(onload), () => doCallback(onerror), false, false, () => { try {
            FS_unlink(_file);
        }
        catch (e) { } FS_mkdirTree(destinationDirectory); }); };
        _emscripten_async_wget.sig = "vpppp";
        var _emscripten_async_wget_data = async (url, userdata, onload, onerror) => { try {
            var byteArray = await asyncLoad(UTF8ToString(url));
            callUserCallback(() => { var buffer = _malloc(byteArray.length); HEAPU8.set(byteArray, buffer); getWasmTableEntry(onload)(userdata, buffer, byteArray.length); _free(buffer); });
        }
        catch (e) {
            if (onerror) {
                callUserCallback(() => { getWasmTableEntry(onerror)(userdata); });
            }
        } };
        _emscripten_async_wget_data.sig = "vpppp";
        var _emscripten_async_wget2 = (url, file, request, param, userdata, onload, onerror, onprogress) => { var _url = UTF8ToString(url); var _file = UTF8ToString(file); _file = PATH_FS.resolve(_file); var _request = UTF8ToString(request); var _param = UTF8ToString(param); var index = _file.lastIndexOf("/"); var http = new XMLHttpRequest; http.open(_request, _url, true); http.responseType = "arraybuffer"; var handle = wget.getNextWgetRequestHandle(); var destinationDirectory = PATH.dirname(_file); http.onload = e => { if (http.status >= 200 && http.status < 300) {
            try {
                FS.unlink(_file);
            }
            catch (e) { }
            FS.mkdirTree(destinationDirectory);
            FS.createDataFile(_file.slice(0, index), _file.slice(index + 1), new Uint8Array(http.response), true, true, false);
            if (onload) {
                var sp = stackSave();
                getWasmTableEntry(onload)(handle, userdata, stringToUTF8OnStack(_file));
                stackRestore(sp);
            }
        }
        else {
            if (onerror)
                getWasmTableEntry(onerror)(handle, userdata, http.status);
        } delete wget.wgetRequests[handle]; }; http.onerror = e => { if (onerror)
            getWasmTableEntry(onerror)(handle, userdata, http.status); delete wget.wgetRequests[handle]; }; http.onprogress = e => { if (e.lengthComputable || e.lengthComputable === undefined && e.total != 0) {
            var percentComplete = e.loaded / e.total * 100;
            if (onprogress)
                getWasmTableEntry(onprogress)(handle, userdata, percentComplete);
        } }; http.onabort = e => { delete wget.wgetRequests[handle]; }; if (_request == "POST") {
            http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            http.send(_param);
        }
        else {
            http.send(null);
        } wget.wgetRequests[handle] = http; return handle; };
        _emscripten_async_wget2.sig = "ipppppppp";
        var _emscripten_async_wget2_data = (url, request, param, userdata, free, onload, onerror, onprogress) => { var _url = UTF8ToString(url); var _request = UTF8ToString(request); var _param = UTF8ToString(param); var http = new XMLHttpRequest; http.open(_request, _url, true); http.responseType = "arraybuffer"; var handle = wget.getNextWgetRequestHandle(); function onerrorjs() { if (onerror) {
            var sp = stackSave();
            var statusText = 0;
            if (http.statusText) {
                statusText = stringToUTF8OnStack(http.statusText);
            }
            getWasmTableEntry(onerror)(handle, userdata, http.status, statusText);
            stackRestore(sp);
        } } http.onload = e => { if (http.status >= 200 && http.status < 300 || http.status === 0 && _url.slice(0, 4).toLowerCase() != "http") {
            var byteArray = new Uint8Array(http.response);
            var buffer = _malloc(byteArray.length);
            HEAPU8.set(byteArray, buffer);
            if (onload)
                getWasmTableEntry(onload)(handle, userdata, buffer, byteArray.length);
            _free(buffer);
        }
        else {
            onerrorjs();
        } delete wget.wgetRequests[handle]; }; http.onerror = e => { onerrorjs(); delete wget.wgetRequests[handle]; }; http.onprogress = e => { if (onprogress)
            getWasmTableEntry(onprogress)(handle, userdata, e.loaded, e.lengthComputable || e.lengthComputable === undefined ? e.total : 0); }; http.onabort = e => { delete wget.wgetRequests[handle]; }; if (_request == "POST") {
            http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            http.send(_param);
        }
        else {
            http.send(null);
        } wget.wgetRequests[handle] = http; return handle; };
        _emscripten_async_wget2_data.sig = "ippppippp";
        var _emscripten_async_wget2_abort = handle => { var http = wget.wgetRequests[handle]; http?.abort(); };
        _emscripten_async_wget2_abort.sig = "vi";
        var ___asctime_r = (tmPtr, buf) => { var date = { tm_sec: HEAP32[tmPtr >> 2], tm_min: HEAP32[tmPtr + 4 >> 2], tm_hour: HEAP32[tmPtr + 8 >> 2], tm_mday: HEAP32[tmPtr + 12 >> 2], tm_mon: HEAP32[tmPtr + 16 >> 2], tm_year: HEAP32[tmPtr + 20 >> 2], tm_wday: HEAP32[tmPtr + 24 >> 2] }; var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]; var s = days[date.tm_wday] + " " + months[date.tm_mon] + (date.tm_mday < 10 ? "  " : " ") + date.tm_mday + (date.tm_hour < 10 ? " 0" : " ") + date.tm_hour + (date.tm_min < 10 ? ":0" : ":") + date.tm_min + (date.tm_sec < 10 ? ":0" : ":") + date.tm_sec + " " + (1900 + date.tm_year) + "\n"; stringToUTF8(s, buf, 26); return buf; };
        ___asctime_r.sig = "ppp";
        var MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        var MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        var arraySum = (array, index) => { var sum = 0; for (var i = 0; i <= index; sum += array[i++]) { } return sum; };
        var addDays = (date, days) => { var newDate = new Date(date.getTime()); while (days > 0) {
            var leap = isLeapYear(newDate.getFullYear());
            var currentMonth = newDate.getMonth();
            var daysInCurrentMonth = (leap ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR)[currentMonth];
            if (days > daysInCurrentMonth - newDate.getDate()) {
                days -= daysInCurrentMonth - newDate.getDate() + 1;
                newDate.setDate(1);
                if (currentMonth < 11) {
                    newDate.setMonth(currentMonth + 1);
                }
                else {
                    newDate.setMonth(0);
                    newDate.setFullYear(newDate.getFullYear() + 1);
                }
            }
            else {
                newDate.setDate(newDate.getDate() + days);
                return newDate;
            }
        } return newDate; };
        var _strptime = (buf, format, tm) => { var pattern = UTF8ToString(format); var SPECIAL_CHARS = "\\!@#$^&*()+=-[]/{}|:<>?,."; for (var i = 0, ii = SPECIAL_CHARS.length; i < ii; ++i) {
            pattern = pattern.replace(new RegExp("\\" + SPECIAL_CHARS[i], "g"), "\\" + SPECIAL_CHARS[i]);
        } var EQUIVALENT_MATCHERS = { A: "%a", B: "%b", c: "%a %b %d %H:%M:%S %Y", D: "%m\\/%d\\/%y", e: "%d", F: "%Y-%m-%d", h: "%b", R: "%H\\:%M", r: "%I\\:%M\\:%S\\s%p", T: "%H\\:%M\\:%S", x: "%m\\/%d\\/(?:%y|%Y)", X: "%H\\:%M\\:%S" }; var DATE_PATTERNS = { a: "(?:Sun(?:day)?)|(?:Mon(?:day)?)|(?:Tue(?:sday)?)|(?:Wed(?:nesday)?)|(?:Thu(?:rsday)?)|(?:Fri(?:day)?)|(?:Sat(?:urday)?)", b: "(?:Jan(?:uary)?)|(?:Feb(?:ruary)?)|(?:Mar(?:ch)?)|(?:Apr(?:il)?)|May|(?:Jun(?:e)?)|(?:Jul(?:y)?)|(?:Aug(?:ust)?)|(?:Sep(?:tember)?)|(?:Oct(?:ober)?)|(?:Nov(?:ember)?)|(?:Dec(?:ember)?)", C: "\\d\\d", d: "0[1-9]|[1-9](?!\\d)|1\\d|2\\d|30|31", H: "\\d(?!\\d)|[0,1]\\d|20|21|22|23", I: "\\d(?!\\d)|0\\d|10|11|12", j: "00[1-9]|0?[1-9](?!\\d)|0?[1-9]\\d(?!\\d)|[1,2]\\d\\d|3[0-6]\\d", m: "0[1-9]|[1-9](?!\\d)|10|11|12", M: "0\\d|\\d(?!\\d)|[1-5]\\d", n: " ", p: "AM|am|PM|pm|A\\.M\\.|a\\.m\\.|P\\.M\\.|p\\.m\\.", S: "0\\d|\\d(?!\\d)|[1-5]\\d|60", U: "0\\d|\\d(?!\\d)|[1-4]\\d|50|51|52|53", W: "0\\d|\\d(?!\\d)|[1-4]\\d|50|51|52|53", w: "[0-6]", y: "\\d\\d", Y: "\\d\\d\\d\\d", t: " ", z: "Z|(?:[\\+\\-]\\d\\d:?(?:\\d\\d)?)" }; var MONTH_NUMBERS = { JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5, JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11 }; var DAY_NUMBERS_SUN_FIRST = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 }; var DAY_NUMBERS_MON_FIRST = { MON: 0, TUE: 1, WED: 2, THU: 3, FRI: 4, SAT: 5, SUN: 6 }; var capture = []; var pattern_out = pattern.replace(/%(.)/g, (m, c) => EQUIVALENT_MATCHERS[c] || m).replace(/%(.)/g, (_, c) => { let pat = DATE_PATTERNS[c]; if (pat) {
            capture.push(c);
            return `(${pat})`;
        }
        else {
            return c;
        } }).replace(/\s+/g, "\\s*"); var matches = new RegExp("^" + pattern_out, "i").exec(UTF8ToString(buf)); function initDate() { function fixup(value, min, max) { return typeof value != "number" || isNaN(value) ? min : value >= min ? value <= max ? value : max : min; } return { year: fixup(HEAP32[tm + 20 >> 2] + 1900, 1970, 9999), month: fixup(HEAP32[tm + 16 >> 2], 0, 11), day: fixup(HEAP32[tm + 12 >> 2], 1, 31), hour: fixup(HEAP32[tm + 8 >> 2], 0, 23), min: fixup(HEAP32[tm + 4 >> 2], 0, 59), sec: fixup(HEAP32[tm >> 2], 0, 59), gmtoff: 0 }; } if (matches) {
            var date = initDate();
            var value;
            var getMatch = symbol => { var pos = capture.indexOf(symbol); if (pos >= 0) {
                return matches[pos + 1];
            } return; };
            if (value = getMatch("S")) {
                date.sec = Number(value);
            }
            if (value = getMatch("M")) {
                date.min = Number(value);
            }
            if (value = getMatch("H")) {
                date.hour = Number(value);
            }
            else if (value = getMatch("I")) {
                var hour = Number(value);
                if (value = getMatch("p")) {
                    hour += value.toUpperCase()[0] === "P" ? 12 : 0;
                }
                date.hour = hour;
            }
            if (value = getMatch("Y")) {
                date.year = Number(value);
            }
            else if (value = getMatch("y")) {
                var year = Number(value);
                if (value = getMatch("C")) {
                    year += Number(value) * 100;
                }
                else {
                    year += year < 69 ? 2e3 : 1900;
                }
                date.year = year;
            }
            if (value = getMatch("m")) {
                date.month = Number(value) - 1;
            }
            else if (value = getMatch("b")) {
                date.month = MONTH_NUMBERS[value.substring(0, 3).toUpperCase()] || 0;
            }
            if (value = getMatch("d")) {
                date.day = Number(value);
            }
            else if (value = getMatch("j")) {
                var day = Number(value);
                var leapYear = isLeapYear(date.year);
                for (var month = 0; month < 12; ++month) {
                    var daysUntilMonth = arraySum(leapYear ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR, month - 1);
                    if (day <= daysUntilMonth + (leapYear ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR)[month]) {
                        date.day = day - daysUntilMonth;
                    }
                }
            }
            else if (value = getMatch("a")) {
                var weekDay = value.substring(0, 3).toUpperCase();
                if (value = getMatch("U")) {
                    var weekDayNumber = DAY_NUMBERS_SUN_FIRST[weekDay];
                    var weekNumber = Number(value);
                    var janFirst = new Date(date.year, 0, 1);
                    var endDate;
                    if (janFirst.getDay() === 0) {
                        endDate = addDays(janFirst, weekDayNumber + 7 * (weekNumber - 1));
                    }
                    else {
                        endDate = addDays(janFirst, 7 - janFirst.getDay() + weekDayNumber + 7 * (weekNumber - 1));
                    }
                    date.day = endDate.getDate();
                    date.month = endDate.getMonth();
                }
                else if (value = getMatch("W")) {
                    var weekDayNumber = DAY_NUMBERS_MON_FIRST[weekDay];
                    var weekNumber = Number(value);
                    var janFirst = new Date(date.year, 0, 1);
                    var endDate;
                    if (janFirst.getDay() === 1) {
                        endDate = addDays(janFirst, weekDayNumber + 7 * (weekNumber - 1));
                    }
                    else {
                        endDate = addDays(janFirst, 7 - janFirst.getDay() + 1 + weekDayNumber + 7 * (weekNumber - 1));
                    }
                    date.day = endDate.getDate();
                    date.month = endDate.getMonth();
                }
            }
            if (value = getMatch("z")) {
                if (value.toLowerCase() === "z") {
                    date.gmtoff = 0;
                }
                else {
                    var match = value.match(/^((?:\-|\+)\d\d):?(\d\d)?/);
                    date.gmtoff = match[1] * 3600;
                    if (match[2]) {
                        date.gmtoff += date.gmtoff > 0 ? match[2] * 60 : -match[2] * 60;
                    }
                }
            }
            var fullDate = new Date(date.year, date.month, date.day, date.hour, date.min, date.sec, 0);
            HEAP32[tm >> 2] = fullDate.getSeconds();
            HEAP32[tm + 4 >> 2] = fullDate.getMinutes();
            HEAP32[tm + 8 >> 2] = fullDate.getHours();
            HEAP32[tm + 12 >> 2] = fullDate.getDate();
            HEAP32[tm + 16 >> 2] = fullDate.getMonth();
            HEAP32[tm + 20 >> 2] = fullDate.getFullYear() - 1900;
            HEAP32[tm + 24 >> 2] = fullDate.getDay();
            HEAP32[tm + 28 >> 2] = arraySum(isLeapYear(fullDate.getFullYear()) ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR, fullDate.getMonth() - 1) + fullDate.getDate() - 1;
            HEAP32[tm + 32 >> 2] = 0;
            HEAP32[tm + 36 >> 2] = date.gmtoff;
            return buf + lengthBytesUTF8(matches[0]);
        } return 0; };
        _strptime.sig = "pppp";
        var _strptime_l = (buf, format, tm, locale) => _strptime(buf, format, tm);
        _strptime_l.sig = "ppppp";
        function ___syscall_shutdown(fd, how) { try {
            getSocketFromFD(fd);
            return -52;
        }
        catch (e) {
            if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
                throw e;
            return -e.errno;
        } }
        ___syscall_shutdown.sig = "iiiiiii";
        var __dlsym_catchup_js = (handle, symbolIndex) => { var lib = LDSO.loadedLibsByHandle[handle]; var symDict = lib.exports; var symName = Object.keys(symDict)[symbolIndex]; var sym = symDict[symName]; var result = addFunction(sym, sym.sig); return result; };
        __dlsym_catchup_js.sig = "ppi";
        var FS_createPath = (...args) => FS.createPath(...args);
        var FS_createDevice = (...args) => FS.createDevice(...args);
        var FS_readFile = (...args) => FS.readFile(...args);
        var FS_root = (...args) => FS.root(...args);
        var FS_mounts = (...args) => FS.mounts(...args);
        var FS_devices = (...args) => FS.devices(...args);
        var FS_streams = (...args) => FS.streams(...args);
        var FS_nextInode = (...args) => FS.nextInode(...args);
        var FS_nameTable = (...args) => FS.nameTable(...args);
        var FS_currentPath = (...args) => FS.currentPath(...args);
        var FS_initialized = (...args) => FS.initialized(...args);
        var FS_ignorePermissions = (...args) => FS.ignorePermissions(...args);
        var FS_filesystems = (...args) => FS.filesystems(...args);
        var FS_syncFSRequests = (...args) => FS.syncFSRequests(...args);
        var FS_readFiles = (...args) => FS.readFiles(...args);
        var FS_lookupPath = (...args) => FS.lookupPath(...args);
        var FS_getPath = (...args) => FS.getPath(...args);
        var FS_hashName = (...args) => FS.hashName(...args);
        var FS_hashAddNode = (...args) => FS.hashAddNode(...args);
        var FS_hashRemoveNode = (...args) => FS.hashRemoveNode(...args);
        var FS_lookupNode = (...args) => FS.lookupNode(...args);
        var FS_createNode = (...args) => FS.createNode(...args);
        var FS_destroyNode = (...args) => FS.destroyNode(...args);
        var FS_isRoot = (...args) => FS.isRoot(...args);
        var FS_isMountpoint = (...args) => FS.isMountpoint(...args);
        var FS_isFile = (...args) => FS.isFile(...args);
        var FS_isDir = (...args) => FS.isDir(...args);
        var FS_isLink = (...args) => FS.isLink(...args);
        var FS_isChrdev = (...args) => FS.isChrdev(...args);
        var FS_isBlkdev = (...args) => FS.isBlkdev(...args);
        var FS_isFIFO = (...args) => FS.isFIFO(...args);
        var FS_isSocket = (...args) => FS.isSocket(...args);
        var FS_flagsToPermissionString = (...args) => FS.flagsToPermissionString(...args);
        var FS_nodePermissions = (...args) => FS.nodePermissions(...args);
        var FS_mayLookup = (...args) => FS.mayLookup(...args);
        var FS_mayCreate = (...args) => FS.mayCreate(...args);
        var FS_mayDelete = (...args) => FS.mayDelete(...args);
        var FS_mayOpen = (...args) => FS.mayOpen(...args);
        var FS_checkOpExists = (...args) => FS.checkOpExists(...args);
        var FS_nextfd = (...args) => FS.nextfd(...args);
        var FS_getStreamChecked = (...args) => FS.getStreamChecked(...args);
        var FS_getStream = (...args) => FS.getStream(...args);
        var FS_createStream = (...args) => FS.createStream(...args);
        var FS_closeStream = (...args) => FS.closeStream(...args);
        var FS_dupStream = (...args) => FS.dupStream(...args);
        var FS_doSetAttr = (...args) => FS.doSetAttr(...args);
        var FS_chrdev_stream_ops = (...args) => FS.chrdev_stream_ops(...args);
        var FS_major = (...args) => FS.major(...args);
        var FS_minor = (...args) => FS.minor(...args);
        var FS_makedev = (...args) => FS.makedev(...args);
        var FS_registerDevice = (...args) => FS.registerDevice(...args);
        var FS_getDevice = (...args) => FS.getDevice(...args);
        var FS_getMounts = (...args) => FS.getMounts(...args);
        var FS_syncfs = (...args) => FS.syncfs(...args);
        var FS_mount = (...args) => FS.mount(...args);
        var FS_unmount = (...args) => FS.unmount(...args);
        var FS_lookup = (...args) => FS.lookup(...args);
        var FS_mknod = (...args) => FS.mknod(...args);
        var FS_statfs = (...args) => FS.statfs(...args);
        var FS_statfsStream = (...args) => FS.statfsStream(...args);
        var FS_statfsNode = (...args) => FS.statfsNode(...args);
        var FS_create = (...args) => FS.create(...args);
        var FS_mkdir = (...args) => FS.mkdir(...args);
        var FS_mkdev = (...args) => FS.mkdev(...args);
        var FS_symlink = (...args) => FS.symlink(...args);
        var FS_rename = (...args) => FS.rename(...args);
        var FS_rmdir = (...args) => FS.rmdir(...args);
        var FS_readdir = (...args) => FS.readdir(...args);
        var FS_readlink = (...args) => FS.readlink(...args);
        var FS_stat = (...args) => FS.stat(...args);
        var FS_fstat = (...args) => FS.fstat(...args);
        var FS_lstat = (...args) => FS.lstat(...args);
        var FS_doChmod = (...args) => FS.doChmod(...args);
        var FS_chmod = (...args) => FS.chmod(...args);
        var FS_lchmod = (...args) => FS.lchmod(...args);
        var FS_fchmod = (...args) => FS.fchmod(...args);
        var FS_doChown = (...args) => FS.doChown(...args);
        var FS_chown = (...args) => FS.chown(...args);
        var FS_lchown = (...args) => FS.lchown(...args);
        var FS_fchown = (...args) => FS.fchown(...args);
        var FS_doTruncate = (...args) => FS.doTruncate(...args);
        var FS_truncate = (...args) => FS.truncate(...args);
        var FS_ftruncate = (...args) => FS.ftruncate(...args);
        var FS_utime = (...args) => FS.utime(...args);
        var FS_open = (...args) => FS.open(...args);
        var FS_close = (...args) => FS.close(...args);
        var FS_isClosed = (...args) => FS.isClosed(...args);
        var FS_llseek = (...args) => FS.llseek(...args);
        var FS_read = (...args) => FS.read(...args);
        var FS_write = (...args) => FS.write(...args);
        var FS_mmap = (...args) => FS.mmap(...args);
        var FS_msync = (...args) => FS.msync(...args);
        var FS_ioctl = (...args) => FS.ioctl(...args);
        var FS_writeFile = (...args) => FS.writeFile(...args);
        var FS_cwd = (...args) => FS.cwd(...args);
        var FS_chdir = (...args) => FS.chdir(...args);
        var FS_createDefaultDirectories = (...args) => FS.createDefaultDirectories(...args);
        var FS_createDefaultDevices = (...args) => FS.createDefaultDevices(...args);
        var FS_createSpecialDirectories = (...args) => FS.createSpecialDirectories(...args);
        var FS_createStandardStreams = (...args) => FS.createStandardStreams(...args);
        var FS_staticInit = (...args) => FS.staticInit(...args);
        var FS_init = (...args) => FS.init(...args);
        var FS_quit = (...args) => FS.quit(...args);
        var FS_findObject = (...args) => FS.findObject(...args);
        var FS_analyzePath = (...args) => FS.analyzePath(...args);
        var FS_createFile = (...args) => FS.createFile(...args);
        var FS_forceLoadFile = (...args) => FS.forceLoadFile(...args);
        var FS_createLazyFile = (...args) => FS.createLazyFile(...args);
        var _setNetworkCallback = (event, userData, callback) => { function _callback(data) { callUserCallback(() => { if (event === "error") {
            withStackSave(() => { var msg = stringToUTF8OnStack(data[2]); getWasmTableEntry(callback)(data[0], data[1], msg, userData); });
        }
        else {
            getWasmTableEntry(callback)(data, userData);
        } }); } SOCKFS.on(event, callback ? _callback : null); };
        var _emscripten_set_socket_error_callback = (userData, callback) => _setNetworkCallback("error", userData, callback);
        _emscripten_set_socket_error_callback.sig = "vpp";
        var _emscripten_set_socket_open_callback = (userData, callback) => _setNetworkCallback("open", userData, callback);
        _emscripten_set_socket_open_callback.sig = "vpp";
        var _emscripten_set_socket_listen_callback = (userData, callback) => _setNetworkCallback("listen", userData, callback);
        _emscripten_set_socket_listen_callback.sig = "vpp";
        var _emscripten_set_socket_connection_callback = (userData, callback) => _setNetworkCallback("connection", userData, callback);
        _emscripten_set_socket_connection_callback.sig = "vpp";
        var _emscripten_set_socket_message_callback = (userData, callback) => _setNetworkCallback("message", userData, callback);
        _emscripten_set_socket_message_callback.sig = "vpp";
        var _emscripten_set_socket_close_callback = (userData, callback) => _setNetworkCallback("close", userData, callback);
        _emscripten_set_socket_close_callback.sig = "vpp";
        var miniTempWebGLFloatBuffers = [];
        var miniTempWebGLIntBuffers = [];
        var _emscripten_webgl_enable_WEBGL_multi_draw = ctx => webgl_enable_WEBGL_multi_draw(GL.contexts[ctx].GLctx);
        _emscripten_webgl_enable_WEBGL_multi_draw.sig = "ip";
        var _emscripten_webgl_enable_EXT_polygon_offset_clamp = ctx => webgl_enable_EXT_polygon_offset_clamp(GL.contexts[ctx].GLctx);
        _emscripten_webgl_enable_EXT_polygon_offset_clamp.sig = "ip";
        var _emscripten_webgl_enable_EXT_clip_control = ctx => webgl_enable_EXT_clip_control(GL.contexts[ctx].GLctx);
        _emscripten_webgl_enable_EXT_clip_control.sig = "ip";
        var _emscripten_webgl_enable_WEBGL_polygon_mode = ctx => webgl_enable_WEBGL_polygon_mode(GL.contexts[ctx].GLctx);
        _emscripten_webgl_enable_WEBGL_polygon_mode.sig = "ip";
        var _glVertexPointer = (size, type, stride, ptr) => { throw "Legacy GL function (glVertexPointer) called. If you want legacy GL emulation, you need to compile with -sLEGACY_GL_EMULATION to enable legacy GL emulation."; };
        _glVertexPointer.sig = "viiip";
        var _glMatrixMode = () => { throw "Legacy GL function (glMatrixMode) called. If you want legacy GL emulation, you need to compile with -sLEGACY_GL_EMULATION to enable legacy GL emulation."; };
        _glMatrixMode.sig = "vi";
        var _glBegin = () => { throw "Legacy GL function (glBegin) called. If you want legacy GL emulation, you need to compile with -sLEGACY_GL_EMULATION to enable legacy GL emulation."; };
        _glBegin.sig = "vi";
        var _glLoadIdentity = () => { throw "Legacy GL function (glLoadIdentity) called. If you want legacy GL emulation, you need to compile with -sLEGACY_GL_EMULATION to enable legacy GL emulation."; };
        _glLoadIdentity.sig = "v";
        var _glMultiDrawArraysWEBGL = (mode, firsts, counts, drawcount) => { GLctx.multiDrawWebgl["multiDrawArraysWEBGL"](mode, HEAP32, firsts >> 2, HEAP32, counts >> 2, drawcount); };
        _glMultiDrawArraysWEBGL.sig = "vippi";
        var _glMultiDrawArrays = _glMultiDrawArraysWEBGL;
        _glMultiDrawArrays.sig = "vippi";
        var _glMultiDrawArraysANGLE = _glMultiDrawArraysWEBGL;
        var _glMultiDrawArraysInstancedWEBGL = (mode, firsts, counts, instanceCounts, drawcount) => { GLctx.multiDrawWebgl["multiDrawArraysInstancedWEBGL"](mode, HEAP32, firsts >> 2, HEAP32, counts >> 2, HEAP32, instanceCounts >> 2, drawcount); };
        _glMultiDrawArraysInstancedWEBGL.sig = "vipppi";
        var _glMultiDrawArraysInstancedANGLE = _glMultiDrawArraysInstancedWEBGL;
        var _glMultiDrawElementsWEBGL = (mode, counts, type, offsets, drawcount) => { GLctx.multiDrawWebgl["multiDrawElementsWEBGL"](mode, HEAP32, counts >> 2, type, HEAP32, offsets >> 2, drawcount); };
        _glMultiDrawElementsWEBGL.sig = "vipipi";
        var _glMultiDrawElements = _glMultiDrawElementsWEBGL;
        _glMultiDrawElements.sig = "vipipi";
        var _glMultiDrawElementsANGLE = _glMultiDrawElementsWEBGL;
        var _glMultiDrawElementsInstancedWEBGL = (mode, counts, type, offsets, instanceCounts, drawcount) => { GLctx.multiDrawWebgl["multiDrawElementsInstancedWEBGL"](mode, HEAP32, counts >> 2, type, HEAP32, offsets >> 2, HEAP32, instanceCounts >> 2, drawcount); };
        _glMultiDrawElementsInstancedWEBGL.sig = "vipippi";
        var _glMultiDrawElementsInstancedANGLE = _glMultiDrawElementsInstancedWEBGL;
        var _glClearDepth = x0 => GLctx.clearDepth(x0);
        _glClearDepth.sig = "vd";
        var _glDepthRange = (x0, x1) => GLctx.depthRange(x0, x1);
        _glDepthRange.sig = "vdd";
        var _emscripten_glVertexPointer = _glVertexPointer;
        _emscripten_glVertexPointer.sig = "viiip";
        var _emscripten_glMatrixMode = _glMatrixMode;
        _emscripten_glMatrixMode.sig = "vi";
        var _emscripten_glBegin = _glBegin;
        _emscripten_glBegin.sig = "vi";
        var _emscripten_glLoadIdentity = _glLoadIdentity;
        _emscripten_glLoadIdentity.sig = "v";
        var _emscripten_glMultiDrawArrays = _glMultiDrawArrays;
        _emscripten_glMultiDrawArrays.sig = "vippi";
        var _emscripten_glMultiDrawArraysANGLE = _glMultiDrawArraysANGLE;
        var _emscripten_glMultiDrawArraysWEBGL = _glMultiDrawArraysWEBGL;
        var _emscripten_glMultiDrawArraysInstancedANGLE = _glMultiDrawArraysInstancedANGLE;
        var _emscripten_glMultiDrawArraysInstancedWEBGL = _glMultiDrawArraysInstancedWEBGL;
        var _emscripten_glMultiDrawElements = _glMultiDrawElements;
        _emscripten_glMultiDrawElements.sig = "vipipi";
        var _emscripten_glMultiDrawElementsANGLE = _glMultiDrawElementsANGLE;
        var _emscripten_glMultiDrawElementsWEBGL = _glMultiDrawElementsWEBGL;
        var _emscripten_glMultiDrawElementsInstancedANGLE = _glMultiDrawElementsInstancedANGLE;
        var _emscripten_glMultiDrawElementsInstancedWEBGL = _glMultiDrawElementsInstancedWEBGL;
        var _emscripten_glClearDepth = _glClearDepth;
        _emscripten_glClearDepth.sig = "vd";
        var _emscripten_glDepthRange = _glDepthRange;
        _emscripten_glDepthRange.sig = "vdd";
        var writeGLArray = (arr, dst, dstLength, heapType) => { var len = arr.length; var writeLength = dstLength < len ? dstLength : len; var heap = heapType ? HEAPF32 : HEAP32; dst = dst >> 2; for (var i = 0; i < writeLength; ++i) {
            heap[dst + i] = arr[i];
        } return len; };
        var webglPowerPreferences = ["default", "low-power", "high-performance"];
        var _emscripten_webgl_do_create_context = (target, attributes) => { var attr32 = attributes >> 2; var powerPreference = HEAP32[attr32 + (8 >> 2)]; var contextAttributes = { alpha: !!HEAP8[attributes + 0], depth: !!HEAP8[attributes + 1], stencil: !!HEAP8[attributes + 2], antialias: !!HEAP8[attributes + 3], premultipliedAlpha: !!HEAP8[attributes + 4], preserveDrawingBuffer: !!HEAP8[attributes + 5], powerPreference: webglPowerPreferences[powerPreference], failIfMajorPerformanceCaveat: !!HEAP8[attributes + 12], majorVersion: HEAP32[attr32 + (16 >> 2)], minorVersion: HEAP32[attr32 + (20 >> 2)], enableExtensionsByDefault: HEAP8[attributes + 24], explicitSwapControl: HEAP8[attributes + 25], proxyContextToMainThread: HEAP32[attr32 + (28 >> 2)], renderViaOffscreenBackBuffer: HEAP8[attributes + 32] }; var canvas = findCanvasEventTarget(target); if (!canvas) {
            return 0;
        } if (contextAttributes.explicitSwapControl) {
            return 0;
        } var contextHandle = GL.createContext(canvas, contextAttributes); return contextHandle; };
        _emscripten_webgl_do_create_context.sig = "ppp";
        var _emscripten_webgl_create_context = _emscripten_webgl_do_create_context;
        _emscripten_webgl_create_context.sig = "ppp";
        var _emscripten_webgl_do_get_current_context = () => GL.currentContext ? GL.currentContext.handle : 0;
        _emscripten_webgl_do_get_current_context.sig = "p";
        var _emscripten_webgl_get_current_context = _emscripten_webgl_do_get_current_context;
        _emscripten_webgl_get_current_context.sig = "p";
        var _emscripten_webgl_do_commit_frame = () => { if (!GL.currentContext || !GL.currentContext.GLctx) {
            return -3;
        } if (!GL.currentContext.attributes.explicitSwapControl) {
            return -3;
        } return 0; };
        _emscripten_webgl_do_commit_frame.sig = "i";
        var _emscripten_webgl_commit_frame = _emscripten_webgl_do_commit_frame;
        _emscripten_webgl_commit_frame.sig = "i";
        var _emscripten_webgl_make_context_current = contextHandle => { var success = GL.makeContextCurrent(contextHandle); return success ? 0 : -5; };
        _emscripten_webgl_make_context_current.sig = "ip";
        var _emscripten_webgl_get_drawing_buffer_size = (contextHandle, width, height) => { var GLContext = GL.getContext(contextHandle); if (!GLContext || !GLContext.GLctx || !width || !height) {
            return -5;
        } HEAP32[width >> 2] = GLContext.GLctx.drawingBufferWidth; HEAP32[height >> 2] = GLContext.GLctx.drawingBufferHeight; return 0; };
        _emscripten_webgl_get_drawing_buffer_size.sig = "ippp";
        var _emscripten_webgl_get_context_attributes = (c, a) => { if (!a)
            return -5; c = GL.contexts[c]; if (!c)
            return -3; var t = c.GLctx; if (!t)
            return -3; t = t.getContextAttributes(); HEAP8[a] = t.alpha; HEAP8[a + 1] = t.depth; HEAP8[a + 2] = t.stencil; HEAP8[a + 3] = t.antialias; HEAP8[a + 4] = t.premultipliedAlpha; HEAP8[a + 5] = t.preserveDrawingBuffer; var power = t["powerPreference"] && webglPowerPreferences.indexOf(t["powerPreference"]); HEAP32[a + 8 >> 2] = power; HEAP8[a + 12] = t.failIfMajorPerformanceCaveat; HEAP32[a + 16 >> 2] = c.version; HEAP32[a + 20 >> 2] = 0; HEAP8[a + 24] = c.attributes.enableExtensionsByDefault; return 0; };
        _emscripten_webgl_get_context_attributes.sig = "ipp";
        var _emscripten_webgl_destroy_context = contextHandle => { if (GL.currentContext == contextHandle)
            GL.currentContext = 0; GL.deleteContext(contextHandle); };
        _emscripten_webgl_destroy_context.sig = "ip";
        var _emscripten_webgl_enable_extension = (contextHandle, extension) => { var context = GL.getContext(contextHandle); var extString = UTF8ToString(extension); if (extString.startsWith("GL_"))
            extString = extString.slice(3); if (extString == "WEBGL_draw_instanced_base_vertex_base_instance")
            webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance(GLctx); if (extString == "WEBGL_multi_draw_instanced_base_vertex_base_instance")
            webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance(GLctx); if (extString == "WEBGL_multi_draw")
            webgl_enable_WEBGL_multi_draw(GLctx); if (extString == "EXT_polygon_offset_clamp")
            webgl_enable_EXT_polygon_offset_clamp(GLctx); if (extString == "EXT_clip_control")
            webgl_enable_EXT_clip_control(GLctx); if (extString == "WEBGL_polygon_mode")
            webgl_enable_WEBGL_polygon_mode(GLctx); var ext = context.GLctx.getExtension(extString); return !!ext; };
        _emscripten_webgl_enable_extension.sig = "ipp";
        var _emscripten_supports_offscreencanvas = () => 0;
        _emscripten_supports_offscreencanvas.sig = "i";
        var registerWebGlEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => { var webGlEventHandlerFunc = (e = event) => { if (getWasmTableEntry(callbackfunc)(eventTypeId, 0, userData))
            e.preventDefault(); }; var eventHandler = { target: findEventTarget(target), eventTypeString, callbackfunc, handlerFunc: webGlEventHandlerFunc, useCapture }; JSEvents.registerOrRemoveHandler(eventHandler); };
        var _emscripten_set_webglcontextlost_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => { registerWebGlEventCallback(target, userData, useCapture, callbackfunc, 31, "webglcontextlost", targetThread); return 0; };
        _emscripten_set_webglcontextlost_callback_on_thread.sig = "ippipp";
        var _emscripten_set_webglcontextrestored_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => { registerWebGlEventCallback(target, userData, useCapture, callbackfunc, 32, "webglcontextrestored", targetThread); return 0; };
        _emscripten_set_webglcontextrestored_callback_on_thread.sig = "ippipp";
        var _emscripten_is_webgl_context_lost = contextHandle => !GL.contexts[contextHandle] || GL.contexts[contextHandle].GLctx.isContextLost();
        _emscripten_is_webgl_context_lost.sig = "ip";
        var _emscripten_webgl_get_supported_extensions = () => stringToNewUTF8(GLctx.getSupportedExtensions().join(" "));
        _emscripten_webgl_get_supported_extensions.sig = "p";
        var _emscripten_webgl_get_program_parameter_d = (program, param) => GLctx.getProgramParameter(GL.programs[program], param);
        _emscripten_webgl_get_program_parameter_d.sig = "dii";
        var _emscripten_webgl_get_program_info_log_utf8 = program => stringToNewUTF8(GLctx.getProgramInfoLog(GL.programs[program]));
        _emscripten_webgl_get_program_info_log_utf8.sig = "pi";
        var _emscripten_webgl_get_shader_parameter_d = (shader, param) => GLctx.getShaderParameter(GL.shaders[shader], param);
        _emscripten_webgl_get_shader_parameter_d.sig = "dii";
        var _emscripten_webgl_get_shader_info_log_utf8 = shader => stringToNewUTF8(GLctx.getShaderInfoLog(GL.shaders[shader]));
        _emscripten_webgl_get_shader_info_log_utf8.sig = "pi";
        var _emscripten_webgl_get_shader_source_utf8 = shader => stringToNewUTF8(GLctx.getShaderSource(GL.shaders[shader]));
        _emscripten_webgl_get_shader_source_utf8.sig = "pi";
        var _emscripten_webgl_get_vertex_attrib_d = (index, param) => GLctx.getVertexAttrib(index, param);
        _emscripten_webgl_get_vertex_attrib_d.sig = "dii";
        var _emscripten_webgl_get_vertex_attrib_o = (index, param) => { var obj = GLctx.getVertexAttrib(index, param); return obj?.name; };
        _emscripten_webgl_get_vertex_attrib_o.sig = "iii";
        var _emscripten_webgl_get_vertex_attrib_v = (index, param, dst, dstLength, dstType) => writeGLArray(GLctx.getVertexAttrib(index, param), dst, dstLength, dstType);
        _emscripten_webgl_get_vertex_attrib_v.sig = "iiipii";
        var _emscripten_webgl_get_uniform_d = (program, location) => GLctx.getUniform(GL.programs[program], webglGetUniformLocation(location));
        _emscripten_webgl_get_uniform_d.sig = "dii";
        var _emscripten_webgl_get_uniform_v = (program, location, dst, dstLength, dstType) => writeGLArray(GLctx.getUniform(GL.programs[program], webglGetUniformLocation(location)), dst, dstLength, dstType);
        _emscripten_webgl_get_uniform_v.sig = "iiipii";
        var _emscripten_webgl_get_parameter_v = (param, dst, dstLength, dstType) => writeGLArray(GLctx.getParameter(param), dst, dstLength, dstType);
        _emscripten_webgl_get_parameter_v.sig = "iipii";
        var _emscripten_webgl_get_parameter_d = param => GLctx.getParameter(param);
        _emscripten_webgl_get_parameter_d.sig = "di";
        var _emscripten_webgl_get_parameter_o = param => { var obj = GLctx.getParameter(param); return obj?.name; };
        _emscripten_webgl_get_parameter_o.sig = "ii";
        var _emscripten_webgl_get_parameter_utf8 = param => stringToNewUTF8(GLctx.getParameter(param));
        _emscripten_webgl_get_parameter_utf8.sig = "pi";
        var _emscripten_webgl_get_parameter_i64v = (param, dst) => writeI53ToI64(dst, GLctx.getParameter(param));
        _emscripten_webgl_get_parameter_i64v.sig = "vip";
        var _glutPostRedisplay = () => { if (GLUT.displayFunc && !GLUT.requestedAnimationFrame) {
            GLUT.requestedAnimationFrame = true;
            MainLoop.requestAnimationFrame(() => { GLUT.requestedAnimationFrame = false; MainLoop.runIter(() => getWasmTableEntry(GLUT.displayFunc)()); });
        } };
        _glutPostRedisplay.sig = "v";
        var GLUT = { initTime: null, idleFunc: null, displayFunc: null, keyboardFunc: null, keyboardUpFunc: null, specialFunc: null, specialUpFunc: null, reshapeFunc: null, motionFunc: null, passiveMotionFunc: null, mouseFunc: null, buttons: 0, modifiers: 0, initWindowWidth: 256, initWindowHeight: 256, initDisplayMode: 18, windowX: 0, windowY: 0, windowWidth: 0, windowHeight: 0, requestedAnimationFrame: false, saveModifiers: event => { GLUT.modifiers = 0; if (event["shiftKey"])
                GLUT.modifiers += 1; if (event["ctrlKey"])
                GLUT.modifiers += 2; if (event["altKey"])
                GLUT.modifiers += 4; }, onMousemove: event => { var lastX = Browser.mouseX; var lastY = Browser.mouseY; Browser.calculateMouseEvent(event); var newX = Browser.mouseX; var newY = Browser.mouseY; if (newX == lastX && newY == lastY)
                return; if (GLUT.buttons == 0 && event.target == Browser.getCanvas() && GLUT.passiveMotionFunc) {
                event.preventDefault();
                GLUT.saveModifiers(event);
                getWasmTableEntry(GLUT.passiveMotionFunc)(lastX, lastY);
            }
            else if (GLUT.buttons != 0 && GLUT.motionFunc) {
                event.preventDefault();
                GLUT.saveModifiers(event);
                getWasmTableEntry(GLUT.motionFunc)(lastX, lastY);
            } }, getSpecialKey: keycode => { var key = null; switch (keycode) {
                case 8:
                    key = 120;
                    break;
                case 46:
                    key = 111;
                    break;
                case 112:
                    key = 1;
                    break;
                case 113:
                    key = 2;
                    break;
                case 114:
                    key = 3;
                    break;
                case 115:
                    key = 4;
                    break;
                case 116:
                    key = 5;
                    break;
                case 117:
                    key = 6;
                    break;
                case 118:
                    key = 7;
                    break;
                case 119:
                    key = 8;
                    break;
                case 120:
                    key = 9;
                    break;
                case 121:
                    key = 10;
                    break;
                case 122:
                    key = 11;
                    break;
                case 123:
                    key = 12;
                    break;
                case 37:
                    key = 100;
                    break;
                case 38:
                    key = 101;
                    break;
                case 39:
                    key = 102;
                    break;
                case 40:
                    key = 103;
                    break;
                case 33:
                    key = 104;
                    break;
                case 34:
                    key = 105;
                    break;
                case 36:
                    key = 106;
                    break;
                case 35:
                    key = 107;
                    break;
                case 45:
                    key = 108;
                    break;
                case 16:
                case 5:
                    key = 112;
                    break;
                case 6:
                    key = 113;
                    break;
                case 17:
                case 3:
                    key = 114;
                    break;
                case 4:
                    key = 115;
                    break;
                case 18:
                case 2:
                    key = 116;
                    break;
                case 1:
                    key = 117;
                    break;
            } return key; }, getASCIIKey: event => { if (event["ctrlKey"] || event["altKey"] || event["metaKey"])
                return null; var keycode = event["keyCode"]; if (48 <= keycode && keycode <= 57)
                return keycode; if (65 <= keycode && keycode <= 90)
                return event["shiftKey"] ? keycode : keycode + 32; if (96 <= keycode && keycode <= 105)
                return keycode - 48; if (106 <= keycode && keycode <= 111)
                return keycode - 106 + 42; switch (keycode) {
                case 9:
                case 13:
                case 27:
                case 32:
                case 61: return keycode;
            } var s = event["shiftKey"]; switch (keycode) {
                case 186: return s ? 58 : 59;
                case 187: return s ? 43 : 61;
                case 188: return s ? 60 : 44;
                case 189: return s ? 95 : 45;
                case 190: return s ? 62 : 46;
                case 191: return s ? 63 : 47;
                case 219: return s ? 123 : 91;
                case 220: return s ? 124 : 47;
                case 221: return s ? 125 : 93;
                case 222: return s ? 34 : 39;
            } return null; }, onKeydown: event => { if (GLUT.specialFunc || GLUT.keyboardFunc) {
                var key = GLUT.getSpecialKey(event["keyCode"]);
                if (key !== null) {
                    if (GLUT.specialFunc) {
                        event.preventDefault();
                        GLUT.saveModifiers(event);
                        getWasmTableEntry(GLUT.specialFunc)(key, Browser.mouseX, Browser.mouseY);
                    }
                }
                else {
                    key = GLUT.getASCIIKey(event);
                    if (key !== null && GLUT.keyboardFunc) {
                        event.preventDefault();
                        GLUT.saveModifiers(event);
                        getWasmTableEntry(GLUT.keyboardFunc)(key, Browser.mouseX, Browser.mouseY);
                    }
                }
            } }, onKeyup: event => { if (GLUT.specialUpFunc || GLUT.keyboardUpFunc) {
                var key = GLUT.getSpecialKey(event["keyCode"]);
                if (key !== null) {
                    if (GLUT.specialUpFunc) {
                        event.preventDefault();
                        GLUT.saveModifiers(event);
                        getWasmTableEntry(GLUT.specialUpFunc)(key, Browser.mouseX, Browser.mouseY);
                    }
                }
                else {
                    key = GLUT.getASCIIKey(event);
                    if (key !== null && GLUT.keyboardUpFunc) {
                        event.preventDefault();
                        GLUT.saveModifiers(event);
                        getWasmTableEntry(GLUT.keyboardUpFunc)(key, Browser.mouseX, Browser.mouseY);
                    }
                }
            } }, touchHandler: event => { if (event.target != Browser.getCanvas()) {
                return;
            } var touches = event.changedTouches, main = touches[0], type = ""; switch (event.type) {
                case "touchstart":
                    type = "mousedown";
                    break;
                case "touchmove":
                    type = "mousemove";
                    break;
                case "touchend":
                    type = "mouseup";
                    break;
                default: return;
            } var simulatedEvent = document.createEvent("MouseEvent"); simulatedEvent.initMouseEvent(type, true, true, window, 1, main.screenX, main.screenY, main.clientX, main.clientY, false, false, false, false, 0, null); main.target.dispatchEvent(simulatedEvent); event.preventDefault(); }, onMouseButtonDown: event => { Browser.calculateMouseEvent(event); GLUT.buttons |= 1 << event["button"]; if (event.target == Browser.getCanvas() && GLUT.mouseFunc) {
                try {
                    event.target.setCapture();
                }
                catch (e) { }
                event.preventDefault();
                GLUT.saveModifiers(event);
                getWasmTableEntry(GLUT.mouseFunc)(event["button"], 0, Browser.mouseX, Browser.mouseY);
            } }, onMouseButtonUp: event => { Browser.calculateMouseEvent(event); GLUT.buttons &= ~(1 << event["button"]); if (GLUT.mouseFunc) {
                event.preventDefault();
                GLUT.saveModifiers(event);
                getWasmTableEntry(GLUT.mouseFunc)(event["button"], 1, Browser.mouseX, Browser.mouseY);
            } }, onMouseWheel: event => { Browser.calculateMouseEvent(event); var e = window.event || event; var delta = -Browser.getMouseWheelDelta(event); delta = delta == 0 ? 0 : delta > 0 ? Math.max(delta, 1) : Math.min(delta, -1); var button = 3; if (delta < 0) {
                button = 4;
            } if (GLUT.mouseFunc) {
                event.preventDefault();
                GLUT.saveModifiers(event);
                getWasmTableEntry(GLUT.mouseFunc)(button, 0, Browser.mouseX, Browser.mouseY);
            } }, onFullscreenEventChange: event => { var width; var height; if (document["fullscreen"] || document["fullScreen"] || document["mozFullScreen"] || document["webkitIsFullScreen"]) {
                width = screen["width"];
                height = screen["height"];
            }
            else {
                width = GLUT.windowWidth;
                height = GLUT.windowHeight;
                document.removeEventListener("fullscreenchange", GLUT.onFullscreenEventChange, true);
                document.removeEventListener("mozfullscreenchange", GLUT.onFullscreenEventChange, true);
                document.removeEventListener("webkitfullscreenchange", GLUT.onFullscreenEventChange, true);
            } Browser.setCanvasSize(width, height, true); if (GLUT.reshapeFunc) {
                getWasmTableEntry(GLUT.reshapeFunc)(width, height);
            } _glutPostRedisplay(); } };
        var _glutGetModifiers = () => GLUT.modifiers;
        _glutGetModifiers.sig = "i";
        var _glutInit = (argcp, argv) => { GLUT.initTime = Date.now(); var isTouchDevice = "ontouchstart" in document.documentElement; if (isTouchDevice) {
            window.addEventListener("touchmove", GLUT.touchHandler, true);
            window.addEventListener("touchstart", GLUT.touchHandler, true);
            window.addEventListener("touchend", GLUT.touchHandler, true);
        } window.addEventListener("keydown", GLUT.onKeydown, true); window.addEventListener("keyup", GLUT.onKeyup, true); window.addEventListener("mousemove", GLUT.onMousemove, true); window.addEventListener("mousedown", GLUT.onMouseButtonDown, true); window.addEventListener("mouseup", GLUT.onMouseButtonUp, true); window.addEventListener("mousewheel", GLUT.onMouseWheel, true); window.addEventListener("DOMMouseScroll", GLUT.onMouseWheel, true); Browser.resizeListeners.push((width, height) => { if (GLUT.reshapeFunc) {
            getWasmTableEntry(GLUT.reshapeFunc)(width, height);
        } }); addOnExit(() => { if (isTouchDevice) {
            window.removeEventListener("touchmove", GLUT.touchHandler, true);
            window.removeEventListener("touchstart", GLUT.touchHandler, true);
            window.removeEventListener("touchend", GLUT.touchHandler, true);
        } window.removeEventListener("keydown", GLUT.onKeydown, true); window.removeEventListener("keyup", GLUT.onKeyup, true); window.removeEventListener("mousemove", GLUT.onMousemove, true); window.removeEventListener("mousedown", GLUT.onMouseButtonDown, true); window.removeEventListener("mouseup", GLUT.onMouseButtonUp, true); window.removeEventListener("mousewheel", GLUT.onMouseWheel, true); window.removeEventListener("DOMMouseScroll", GLUT.onMouseWheel, true); var canvas = Browser.getCanvas(); canvas.width = canvas.height = 1; }); };
        _glutInit.sig = "vpp";
        var _glutInitWindowSize = (width, height) => { Browser.setCanvasSize(GLUT.initWindowWidth = width, GLUT.initWindowHeight = height); };
        _glutInitWindowSize.sig = "vii";
        var _glutInitWindowPosition = (x, y) => { };
        _glutInitWindowPosition.sig = "vii";
        var _glutGet = type => { switch (type) {
            case 100: return 0;
            case 101: return 0;
            case 102: return Browser.getCanvas().width;
            case 103: return Browser.getCanvas().height;
            case 200: return Browser.getCanvas().width;
            case 201: return Browser.getCanvas().height;
            case 500: return 0;
            case 501: return 0;
            case 502: return GLUT.initWindowWidth;
            case 503: return GLUT.initWindowHeight;
            case 700:
                var now = Date.now();
                return now - GLUT.initTime;
            case 105: return GLctx.getContextAttributes().stencil ? 8 : 0;
            case 106: return GLctx.getContextAttributes().depth ? 8 : 0;
            case 110: return GLctx.getContextAttributes().alpha ? 8 : 0;
            case 120: return GLctx.getContextAttributes().antialias ? 1 : 0;
            default: throw "glutGet(" + type + ") not implemented yet";
        } };
        _glutGet.sig = "ii";
        var _glutIdleFunc = func => { function callback() { if (GLUT.idleFunc) {
            getWasmTableEntry(GLUT.idleFunc)();
            safeSetTimeout(callback, 4);
        } } if (!GLUT.idleFunc) {
            safeSetTimeout(callback, 0);
        } GLUT.idleFunc = func; };
        _glutIdleFunc.sig = "vp";
        var _glutTimerFunc = (msec, func, value) => safeSetTimeout(() => getWasmTableEntry(func)(value), msec);
        _glutTimerFunc.sig = "vipi";
        var _glutDisplayFunc = func => { GLUT.displayFunc = func; };
        _glutDisplayFunc.sig = "vp";
        var _glutKeyboardFunc = func => { GLUT.keyboardFunc = func; };
        _glutKeyboardFunc.sig = "vp";
        var _glutKeyboardUpFunc = func => { GLUT.keyboardUpFunc = func; };
        _glutKeyboardUpFunc.sig = "vp";
        var _glutSpecialFunc = func => { GLUT.specialFunc = func; };
        _glutSpecialFunc.sig = "vp";
        var _glutSpecialUpFunc = func => { GLUT.specialUpFunc = func; };
        _glutSpecialUpFunc.sig = "vp";
        var _glutReshapeFunc = func => { GLUT.reshapeFunc = func; };
        _glutReshapeFunc.sig = "vp";
        var _glutMotionFunc = func => { GLUT.motionFunc = func; };
        _glutMotionFunc.sig = "vp";
        var _glutPassiveMotionFunc = func => { GLUT.passiveMotionFunc = func; };
        _glutPassiveMotionFunc.sig = "vp";
        var _glutMouseFunc = func => { GLUT.mouseFunc = func; };
        _glutMouseFunc.sig = "vp";
        var _glutSetCursor = cursor => { var cursorStyle = "auto"; switch (cursor) {
            case 0: break;
            case 1: break;
            case 2:
                cursorStyle = "pointer";
                break;
            case 3: break;
            case 4:
                cursorStyle = "help";
                break;
            case 5: break;
            case 6: break;
            case 7:
                cursorStyle = "wait";
                break;
            case 8:
                cursorStyle = "text";
                break;
            case 9:
            case 102:
                cursorStyle = "crosshair";
                break;
            case 10:
                cursorStyle = "ns-resize";
                break;
            case 11:
                cursorStyle = "ew-resize";
                break;
            case 12:
                cursorStyle = "n-resize";
                break;
            case 13:
                cursorStyle = "s-resize";
                break;
            case 14:
                cursorStyle = "w-resize";
                break;
            case 15:
                cursorStyle = "e-resize";
                break;
            case 16:
                cursorStyle = "nw-resize";
                break;
            case 17:
                cursorStyle = "ne-resize";
                break;
            case 18:
                cursorStyle = "se-resize";
                break;
            case 19:
                cursorStyle = "sw-resize";
                break;
            case 100: break;
            case 101:
                cursorStyle = "none";
                break;
            default: throw "glutSetCursor: Unknown cursor type: " + cursor;
        } Browser.getCanvas().style.cursor = cursorStyle; };
        _glutSetCursor.sig = "vi";
        var _glutCreateWindow = name => { var contextAttributes = { antialias: (GLUT.initDisplayMode & 128) != 0, depth: (GLUT.initDisplayMode & 16) != 0, stencil: (GLUT.initDisplayMode & 32) != 0, alpha: (GLUT.initDisplayMode & 8) != 0 }; if (!Browser.createContext(Browser.getCanvas(), true, true, contextAttributes)) {
            return 0;
        } return 1; };
        _glutCreateWindow.sig = "ip";
        var _glutDestroyWindow = name => { delete Module["ctx"]; return 1; };
        _glutDestroyWindow.sig = "vi";
        var _glutReshapeWindow = (width, height) => { Browser.exitFullscreen(); Browser.setCanvasSize(width, height, true); if (GLUT.reshapeFunc) {
            getWasmTableEntry(GLUT.reshapeFunc)(width, height);
        } _glutPostRedisplay(); };
        _glutReshapeWindow.sig = "vii";
        var _glutPositionWindow = (x, y) => { Browser.exitFullscreen(); _glutPostRedisplay(); };
        _glutPositionWindow.sig = "vii";
        var _glutFullScreen = () => { GLUT.windowX = 0; GLUT.windowY = 0; var canvas = Browser.getCanvas(); GLUT.windowWidth = canvas.width; GLUT.windowHeight = canvas.height; document.addEventListener("fullscreenchange", GLUT.onFullscreenEventChange, true); document.addEventListener("mozfullscreenchange", GLUT.onFullscreenEventChange, true); document.addEventListener("webkitfullscreenchange", GLUT.onFullscreenEventChange, true); Browser.requestFullscreen(false, false); };
        _glutFullScreen.sig = "v";
        var _glutInitDisplayMode = mode => GLUT.initDisplayMode = mode;
        _glutInitDisplayMode.sig = "vi";
        var _glutSwapBuffers = () => { };
        _glutSwapBuffers.sig = "v";
        var _glutMainLoop = () => { var canvas = Browser.getCanvas(); _glutReshapeWindow(canvas.width, canvas.height); _glutPostRedisplay(); throw "unwind"; };
        _glutMainLoop.sig = "v";
        var _XOpenDisplay = name => 1;
        _XOpenDisplay.sig = "pp";
        var _XCreateWindow = (display, parent, x, y, width, height, border_width, depth, class_, visual, valuemask, attributes) => { Browser.setCanvasSize(width, height); return 2; };
        _XCreateWindow.sig = "pppiiiiiiippp";
        var _XChangeWindowAttributes = (display, window, valuemask, attributes) => { };
        _XChangeWindowAttributes.sig = "ipppp";
        var _XSetWMHints = (display, win, hints) => { };
        _XSetWMHints.sig = "ippp";
        var _XMapWindow = (display, win) => { };
        _XMapWindow.sig = "ipp";
        var _XStoreName = (display, win, name) => { };
        _XStoreName.sig = "ippp";
        var _XInternAtom = (display, name_, hmm) => 0;
        _XInternAtom.sig = "pppi";
        var _XSendEvent = (display, win, propagate, event_mask, even_send) => { };
        _XSendEvent.sig = "ippipp";
        var _XPending = display => 0;
        _XPending.sig = "ip";
        var _eglGetConfigs = (display, configs, config_size, numConfigs) => EGL.chooseConfig(display, 0, configs, config_size, numConfigs);
        _eglGetConfigs.sig = "ippip";
        var _eglQuerySurface = (display, surface, attribute, value) => { if (display != 62e3) {
            EGL.setErrorCode(12296);
            return 0;
        } if (surface != 62006) {
            EGL.setErrorCode(12301);
            return 0;
        } if (!value) {
            EGL.setErrorCode(12300);
            return 0;
        } EGL.setErrorCode(12288); switch (attribute) {
            case 12328:
                HEAP32[value >> 2] = 62002;
                return 1;
            case 12376: return 1;
            case 12375:
                HEAP32[value >> 2] = Browser.getCanvas().width;
                return 1;
            case 12374:
                HEAP32[value >> 2] = Browser.getCanvas().height;
                return 1;
            case 12432:
                HEAP32[value >> 2] = -1;
                return 1;
            case 12433:
                HEAP32[value >> 2] = -1;
                return 1;
            case 12434:
                HEAP32[value >> 2] = -1;
                return 1;
            case 12422:
                HEAP32[value >> 2] = 12420;
                return 1;
            case 12441:
                HEAP32[value >> 2] = 12442;
                return 1;
            case 12435:
                HEAP32[value >> 2] = 12437;
                return 1;
            case 12416:
            case 12417:
            case 12418:
            case 12419: return 1;
            default:
                EGL.setErrorCode(12292);
                return 0;
        } };
        _eglQuerySurface.sig = "ippip";
        var _eglQueryContext = (display, context, attribute, value) => { if (display != 62e3) {
            EGL.setErrorCode(12296);
            return 0;
        } if (context != 62004) {
            EGL.setErrorCode(12294);
            return 0;
        } if (!value) {
            EGL.setErrorCode(12300);
            return 0;
        } EGL.setErrorCode(12288); switch (attribute) {
            case 12328:
                HEAP32[value >> 2] = 62002;
                return 1;
            case 12439:
                HEAP32[value >> 2] = 12448;
                return 1;
            case 12440:
                HEAP32[value >> 2] = EGL.contextAttributes.majorVersion + 1;
                return 1;
            case 12422:
                HEAP32[value >> 2] = 12420;
                return 1;
            default:
                EGL.setErrorCode(12292);
                return 0;
        } };
        _eglQueryContext.sig = "ippip";
        var _eglQueryAPI = () => { EGL.setErrorCode(12288); return 12448; };
        _eglQueryAPI.sig = "i";
        var _eglGetCurrentContext = () => EGL.currentContext;
        _eglGetCurrentContext.sig = "p";
        var _eglGetCurrentSurface = readdraw => { if (readdraw == 12378) {
            return EGL.currentReadSurface;
        }
        else if (readdraw == 12377) {
            return EGL.currentDrawSurface;
        }
        else {
            EGL.setErrorCode(12300);
            return 0;
        } };
        _eglGetCurrentSurface.sig = "pi";
        var _eglGetCurrentDisplay = () => EGL.currentContext ? 62e3 : 0;
        _eglGetCurrentDisplay.sig = "p";
        var _eglReleaseThread = () => { EGL.currentContext = 0; EGL.currentReadSurface = 0; EGL.currentDrawSurface = 0; EGL.setErrorCode(12288); return 1; };
        _eglReleaseThread.sig = "i";
        var _uuid_clear = uu => zeroMemory(uu, 16);
        _uuid_clear.sig = "vp";
        var _uuid_compare = (uu1, uu2) => _memcmp(uu1, uu2, 16);
        _uuid_compare.sig = "ipp";
        var _uuid_copy = (dst, src) => _memcpy(dst, src, 16);
        _uuid_copy.sig = "vpp";
        var _uuid_generate = out => { var uuid = new Uint8Array(16); randomFill(uuid); uuid[6] = uuid[6] & 15 | 64; uuid[8] = uuid[8] & 63 | 128; writeArrayToMemory(uuid, out); };
        _uuid_generate.sig = "vp";
        var _uuid_is_null = uu => { for (var i = 0; i < 4; i++, uu = uu + 4 | 0) {
            var val = HEAP32[uu >> 2];
            if (val) {
                return 0;
            }
        } return 1; };
        _uuid_is_null.sig = "ip";
        var _uuid_parse = (inp, uu) => { inp = UTF8ToString(inp); if (inp.length === 36) {
            var i = 0;
            var uuid = new Array(16);
            inp.toLowerCase().replace(/[0-9a-f]{2}/g, function (byte) { if (i < 16) {
                uuid[i++] = parseInt(byte, 16);
            } });
            if (i < 16) {
                return -1;
            }
            writeArrayToMemory(uuid, uu);
            return 0;
        } return -1; };
        _uuid_parse.sig = "ipp";
        var _uuid_unparse = (uu, out, upper) => { var i = 0; var uuid = "xxxx-xx-xx-xx-xxxxxx".replace(/[x]/g, function (c) { var r = upper ? HEAPU8[uu + i].toString(16).toUpperCase() : HEAPU8[uu + i].toString(16); r = r.length === 1 ? "0" + r : r; i++; return r; }); stringToUTF8(uuid, out, 37); };
        _uuid_unparse.sig = "vpp";
        var _uuid_unparse_lower = (uu, out) => { _uuid_unparse(uu, out); };
        _uuid_unparse_lower.sig = "vpp";
        var _uuid_unparse_upper = (uu, out) => { _uuid_unparse(uu, out, true); };
        _uuid_unparse_upper.sig = "vpp";
        var _uuid_type = uu => 4;
        _uuid_type.sig = "ip";
        var _uuid_variant = uu => 1;
        _uuid_variant.sig = "ip";
        var GLEW = { isLinaroFork: 1, extensions: null, error: { 0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null, 8: null }, version: { 1: null, 2: null, 3: null, 4: null }, errorStringConstantFromCode(error) { if (GLEW.isLinaroFork) {
                switch (error) {
                    case 4: return "OpenGL ES lib expected, found OpenGL lib";
                    case 5: return "OpenGL lib expected, found OpenGL ES lib";
                    case 6: return "Missing EGL version";
                    case 7: return "EGL 1.1 and up are supported";
                    default: break;
                }
            } switch (error) {
                case 0: return "No error";
                case 1: return "Missing GL version";
                case 2: return "GL 1.1 and up are supported";
                case 3: return "GLX 1.2 and up are supported";
                default: return null;
            } }, errorString(error) { if (!GLEW.error[error]) {
                var string = GLEW.errorStringConstantFromCode(error);
                if (!string) {
                    string = "Unknown error";
                    error = 8;
                }
                GLEW.error[error] = stringToNewUTF8(string);
            } return GLEW.error[error]; }, versionStringConstantFromCode(name) { switch (name) {
                case 1: return "1.10.0";
                case 2: return "1";
                case 3: return "10";
                case 4: return "0";
                default: return null;
            } }, versionString(name) { if (!GLEW.version[name]) {
                var string = GLEW.versionStringConstantFromCode(name);
                if (!string)
                    return 0;
                GLEW.version[name] = stringToNewUTF8(string);
            } return GLEW.version[name]; }, extensionIsSupported(name) { GLEW.extensions || (GLEW.extensions = webglGetExtensions()); if (GLEW.extensions.includes(name))
                return 1; return GLEW.extensions.includes("GL_" + name); } };
        var _glewInit = () => 0;
        _glewInit.sig = "i";
        var _glewIsSupported = name => { var exts = UTF8ToString(name).split(" "); for (var ext of exts) {
            if (!GLEW.extensionIsSupported(ext))
                return 0;
        } return 1; };
        _glewIsSupported.sig = "ip";
        var _glewGetExtension = name => GLEW.extensionIsSupported(UTF8ToString(name));
        _glewGetExtension.sig = "ip";
        var _glewGetErrorString = error => GLEW.errorString(error);
        _glewGetErrorString.sig = "pi";
        var _glewGetString = name => GLEW.versionString(name);
        _glewGetString.sig = "pi";
        var IDBStore = { indexedDB() { return indexedDB; }, DB_VERSION: 22, DB_STORE_NAME: "FILE_DATA", dbs: {}, blobs: [0], getDB(name, callback) { var db = IDBStore.dbs[name]; if (db) {
                return callback(null, db);
            } var req; try {
                req = IDBStore.indexedDB().open(name, IDBStore.DB_VERSION);
            }
            catch (e) {
                return callback(e);
            } req.onupgradeneeded = e => { var db = e.target.result; var transaction = e.target.transaction; var fileStore; if (db.objectStoreNames.contains(IDBStore.DB_STORE_NAME)) {
                fileStore = transaction.objectStore(IDBStore.DB_STORE_NAME);
            }
            else {
                fileStore = db.createObjectStore(IDBStore.DB_STORE_NAME);
            } }; req.onsuccess = () => { db = req.result; IDBStore.dbs[name] = db; callback(null, db); }; req.onerror = function (event) { callback(event.target.error || "unknown error"); event.preventDefault(); }; }, getStore(dbName, type, callback) { IDBStore.getDB(dbName, (error, db) => { if (error)
                return callback(error); var transaction = db.transaction([IDBStore.DB_STORE_NAME], type); transaction.onerror = event => { callback(event.target.error || "unknown error"); event.preventDefault(); }; var store = transaction.objectStore(IDBStore.DB_STORE_NAME); callback(null, store); }); }, getFile(dbName, id, callback) { IDBStore.getStore(dbName, "readonly", (err, store) => { if (err)
                return callback(err); var req = store.get(id); req.onsuccess = event => { var result = event.target.result; if (!result) {
                return callback(`file ${id} not found`);
            } return callback(null, result); }; req.onerror = callback; }); }, setFile(dbName, id, data, callback) { IDBStore.getStore(dbName, "readwrite", (err, store) => { if (err)
                return callback(err); var req = store.put(data, id); req.onsuccess = event => callback(); req.onerror = callback; }); }, deleteFile(dbName, id, callback) { IDBStore.getStore(dbName, "readwrite", (err, store) => { if (err)
                return callback(err); var req = store.delete(id); req.onsuccess = event => callback(); req.onerror = callback; }); }, existsFile(dbName, id, callback) { IDBStore.getStore(dbName, "readonly", (err, store) => { if (err)
                return callback(err); var req = store.count(id); req.onsuccess = event => callback(null, event.target.result > 0); req.onerror = callback; }); }, clearStore(dbName, callback) { IDBStore.getStore(dbName, "readwrite", (err, store) => { if (err)
                return callback(err); var req = store.clear(); req.onsuccess = event => callback(); req.onerror = callback; }); } };
        var _emscripten_idb_async_load = (db, id, arg, onload, onerror) => { IDBStore.getFile(UTF8ToString(db), UTF8ToString(id), (error, byteArray) => { callUserCallback(() => { if (error) {
            if (onerror)
                getWasmTableEntry(onerror)(arg);
            return;
        } var buffer = _malloc(byteArray.length); HEAPU8.set(byteArray, buffer); getWasmTableEntry(onload)(arg, buffer, byteArray.length); _free(buffer); }); }); };
        _emscripten_idb_async_load.sig = "vppppp";
        var _emscripten_idb_async_store = (db, id, ptr, num, arg, onstore, onerror) => { IDBStore.setFile(UTF8ToString(db), UTF8ToString(id), new Uint8Array(HEAPU8.subarray(ptr, ptr + num)), error => { callUserCallback(() => { if (error) {
            if (onerror)
                getWasmTableEntry(onerror)(arg);
            return;
        } if (onstore)
            getWasmTableEntry(onstore)(arg); }); }); };
        _emscripten_idb_async_store.sig = "vpppippp";
        var _emscripten_idb_async_delete = (db, id, arg, ondelete, onerror) => { IDBStore.deleteFile(UTF8ToString(db), UTF8ToString(id), error => { callUserCallback(() => { if (error) {
            if (onerror)
                getWasmTableEntry(onerror)(arg);
            return;
        } if (ondelete)
            getWasmTableEntry(ondelete)(arg); }); }); };
        _emscripten_idb_async_delete.sig = "vppppp";
        var _emscripten_idb_async_exists = (db, id, arg, oncheck, onerror) => { IDBStore.existsFile(UTF8ToString(db), UTF8ToString(id), (error, exists) => { callUserCallback(() => { if (error) {
            if (onerror)
                getWasmTableEntry(onerror)(arg);
            return;
        } if (oncheck)
            getWasmTableEntry(oncheck)(arg, exists); }); }); };
        _emscripten_idb_async_exists.sig = "vppppp";
        var _emscripten_idb_async_clear = (db, arg, onclear, onerror) => { IDBStore.clearStore(UTF8ToString(db), error => { callUserCallback(() => { if (error) {
            if (onerror)
                getWasmTableEntry(onerror)(arg);
            return;
        } if (onclear)
            getWasmTableEntry(onclear)(arg); }); }); };
        _emscripten_idb_async_clear.sig = "vpppp";
        var _emscripten_idb_load = (db, id, pbuffer, pnum, perror) => { throw "Please compile your program with async support in order to use synchronous operations like emscripten_idb_load, etc."; };
        _emscripten_idb_load.sig = "vppppp";
        var _emscripten_idb_store = (db, id, ptr, num, perror) => { throw "Please compile your program with async support in order to use synchronous operations like emscripten_idb_store, etc."; };
        _emscripten_idb_store.sig = "vpppip";
        var _emscripten_idb_delete = (db, id, perror) => { throw "Please compile your program with async support in order to use synchronous operations like emscripten_idb_delete, etc."; };
        _emscripten_idb_delete.sig = "vppp";
        var _emscripten_idb_exists = (db, id, pexists, perror) => { throw "Please compile your program with async support in order to use synchronous operations like emscripten_idb_exists, etc."; };
        _emscripten_idb_exists.sig = "vpppp";
        var _emscripten_idb_clear = (db, perror) => { throw "Please compile your program with async support in order to use synchronous operations like emscripten_idb_clear, etc."; };
        _emscripten_idb_clear.sig = "vpp";
        var runAndAbortIfError = func => { try {
            return func();
        }
        catch (e) {
            abort(e);
        } };
        var _emscripten_wget = (url, file) => { throw "Please compile your program with async support in order to use asynchronous operations like emscripten_wget"; };
        _emscripten_wget.sig = "ipp";
        var _emscripten_scan_registers = func => { throw "Please compile your program with async support in order to use asynchronous operations like emscripten_scan_registers"; };
        _emscripten_scan_registers.sig = "vp";
        var _emscripten_fiber_swap = (oldFiber, newFiber) => { throw "Please compile your program with async support in order to use asynchronous operations like emscripten_fiber_swap"; };
        _emscripten_fiber_swap.sig = "vpp";
        var _glGetBufferSubData = (target, offset, size, data) => { if (!data) {
            GL.recordError(1281);
            return;
        } size && GLctx.getBufferSubData(target, offset, HEAPU8, data, size); };
        _glGetBufferSubData.sig = "vippp";
        var _glDrawArraysInstancedBaseInstanceWEBGL = (mode, first, count, instanceCount, baseInstance) => { GLctx.dibvbi["drawArraysInstancedBaseInstanceWEBGL"](mode, first, count, instanceCount, baseInstance); };
        _glDrawArraysInstancedBaseInstanceWEBGL.sig = "viiiii";
        var _glDrawArraysInstancedBaseInstance = _glDrawArraysInstancedBaseInstanceWEBGL;
        _glDrawArraysInstancedBaseInstance.sig = "viiiii";
        var _glDrawArraysInstancedBaseInstanceANGLE = _glDrawArraysInstancedBaseInstanceWEBGL;
        var _glDrawElementsInstancedBaseVertexBaseInstanceWEBGL = (mode, count, type, offset, instanceCount, baseVertex, baseinstance) => { GLctx.dibvbi["drawElementsInstancedBaseVertexBaseInstanceWEBGL"](mode, count, type, offset, instanceCount, baseVertex, baseinstance); };
        _glDrawElementsInstancedBaseVertexBaseInstanceWEBGL.sig = "viiiiiii";
        var _glDrawElementsInstancedBaseVertexBaseInstanceANGLE = _glDrawElementsInstancedBaseVertexBaseInstanceWEBGL;
        var _emscripten_webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance = ctx => webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance(GL.contexts[ctx].GLctx);
        _emscripten_webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance.sig = "ip";
        var _glMultiDrawArraysInstancedBaseInstanceWEBGL = (mode, firsts, counts, instanceCounts, baseInstances, drawCount) => { GLctx.mdibvbi["multiDrawArraysInstancedBaseInstanceWEBGL"](mode, HEAP32, firsts >> 2, HEAP32, counts >> 2, HEAP32, instanceCounts >> 2, HEAPU32, baseInstances >> 2, drawCount); };
        _glMultiDrawArraysInstancedBaseInstanceWEBGL.sig = "viiiiii";
        var _glMultiDrawArraysInstancedBaseInstanceANGLE = _glMultiDrawArraysInstancedBaseInstanceWEBGL;
        var _glMultiDrawElementsInstancedBaseVertexBaseInstanceWEBGL = (mode, counts, type, offsets, instanceCounts, baseVertices, baseInstances, drawCount) => { GLctx.mdibvbi["multiDrawElementsInstancedBaseVertexBaseInstanceWEBGL"](mode, HEAP32, counts >> 2, type, HEAP32, offsets >> 2, HEAP32, instanceCounts >> 2, HEAP32, baseVertices >> 2, HEAPU32, baseInstances >> 2, drawCount); };
        _glMultiDrawElementsInstancedBaseVertexBaseInstanceWEBGL.sig = "viiiiiiii";
        var _glMultiDrawElementsInstancedBaseVertexBaseInstanceANGLE = _glMultiDrawElementsInstancedBaseVertexBaseInstanceWEBGL;
        var _emscripten_webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance = ctx => webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance(GL.contexts[ctx].GLctx);
        _emscripten_webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance.sig = "ip";
        var _emscripten_glGetBufferSubData = _glGetBufferSubData;
        _emscripten_glGetBufferSubData.sig = "vippp";
        var _emscripten_glDrawArraysInstancedBaseInstanceWEBGL = _glDrawArraysInstancedBaseInstanceWEBGL;
        var _emscripten_glDrawArraysInstancedBaseInstance = _glDrawArraysInstancedBaseInstance;
        _emscripten_glDrawArraysInstancedBaseInstance.sig = "viiiii";
        var _emscripten_glDrawArraysInstancedBaseInstanceANGLE = _glDrawArraysInstancedBaseInstanceANGLE;
        var _emscripten_glDrawElementsInstancedBaseVertexBaseInstanceWEBGL = _glDrawElementsInstancedBaseVertexBaseInstanceWEBGL;
        var _emscripten_glDrawElementsInstancedBaseVertexBaseInstanceANGLE = _glDrawElementsInstancedBaseVertexBaseInstanceANGLE;
        var _emscripten_glMultiDrawArraysInstancedBaseInstanceWEBGL = _glMultiDrawArraysInstancedBaseInstanceWEBGL;
        var _emscripten_glMultiDrawArraysInstancedBaseInstanceANGLE = _glMultiDrawArraysInstancedBaseInstanceANGLE;
        var _emscripten_glMultiDrawElementsInstancedBaseVertexBaseInstanceWEBGL = _glMultiDrawElementsInstancedBaseVertexBaseInstanceWEBGL;
        var _emscripten_glMultiDrawElementsInstancedBaseVertexBaseInstanceANGLE = _glMultiDrawElementsInstancedBaseVertexBaseInstanceANGLE;
        var ALLOC_NORMAL = 0;
        var ALLOC_STACK = 1;
        var allocate = (slab, allocator) => { var ret; if (allocator == ALLOC_STACK) {
            ret = stackAlloc(slab.length);
        }
        else {
            ret = _malloc(slab.length);
        } if (!slab.subarray && !slab.slice) {
            slab = new Uint8Array(slab);
        } HEAPU8.set(slab, ret); return ret; };
        var writeStringToMemory = (string, buffer, dontAddNull) => { warnOnce("writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!"); var lastChar, end; if (dontAddNull) {
            end = buffer + lengthBytesUTF8(string);
            lastChar = HEAP8[end];
        } stringToUTF8(string, buffer, Infinity); if (dontAddNull)
            HEAP8[end] = lastChar; };
        var writeAsciiToMemory = (str, buffer, dontAddNull) => { for (var i = 0; i < str.length; ++i) {
            HEAP8[buffer++] = str.charCodeAt(i);
        } if (!dontAddNull)
            HEAP8[buffer] = 0; };
        var allocateUTF8 = stringToNewUTF8;
        var allocateUTF8OnStack = stringToUTF8OnStack;
        var demangle = func => { demangle.recursionGuard = (demangle.recursionGuard | 0) + 1; if (demangle.recursionGuard > 1)
            return func; return withStackSave(() => { try {
            var s = func;
            if (s.startsWith("__Z"))
                s = s.slice(1);
            var buf = stringToUTF8OnStack(s);
            var status = stackAlloc(4);
            var ret = ___cxa_demangle(buf, 0, 0, status);
            if (HEAP32[status >> 2] === 0 && ret) {
                return UTF8ToString(ret);
            }
        }
        catch (e) { }
        finally {
            _free(ret);
            if (demangle.recursionGuard < 2)
                --demangle.recursionGuard;
        } return func; }); };
        var stackTrace = () => { var js = jsStackTrace(); if (Module["extraStackTrace"])
            js += "\n" + Module["extraStackTrace"](); return js; };
        var print = out;
        var printErr = err;
        var jstoi_s = Number;
        var _emscripten_is_main_browser_thread = () => !ENVIRONMENT_IS_WORKER;
        registerWasmPlugin();
        FS.createPreloadedFile = FS_createPreloadedFile;
        FS.staticInit();
        Module["requestAnimationFrame"] = MainLoop.requestAnimationFrame;
        Module["pauseMainLoop"] = MainLoop.pause;
        Module["resumeMainLoop"] = MainLoop.resume;
        MainLoop.init();
        registerPreMainLoop(() => GL.newRenderingFrameStarted());
        for (let i = 0; i < 32; ++i)
            tempFixedLengthArray.push(new Array(i));
        if (typeof setImmediate != "undefined") {
            emSetImmediate = setImmediateWrapped;
            emClearImmediate = clearImmediateWrapped;
        }
        else if (typeof addEventListener == "function") {
            var __setImmediate_id_counter = 0;
            var __setImmediate_queue = [];
            var __setImmediate_message_id = "_si";
            var __setImmediate_cb = e => { if (e.data === __setImmediate_message_id) {
                e.stopPropagation();
                __setImmediate_queue.shift()();
                ++__setImmediate_id_counter;
            } };
            addEventListener("message", __setImmediate_cb, true);
            emSetImmediate = func => { postMessage(__setImmediate_message_id, "*"); return __setImmediate_id_counter + __setImmediate_queue.push(func) - 1; };
            emClearImmediate = id => { var index = id - __setImmediate_id_counter; if (index >= 0 && index < __setImmediate_queue.length)
                __setImmediate_queue[index] = () => { }; };
        }
        var miniTempWebGLFloatBuffersStorage = new Float32Array(288);
        for (var i = 0; i <= 288; ++i) {
            miniTempWebGLFloatBuffers[i] = miniTempWebGLFloatBuffersStorage.subarray(0, i);
        }
        var miniTempWebGLIntBuffersStorage = new Int32Array(288);
        for (var i = 0; i <= 288; ++i) {
            miniTempWebGLIntBuffers[i] = miniTempWebGLIntBuffersStorage.subarray(0, i);
        }
        {
            initMemory();
            if (Module["preloadPlugins"])
                preloadPlugins = Module["preloadPlugins"];
            if (Module["noExitRuntime"])
                noExitRuntime = Module["noExitRuntime"];
            if (Module["print"])
                out = Module["print"];
            if (Module["printErr"])
                err = Module["printErr"];
            if (Module["dynamicLibraries"])
                dynamicLibraries = Module["dynamicLibraries"];
            if (Module["wasmBinary"])
                wasmBinary = Module["wasmBinary"];
            if (Module["arguments"])
                arguments_ = Module["arguments"];
            if (Module["thisProgram"])
                thisProgram = Module["thisProgram"];
        }
        Module["ccall"] = ccall;
        Module["createContext"] = createContext;
        Module["FS"] = FS;
        Module["_setTempRet0"] = _setTempRet0;
        Module["_getTempRet0"] = _getTempRet0;
        Module["_sched_yield"] = _sched_yield;
        Module["___cxa_uncaught_exceptions"] = ___cxa_uncaught_exceptions;
        Module["___cxa_current_primary_exception"] = ___cxa_current_primary_exception;
        Module["___cxa_rethrow_primary_exception"] = ___cxa_rethrow_primary_exception;
        Module["___syscall_shutdown"] = ___syscall_shutdown;
        Module["_emscripten_wget"] = _emscripten_wget;
        var ASM_CONSTS = { 777228: () => { try {
                FS.mkdir("/rwdir");
                FS.mount(IDBFS, { root: "." }, "/rwdir");
            }
            catch (e) { } }, 777318: $0 => { var str = UTF8ToString($0) + "\n\n" + "Abort/Retry/Ignore/AlwaysIgnore? [ariA] :"; var reply = window.prompt(str, "i"); if (reply === null) {
                reply = "i";
            } return allocate(intArrayFromString(reply), "i8", ALLOC_NORMAL); }, 777543: () => { if (typeof AudioContext !== "undefined") {
                return true;
            }
            else if (typeof webkitAudioContext !== "undefined") {
                return true;
            } return false; }, 777690: () => { if (typeof navigator.mediaDevices !== "undefined" && typeof navigator.mediaDevices.getUserMedia !== "undefined") {
                return true;
            }
            else if (typeof navigator.webkitGetUserMedia !== "undefined") {
                return true;
            } return false; }, 777924: $0 => { if (typeof Module["SDL2"] === "undefined") {
                Module["SDL2"] = {};
            } var SDL2 = Module["SDL2"]; if (!$0) {
                SDL2.audio = {};
            }
            else {
                SDL2.capture = {};
            } if (!SDL2.audioContext) {
                if (typeof AudioContext !== "undefined") {
                    SDL2.audioContext = new AudioContext;
                }
                else if (typeof webkitAudioContext !== "undefined") {
                    SDL2.audioContext = new webkitAudioContext;
                }
                if (SDL2.audioContext) {
                    if (typeof navigator.userActivation === "undefined") {
                        autoResumeAudioContext(SDL2.audioContext);
                    }
                }
            } return SDL2.audioContext === undefined ? -1 : 0; }, 778476: () => { var SDL2 = Module["SDL2"]; return SDL2.audioContext.sampleRate; }, 778544: ($0, $1, $2, $3) => { var SDL2 = Module["SDL2"]; var have_microphone = function (stream) { if (SDL2.capture.silenceTimer !== undefined) {
                clearInterval(SDL2.capture.silenceTimer);
                SDL2.capture.silenceTimer = undefined;
                SDL2.capture.silenceBuffer = undefined;
            } SDL2.capture.mediaStreamNode = SDL2.audioContext.createMediaStreamSource(stream); SDL2.capture.scriptProcessorNode = SDL2.audioContext.createScriptProcessor($1, $0, 1); SDL2.capture.scriptProcessorNode.onaudioprocess = function (audioProcessingEvent) { if (SDL2 === undefined || SDL2.capture === undefined) {
                return;
            } audioProcessingEvent.outputBuffer.getChannelData(0).fill(0); SDL2.capture.currentCaptureBuffer = audioProcessingEvent.inputBuffer; dynCall("vi", $2, [$3]); }; SDL2.capture.mediaStreamNode.connect(SDL2.capture.scriptProcessorNode); SDL2.capture.scriptProcessorNode.connect(SDL2.audioContext.destination); SDL2.capture.stream = stream; }; var no_microphone = function (error) { }; SDL2.capture.silenceBuffer = SDL2.audioContext.createBuffer($0, $1, SDL2.audioContext.sampleRate); SDL2.capture.silenceBuffer.getChannelData(0).fill(0); var silence_callback = function () { SDL2.capture.currentCaptureBuffer = SDL2.capture.silenceBuffer; dynCall("vi", $2, [$3]); }; SDL2.capture.silenceTimer = setInterval(silence_callback, $1 / SDL2.audioContext.sampleRate * 1e3); if (navigator.mediaDevices !== undefined && navigator.mediaDevices.getUserMedia !== undefined) {
                navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(have_microphone).catch(no_microphone);
            }
            else if (navigator.webkitGetUserMedia !== undefined) {
                navigator.webkitGetUserMedia({ audio: true, video: false }, have_microphone, no_microphone);
            } }, 780237: ($0, $1, $2, $3) => { var SDL2 = Module["SDL2"]; SDL2.audio.scriptProcessorNode = SDL2.audioContext["createScriptProcessor"]($1, 0, $0); SDL2.audio.scriptProcessorNode["onaudioprocess"] = function (e) { if (SDL2 === undefined || SDL2.audio === undefined) {
                return;
            } if (SDL2.audio.silenceTimer !== undefined) {
                clearInterval(SDL2.audio.silenceTimer);
                SDL2.audio.silenceTimer = undefined;
                SDL2.audio.silenceBuffer = undefined;
            } SDL2.audio.currentOutputBuffer = e["outputBuffer"]; dynCall("vi", $2, [$3]); }; SDL2.audio.scriptProcessorNode["connect"](SDL2.audioContext["destination"]); if (SDL2.audioContext.state === "suspended") {
                SDL2.audio.silenceBuffer = SDL2.audioContext.createBuffer($0, $1, SDL2.audioContext.sampleRate);
                SDL2.audio.silenceBuffer.getChannelData(0).fill(0);
                var silence_callback = function () { if (typeof navigator.userActivation !== "undefined") {
                    if (navigator.userActivation.hasBeenActive) {
                        SDL2.audioContext.resume();
                    }
                } SDL2.audio.currentOutputBuffer = SDL2.audio.silenceBuffer; dynCall("vi", $2, [$3]); SDL2.audio.currentOutputBuffer = undefined; };
                SDL2.audio.silenceTimer = setInterval(silence_callback, $1 / SDL2.audioContext.sampleRate * 1e3);
            } }, 781412: ($0, $1) => { var SDL2 = Module["SDL2"]; var numChannels = SDL2.capture.currentCaptureBuffer.numberOfChannels; for (var c = 0; c < numChannels; ++c) {
                var channelData = SDL2.capture.currentCaptureBuffer.getChannelData(c);
                if (channelData.length != $1) {
                    throw "Web Audio capture buffer length mismatch! Destination size: " + channelData.length + " samples vs expected " + $1 + " samples!";
                }
                if (numChannels == 1) {
                    for (var j = 0; j < $1; ++j) {
                        setValue($0 + j * 4, channelData[j], "float");
                    }
                }
                else {
                    for (var j = 0; j < $1; ++j) {
                        setValue($0 + (j * numChannels + c) * 4, channelData[j], "float");
                    }
                }
            } }, 782017: ($0, $1) => { var SDL2 = Module["SDL2"]; var buf = $0 >>> 2; var numChannels = SDL2.audio.currentOutputBuffer["numberOfChannels"]; for (var c = 0; c < numChannels; ++c) {
                var channelData = SDL2.audio.currentOutputBuffer["getChannelData"](c);
                if (channelData.length != $1) {
                    throw "Web Audio output buffer length mismatch! Destination size: " + channelData.length + " samples vs expected " + $1 + " samples!";
                }
                for (var j = 0; j < $1; ++j) {
                    channelData[j] = HEAPF32[buf + (j * numChannels + c)];
                }
            } }, 782506: $0 => { var SDL2 = Module["SDL2"]; if ($0) {
                if (SDL2.capture.silenceTimer !== undefined) {
                    clearInterval(SDL2.capture.silenceTimer);
                }
                if (SDL2.capture.stream !== undefined) {
                    var tracks = SDL2.capture.stream.getAudioTracks();
                    for (var i = 0; i < tracks.length; i++) {
                        SDL2.capture.stream.removeTrack(tracks[i]);
                    }
                }
                if (SDL2.capture.scriptProcessorNode !== undefined) {
                    SDL2.capture.scriptProcessorNode.onaudioprocess = function (audioProcessingEvent) { };
                    SDL2.capture.scriptProcessorNode.disconnect();
                }
                if (SDL2.capture.mediaStreamNode !== undefined) {
                    SDL2.capture.mediaStreamNode.disconnect();
                }
                SDL2.capture = undefined;
            }
            else {
                if (SDL2.audio.scriptProcessorNode != undefined) {
                    SDL2.audio.scriptProcessorNode.disconnect();
                }
                if (SDL2.audio.silenceTimer !== undefined) {
                    clearInterval(SDL2.audio.silenceTimer);
                }
                SDL2.audio = undefined;
            } if (SDL2.audioContext !== undefined && SDL2.audio === undefined && SDL2.capture === undefined) {
                SDL2.audioContext.close();
                SDL2.audioContext = undefined;
            } }, 783512: ($0, $1, $2) => { var w = $0; var h = $1; var pixels = $2; if (!Module["SDL2"])
                Module["SDL2"] = {}; var SDL2 = Module["SDL2"]; if (SDL2.ctxCanvas !== Module["canvas"]) {
                SDL2.ctx = Module["createContext"](Module["canvas"], false, true);
                SDL2.ctxCanvas = Module["canvas"];
            } if (SDL2.w !== w || SDL2.h !== h || SDL2.imageCtx !== SDL2.ctx) {
                SDL2.image = SDL2.ctx.createImageData(w, h);
                SDL2.w = w;
                SDL2.h = h;
                SDL2.imageCtx = SDL2.ctx;
            } var data = SDL2.image.data; var src = pixels / 4; var dst = 0; var num; if (typeof CanvasPixelArray !== "undefined" && data instanceof CanvasPixelArray) {
                num = data.length;
                while (dst < num) {
                    var val = HEAP32[src];
                    data[dst] = val & 255;
                    data[dst + 1] = val >> 8 & 255;
                    data[dst + 2] = val >> 16 & 255;
                    data[dst + 3] = 255;
                    src++;
                    dst += 4;
                }
            }
            else {
                if (SDL2.data32Data !== data) {
                    SDL2.data32 = new Int32Array(data.buffer);
                    SDL2.data8 = new Uint8Array(data.buffer);
                    SDL2.data32Data = data;
                }
                var data32 = SDL2.data32;
                num = data32.length;
                data32.set(HEAP32.subarray(src, src + num));
                var data8 = SDL2.data8;
                var i = 3;
                var j = i + 4 * num;
                if (num % 8 == 0) {
                    while (i < j) {
                        data8[i] = 255;
                        i = i + 4 | 0;
                        data8[i] = 255;
                        i = i + 4 | 0;
                        data8[i] = 255;
                        i = i + 4 | 0;
                        data8[i] = 255;
                        i = i + 4 | 0;
                        data8[i] = 255;
                        i = i + 4 | 0;
                        data8[i] = 255;
                        i = i + 4 | 0;
                        data8[i] = 255;
                        i = i + 4 | 0;
                        data8[i] = 255;
                        i = i + 4 | 0;
                    }
                }
                else {
                    while (i < j) {
                        data8[i] = 255;
                        i = i + 4 | 0;
                    }
                }
            } SDL2.ctx.putImageData(SDL2.image, 0, 0); }, 784980: ($0, $1, $2, $3, $4) => { var w = $0; var h = $1; var hot_x = $2; var hot_y = $3; var pixels = $4; var canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h; var ctx = canvas.getContext("2d"); var image = ctx.createImageData(w, h); var data = image.data; var src = pixels / 4; var dst = 0; var num; if (typeof CanvasPixelArray !== "undefined" && data instanceof CanvasPixelArray) {
                num = data.length;
                while (dst < num) {
                    var val = HEAP32[src];
                    data[dst] = val & 255;
                    data[dst + 1] = val >> 8 & 255;
                    data[dst + 2] = val >> 16 & 255;
                    data[dst + 3] = val >> 24 & 255;
                    src++;
                    dst += 4;
                }
            }
            else {
                var data32 = new Int32Array(data.buffer);
                num = data32.length;
                data32.set(HEAP32.subarray(src, src + num));
            } ctx.putImageData(image, 0, 0); var url = hot_x === 0 && hot_y === 0 ? "url(" + canvas.toDataURL() + "), auto" : "url(" + canvas.toDataURL() + ") " + hot_x + " " + hot_y + ", auto"; var urlBuf = _malloc(url.length + 1); stringToUTF8(url, urlBuf, url.length + 1); return urlBuf; }, 785968: $0 => { if (Module["canvas"]) {
                Module["canvas"].style["cursor"] = UTF8ToString($0);
            } }, 786051: () => { if (Module["canvas"]) {
                Module["canvas"].style["cursor"] = "none";
            } }, 786120: () => window.innerWidth, 786150: () => window.innerHeight, 786181: ($0, $1) => { var buf = $0; var buflen = $1; var list = undefined; if (navigator.languages && navigator.languages.length) {
                list = navigator.languages;
            }
            else {
                var oneOfThese = navigator.userLanguage || navigator.language || navigator.browserLanguage || navigator.systemLanguage;
                if (oneOfThese !== undefined) {
                    list = [oneOfThese];
                }
            } if (list === undefined) {
                return;
            } var str = ""; for (var i = 0; i < list.length; i++) {
                var item = list[i];
                if (str.length + item.length + 1 > buflen) {
                    break;
                }
                if (str.length > 0) {
                    str += ",";
                }
                str += item;
            } str = str.replace(/-/g, "_"); if (buflen > str.length) {
                buflen = str.length;
            } for (var i = 0; i < buflen; i++) {
                setValue(buf + i, str.charCodeAt(i), "i8");
            } }, 786889: $0 => { window.open(UTF8ToString($0), "_blank"); }, 786929: ($0, $1) => { alert(UTF8ToString($0) + "\n\n" + UTF8ToString($1)); }, 786986: $0 => { if (!$0) {
                AL.alcErr = 40964;
                return 1;
            } }, 787034: $0 => { if (!AL.currentCtx) {
                err("alGetProcAddress() called without a valid context");
                return 1;
            } if (!$0) {
                AL.currentCtx.err = 40963;
                return 1;
            } } };
        var _Cmd_ExecuteString, _malloc, _free, _memcmp, _htonl, _main, _strerror, _htons, _ntohs, _fileno, _calloc, _realloc, ___dl_seterr, __emscripten_find_dylib, _memcpy, _emscripten_stack_get_end, _emscripten_stack_get_base, _emscripten_builtin_memalign, __emscripten_timeout, _setThrew, __emscripten_tempret_set, __emscripten_tempret_get, _emscripten_stack_set_limits, _emscripten_stack_get_free, __emscripten_stack_restore, __emscripten_stack_alloc, _emscripten_stack_get_current, ___cxa_demangle, ___cxa_increment_exception_refcount, ___cxa_decrement_exception_refcount, ___cxa_can_catch, ___cxa_get_exception_ptr, ___wasm_apply_data_relocs;
        function assignWasmExports(wasmExports) { Module["_Cmd_ExecuteString"] = _Cmd_ExecuteString = wasmExports["Cmd_ExecuteString"]; _malloc = wasmExports["malloc"]; _free = wasmExports["free"]; _memcmp = wasmExports["memcmp"]; _htonl = wasmExports["htonl"]; Module["_main"] = _main = wasmExports["__main_argc_argv"]; _strerror = wasmExports["strerror"]; _htons = wasmExports["htons"]; _ntohs = wasmExports["ntohs"]; _fileno = wasmExports["fileno"]; _calloc = wasmExports["calloc"]; _realloc = wasmExports["realloc"]; ___dl_seterr = wasmExports["__dl_seterr"]; __emscripten_find_dylib = wasmExports["_emscripten_find_dylib"]; _memcpy = wasmExports["memcpy"]; _emscripten_stack_get_end = wasmExports["emscripten_stack_get_end"]; _emscripten_stack_get_base = wasmExports["emscripten_stack_get_base"]; _emscripten_builtin_memalign = wasmExports["emscripten_builtin_memalign"]; __emscripten_timeout = wasmExports["_emscripten_timeout"]; _setThrew = wasmExports["setThrew"]; __emscripten_tempret_set = wasmExports["_emscripten_tempret_set"]; __emscripten_tempret_get = wasmExports["_emscripten_tempret_get"]; _emscripten_stack_set_limits = wasmExports["emscripten_stack_set_limits"]; _emscripten_stack_get_free = wasmExports["emscripten_stack_get_free"]; __emscripten_stack_restore = wasmExports["_emscripten_stack_restore"]; __emscripten_stack_alloc = wasmExports["_emscripten_stack_alloc"]; _emscripten_stack_get_current = wasmExports["emscripten_stack_get_current"]; ___cxa_demangle = wasmExports["__cxa_demangle"]; ___cxa_increment_exception_refcount = wasmExports["__cxa_increment_exception_refcount"]; ___cxa_decrement_exception_refcount = wasmExports["__cxa_decrement_exception_refcount"]; ___cxa_can_catch = wasmExports["__cxa_can_catch"]; ___cxa_get_exception_ptr = wasmExports["__cxa_get_exception_ptr"]; ___wasm_apply_data_relocs = wasmExports["__wasm_apply_data_relocs"]; }
        var wasmImports = { XChangeWindowAttributes: _XChangeWindowAttributes, XCreateWindow: _XCreateWindow, XInternAtom: _XInternAtom, XMapWindow: _XMapWindow, XOpenDisplay: _XOpenDisplay, XPending: _XPending, XSendEvent: _XSendEvent, XSetWMHints: _XSetWMHints, XStoreName: _XStoreName, _Unwind_Backtrace: __Unwind_Backtrace, _Unwind_DeleteException: __Unwind_DeleteException, _Unwind_FindEnclosingFunction: __Unwind_FindEnclosingFunction, _Unwind_GetIPInfo: __Unwind_GetIPInfo, _Unwind_RaiseException: __Unwind_RaiseException, __asctime_r: ___asctime_r, __assert_fail: ___assert_fail, __call_sighandler: ___call_sighandler, __cxa_begin_catch: ___cxa_begin_catch, __cxa_call_unexpected: ___cxa_call_unexpected, __cxa_current_exception_type: ___cxa_current_exception_type, __cxa_end_catch: ___cxa_end_catch, __cxa_find_matching_catch_2: ___cxa_find_matching_catch_2, __cxa_find_matching_catch_3: ___cxa_find_matching_catch_3, __cxa_find_matching_catch_4: ___cxa_find_matching_catch_4, __cxa_rethrow: ___cxa_rethrow, __cxa_throw: ___cxa_throw, __global_base: ___global_base, __handle_stack_overflow: ___handle_stack_overflow, __heap_base: ___heap_base, __indirect_function_table: wasmTable, __memory_base: ___memory_base, __resumeException: ___resumeException, __stack_high: ___stack_high, __stack_low: ___stack_low, __stack_pointer: ___stack_pointer, __syscall__newselect: ___syscall__newselect, __syscall_accept4: ___syscall_accept4, __syscall_bind: ___syscall_bind, __syscall_chdir: ___syscall_chdir, __syscall_chmod: ___syscall_chmod, __syscall_connect: ___syscall_connect, __syscall_dup: ___syscall_dup, __syscall_dup3: ___syscall_dup3, __syscall_faccessat: ___syscall_faccessat, __syscall_fadvise64: ___syscall_fadvise64, __syscall_fallocate: ___syscall_fallocate, __syscall_fchdir: ___syscall_fchdir, __syscall_fchmod: ___syscall_fchmod, __syscall_fchmodat2: ___syscall_fchmodat2, __syscall_fchown32: ___syscall_fchown32, __syscall_fchownat: ___syscall_fchownat, __syscall_fcntl64: ___syscall_fcntl64, __syscall_fdatasync: ___syscall_fdatasync, __syscall_fstat64: ___syscall_fstat64, __syscall_fstatfs64: ___syscall_fstatfs64, __syscall_ftruncate64: ___syscall_ftruncate64, __syscall_getcwd: ___syscall_getcwd, __syscall_getdents64: ___syscall_getdents64, __syscall_getpeername: ___syscall_getpeername, __syscall_getsockname: ___syscall_getsockname, __syscall_getsockopt: ___syscall_getsockopt, __syscall_ioctl: ___syscall_ioctl, __syscall_listen: ___syscall_listen, __syscall_lstat64: ___syscall_lstat64, __syscall_mkdirat: ___syscall_mkdirat, __syscall_mknodat: ___syscall_mknodat, __syscall_newfstatat: ___syscall_newfstatat, __syscall_openat: ___syscall_openat, __syscall_pipe: ___syscall_pipe, __syscall_poll: ___syscall_poll, __syscall_readlinkat: ___syscall_readlinkat, __syscall_recvfrom: ___syscall_recvfrom, __syscall_recvmsg: ___syscall_recvmsg, __syscall_renameat: ___syscall_renameat, __syscall_rmdir: ___syscall_rmdir, __syscall_sendmsg: ___syscall_sendmsg, __syscall_sendto: ___syscall_sendto, __syscall_socket: ___syscall_socket, __syscall_stat64: ___syscall_stat64, __syscall_statfs64: ___syscall_statfs64, __syscall_symlinkat: ___syscall_symlinkat, __syscall_truncate64: ___syscall_truncate64, __syscall_unlinkat: ___syscall_unlinkat, __syscall_utimensat: ___syscall_utimensat, __table_base: ___table_base, _abort_js: __abort_js, _dlopen_js: __dlopen_js, _dlsym_catchup_js: __dlsym_catchup_js, _dlsym_js: __dlsym_js, _emscripten_dlopen_js: __emscripten_dlopen_js, _emscripten_fs_load_embedded_files: __emscripten_fs_load_embedded_files, _emscripten_get_now_is_monotonic: __emscripten_get_now_is_monotonic, _emscripten_get_progname: __emscripten_get_progname, _emscripten_log_formatted: __emscripten_log_formatted, _emscripten_lookup_name: __emscripten_lookup_name, _emscripten_push_main_loop_blocker: __emscripten_push_main_loop_blocker, _emscripten_push_uncounted_main_loop_blocker: __emscripten_push_uncounted_main_loop_blocker, _emscripten_runtime_keepalive_clear: __emscripten_runtime_keepalive_clear, _emscripten_system: __emscripten_system, _emscripten_throw_longjmp: __emscripten_throw_longjmp, _glGetActiveAttribOrUniform: __glGetActiveAttribOrUniform, _gmtime_js: __gmtime_js, _localtime_js: __localtime_js, _mktime_js: __mktime_js, _mmap_js: __mmap_js, _msync_js: __msync_js, _munmap_js: __munmap_js, _setitimer_js: __setitimer_js, _timegm_js: __timegm_js, _tzset_js: __tzset_js, alBuffer3f: _alBuffer3f, alBuffer3i: _alBuffer3i, alBufferData: _alBufferData, alBufferf: _alBufferf, alBufferfv: _alBufferfv, alBufferi: _alBufferi, alBufferiv: _alBufferiv, alDeleteBuffers: _alDeleteBuffers, alDeleteSources: _alDeleteSources, alDisable: _alDisable, alDistanceModel: _alDistanceModel, alDopplerFactor: _alDopplerFactor, alDopplerVelocity: _alDopplerVelocity, alEnable: _alEnable, alGenBuffers: _alGenBuffers, alGenSources: _alGenSources, alGetBoolean: _alGetBoolean, alGetBooleanv: _alGetBooleanv, alGetBuffer3f: _alGetBuffer3f, alGetBuffer3i: _alGetBuffer3i, alGetBufferf: _alGetBufferf, alGetBufferfv: _alGetBufferfv, alGetBufferi: _alGetBufferi, alGetBufferiv: _alGetBufferiv, alGetDouble: _alGetDouble, alGetDoublev: _alGetDoublev, alGetEnumValue: _alGetEnumValue, alGetError: _alGetError, alGetFloat: _alGetFloat, alGetFloatv: _alGetFloatv, alGetInteger: _alGetInteger, alGetIntegerv: _alGetIntegerv, alGetListener3f: _alGetListener3f, alGetListener3i: _alGetListener3i, alGetListenerf: _alGetListenerf, alGetListenerfv: _alGetListenerfv, alGetListeneri: _alGetListeneri, alGetListeneriv: _alGetListeneriv, alGetSource3f: _alGetSource3f, alGetSource3i: _alGetSource3i, alGetSourcef: _alGetSourcef, alGetSourcefv: _alGetSourcefv, alGetSourcei: _alGetSourcei, alGetSourceiv: _alGetSourceiv, alGetString: _alGetString, alIsBuffer: _alIsBuffer, alIsEnabled: _alIsEnabled, alIsExtensionPresent: _alIsExtensionPresent, alIsSource: _alIsSource, alListener3f: _alListener3f, alListener3i: _alListener3i, alListenerf: _alListenerf, alListenerfv: _alListenerfv, alListeneri: _alListeneri, alListeneriv: _alListeneriv, alSource3f: _alSource3f, alSource3i: _alSource3i, alSourcePause: _alSourcePause, alSourcePausev: _alSourcePausev, alSourcePlay: _alSourcePlay, alSourcePlayv: _alSourcePlayv, alSourceQueueBuffers: _alSourceQueueBuffers, alSourceRewind: _alSourceRewind, alSourceRewindv: _alSourceRewindv, alSourceStop: _alSourceStop, alSourceStopv: _alSourceStopv, alSourceUnqueueBuffers: _alSourceUnqueueBuffers, alSourcef: _alSourcef, alSourcefv: _alSourcefv, alSourcei: _alSourcei, alSourceiv: _alSourceiv, alSpeedOfSound: _alSpeedOfSound, alcCaptureCloseDevice: _alcCaptureCloseDevice, alcCaptureOpenDevice: _alcCaptureOpenDevice, alcCaptureSamples: _alcCaptureSamples, alcCaptureStart: _alcCaptureStart, alcCaptureStop: _alcCaptureStop, alcCloseDevice: _alcCloseDevice, alcCreateContext: _alcCreateContext, alcDestroyContext: _alcDestroyContext, alcGetContextsDevice: _alcGetContextsDevice, alcGetCurrentContext: _alcGetCurrentContext, alcGetEnumValue: _alcGetEnumValue, alcGetError: _alcGetError, alcGetIntegerv: _alcGetIntegerv, alcGetString: _alcGetString, alcIsExtensionPresent: _alcIsExtensionPresent, alcMakeContextCurrent: _alcMakeContextCurrent, alcOpenDevice: _alcOpenDevice, alcProcessContext: _alcProcessContext, alcSuspendContext: _alcSuspendContext, clock_res_get: _clock_res_get, clock_time_get: _clock_time_get, eglBindAPI: _eglBindAPI, eglChooseConfig: _eglChooseConfig, eglCreateContext: _eglCreateContext, eglCreateWindowSurface: _eglCreateWindowSurface, eglDestroyContext: _eglDestroyContext, eglDestroySurface: _eglDestroySurface, eglGetConfigAttrib: _eglGetConfigAttrib, eglGetConfigs: _eglGetConfigs, eglGetCurrentContext: _eglGetCurrentContext, eglGetCurrentDisplay: _eglGetCurrentDisplay, eglGetCurrentSurface: _eglGetCurrentSurface, eglGetDisplay: _eglGetDisplay, eglGetError: _eglGetError, eglInitialize: _eglInitialize, eglMakeCurrent: _eglMakeCurrent, eglQueryAPI: _eglQueryAPI, eglQueryContext: _eglQueryContext, eglQueryString: _eglQueryString, eglQuerySurface: _eglQuerySurface, eglReleaseThread: _eglReleaseThread, eglSwapBuffers: _eglSwapBuffers, eglSwapInterval: _eglSwapInterval, eglTerminate: _eglTerminate, eglWaitClient: _eglWaitClient, eglWaitGL: _eglWaitGL, eglWaitNative: _eglWaitNative, emscripten_alcDevicePauseSOFT: _emscripten_alcDevicePauseSOFT, emscripten_alcDeviceResumeSOFT: _emscripten_alcDeviceResumeSOFT, emscripten_alcGetStringiSOFT: _emscripten_alcGetStringiSOFT, emscripten_alcResetDeviceSOFT: _emscripten_alcResetDeviceSOFT, emscripten_asm_const_async_on_main_thread: _emscripten_asm_const_async_on_main_thread, emscripten_asm_const_double: _emscripten_asm_const_double, emscripten_asm_const_double_sync_on_main_thread: _emscripten_asm_const_double_sync_on_main_thread, emscripten_asm_const_int: _emscripten_asm_const_int, emscripten_asm_const_int_sync_on_main_thread: _emscripten_asm_const_int_sync_on_main_thread, emscripten_asm_const_ptr: _emscripten_asm_const_ptr, emscripten_asm_const_ptr_sync_on_main_thread: _emscripten_asm_const_ptr_sync_on_main_thread, emscripten_async_call: _emscripten_async_call, emscripten_async_load_script: _emscripten_async_load_script, emscripten_async_run_script: _emscripten_async_run_script, emscripten_async_wget: _emscripten_async_wget, emscripten_async_wget2: _emscripten_async_wget2, emscripten_async_wget2_abort: _emscripten_async_wget2_abort, emscripten_async_wget2_data: _emscripten_async_wget2_data, emscripten_async_wget_data: _emscripten_async_wget_data, emscripten_call_worker: _emscripten_call_worker, emscripten_cancel_animation_frame: _emscripten_cancel_animation_frame, emscripten_cancel_main_loop: _emscripten_cancel_main_loop, emscripten_clear_immediate: _emscripten_clear_immediate, emscripten_clear_interval: _emscripten_clear_interval, emscripten_clear_timeout: _emscripten_clear_timeout, emscripten_console_error: _emscripten_console_error, emscripten_console_log: _emscripten_console_log, emscripten_console_trace: _emscripten_console_trace, emscripten_console_warn: _emscripten_console_warn, emscripten_create_worker: _emscripten_create_worker, emscripten_date_now: _emscripten_date_now, emscripten_debugger: _emscripten_debugger, emscripten_destroy_worker: _emscripten_destroy_worker, emscripten_enter_soft_fullscreen: _emscripten_enter_soft_fullscreen, emscripten_err: _emscripten_err, emscripten_errn: _emscripten_errn, emscripten_exit_fullscreen: _emscripten_exit_fullscreen, emscripten_exit_pointerlock: _emscripten_exit_pointerlock, emscripten_exit_soft_fullscreen: _emscripten_exit_soft_fullscreen, emscripten_exit_with_live_runtime: _emscripten_exit_with_live_runtime, emscripten_fiber_swap: _emscripten_fiber_swap, emscripten_force_exit: _emscripten_force_exit, emscripten_get_battery_status: _emscripten_get_battery_status, emscripten_get_callstack: _emscripten_get_callstack, emscripten_get_canvas_element_size: _emscripten_get_canvas_element_size, emscripten_get_canvas_size: _emscripten_get_canvas_size, emscripten_get_compiler_setting: _emscripten_get_compiler_setting, emscripten_get_device_pixel_ratio: _emscripten_get_device_pixel_ratio, emscripten_get_devicemotion_status: _emscripten_get_devicemotion_status, emscripten_get_deviceorientation_status: _emscripten_get_deviceorientation_status, emscripten_get_element_css_size: _emscripten_get_element_css_size, emscripten_get_fullscreen_status: _emscripten_get_fullscreen_status, emscripten_get_gamepad_status: _emscripten_get_gamepad_status, emscripten_get_heap_max: _emscripten_get_heap_max, emscripten_get_main_loop_timing: _emscripten_get_main_loop_timing, emscripten_get_mouse_status: _emscripten_get_mouse_status, emscripten_get_now: _emscripten_get_now, emscripten_get_now_res: _emscripten_get_now_res, emscripten_get_num_gamepads: _emscripten_get_num_gamepads, emscripten_get_orientation_status: _emscripten_get_orientation_status, emscripten_get_pointerlock_status: _emscripten_get_pointerlock_status, emscripten_get_preloaded_image_data: _emscripten_get_preloaded_image_data, emscripten_get_preloaded_image_data_from_FILE: _emscripten_get_preloaded_image_data_from_FILE, emscripten_get_screen_size: _emscripten_get_screen_size, emscripten_get_visibility_status: _emscripten_get_visibility_status, emscripten_get_window_title: _emscripten_get_window_title, emscripten_get_worker_queue_size: _emscripten_get_worker_queue_size, emscripten_glActiveTexture: _emscripten_glActiveTexture, emscripten_glAttachShader: _emscripten_glAttachShader, emscripten_glBegin: _emscripten_glBegin, emscripten_glBeginQuery: _emscripten_glBeginQuery, emscripten_glBeginQueryEXT: _emscripten_glBeginQueryEXT, emscripten_glBeginTransformFeedback: _emscripten_glBeginTransformFeedback, emscripten_glBindAttribLocation: _emscripten_glBindAttribLocation, emscripten_glBindBuffer: _emscripten_glBindBuffer, emscripten_glBindBufferBase: _emscripten_glBindBufferBase, emscripten_glBindBufferRange: _emscripten_glBindBufferRange, emscripten_glBindFramebuffer: _emscripten_glBindFramebuffer, emscripten_glBindRenderbuffer: _emscripten_glBindRenderbuffer, emscripten_glBindSampler: _emscripten_glBindSampler, emscripten_glBindTexture: _emscripten_glBindTexture, emscripten_glBindTransformFeedback: _emscripten_glBindTransformFeedback, emscripten_glBindVertexArray: _emscripten_glBindVertexArray, emscripten_glBindVertexArrayOES: _emscripten_glBindVertexArrayOES, emscripten_glBlendColor: _emscripten_glBlendColor, emscripten_glBlendEquation: _emscripten_glBlendEquation, emscripten_glBlendEquationSeparate: _emscripten_glBlendEquationSeparate, emscripten_glBlendFunc: _emscripten_glBlendFunc, emscripten_glBlendFuncSeparate: _emscripten_glBlendFuncSeparate, emscripten_glBlitFramebuffer: _emscripten_glBlitFramebuffer, emscripten_glBufferData: _emscripten_glBufferData, emscripten_glBufferSubData: _emscripten_glBufferSubData, emscripten_glCheckFramebufferStatus: _emscripten_glCheckFramebufferStatus, emscripten_glClear: _emscripten_glClear, emscripten_glClearBufferfi: _emscripten_glClearBufferfi, emscripten_glClearBufferfv: _emscripten_glClearBufferfv, emscripten_glClearBufferiv: _emscripten_glClearBufferiv, emscripten_glClearBufferuiv: _emscripten_glClearBufferuiv, emscripten_glClearColor: _emscripten_glClearColor, emscripten_glClearDepth: _emscripten_glClearDepth, emscripten_glClearDepthf: _emscripten_glClearDepthf, emscripten_glClearStencil: _emscripten_glClearStencil, emscripten_glClientWaitSync: _emscripten_glClientWaitSync, emscripten_glClipControlEXT: _emscripten_glClipControlEXT, emscripten_glColorMask: _emscripten_glColorMask, emscripten_glCompileShader: _emscripten_glCompileShader, emscripten_glCompressedTexImage2D: _emscripten_glCompressedTexImage2D, emscripten_glCompressedTexImage3D: _emscripten_glCompressedTexImage3D, emscripten_glCompressedTexSubImage2D: _emscripten_glCompressedTexSubImage2D, emscripten_glCompressedTexSubImage3D: _emscripten_glCompressedTexSubImage3D, emscripten_glCopyBufferSubData: _emscripten_glCopyBufferSubData, emscripten_glCopyTexImage2D: _emscripten_glCopyTexImage2D, emscripten_glCopyTexSubImage2D: _emscripten_glCopyTexSubImage2D, emscripten_glCopyTexSubImage3D: _emscripten_glCopyTexSubImage3D, emscripten_glCreateProgram: _emscripten_glCreateProgram, emscripten_glCreateShader: _emscripten_glCreateShader, emscripten_glCullFace: _emscripten_glCullFace, emscripten_glDeleteBuffers: _emscripten_glDeleteBuffers, emscripten_glDeleteFramebuffers: _emscripten_glDeleteFramebuffers, emscripten_glDeleteProgram: _emscripten_glDeleteProgram, emscripten_glDeleteQueries: _emscripten_glDeleteQueries, emscripten_glDeleteQueriesEXT: _emscripten_glDeleteQueriesEXT, emscripten_glDeleteRenderbuffers: _emscripten_glDeleteRenderbuffers, emscripten_glDeleteSamplers: _emscripten_glDeleteSamplers, emscripten_glDeleteShader: _emscripten_glDeleteShader, emscripten_glDeleteSync: _emscripten_glDeleteSync, emscripten_glDeleteTextures: _emscripten_glDeleteTextures, emscripten_glDeleteTransformFeedbacks: _emscripten_glDeleteTransformFeedbacks, emscripten_glDeleteVertexArrays: _emscripten_glDeleteVertexArrays, emscripten_glDeleteVertexArraysOES: _emscripten_glDeleteVertexArraysOES, emscripten_glDepthFunc: _emscripten_glDepthFunc, emscripten_glDepthMask: _emscripten_glDepthMask, emscripten_glDepthRange: _emscripten_glDepthRange, emscripten_glDepthRangef: _emscripten_glDepthRangef, emscripten_glDetachShader: _emscripten_glDetachShader, emscripten_glDisable: _emscripten_glDisable, emscripten_glDisableVertexAttribArray: _emscripten_glDisableVertexAttribArray, emscripten_glDrawArrays: _emscripten_glDrawArrays, emscripten_glDrawArraysInstanced: _emscripten_glDrawArraysInstanced, emscripten_glDrawArraysInstancedANGLE: _emscripten_glDrawArraysInstancedANGLE, emscripten_glDrawArraysInstancedARB: _emscripten_glDrawArraysInstancedARB, emscripten_glDrawArraysInstancedBaseInstance: _emscripten_glDrawArraysInstancedBaseInstance, emscripten_glDrawArraysInstancedBaseInstanceANGLE: _emscripten_glDrawArraysInstancedBaseInstanceANGLE, emscripten_glDrawArraysInstancedBaseInstanceWEBGL: _emscripten_glDrawArraysInstancedBaseInstanceWEBGL, emscripten_glDrawArraysInstancedEXT: _emscripten_glDrawArraysInstancedEXT, emscripten_glDrawArraysInstancedNV: _emscripten_glDrawArraysInstancedNV, emscripten_glDrawBuffers: _emscripten_glDrawBuffers, emscripten_glDrawBuffersEXT: _emscripten_glDrawBuffersEXT, emscripten_glDrawBuffersWEBGL: _emscripten_glDrawBuffersWEBGL, emscripten_glDrawElements: _emscripten_glDrawElements, emscripten_glDrawElementsInstanced: _emscripten_glDrawElementsInstanced, emscripten_glDrawElementsInstancedANGLE: _emscripten_glDrawElementsInstancedANGLE, emscripten_glDrawElementsInstancedARB: _emscripten_glDrawElementsInstancedARB, emscripten_glDrawElementsInstancedBaseVertexBaseInstanceANGLE: _emscripten_glDrawElementsInstancedBaseVertexBaseInstanceANGLE, emscripten_glDrawElementsInstancedBaseVertexBaseInstanceWEBGL: _emscripten_glDrawElementsInstancedBaseVertexBaseInstanceWEBGL, emscripten_glDrawElementsInstancedEXT: _emscripten_glDrawElementsInstancedEXT, emscripten_glDrawElementsInstancedNV: _emscripten_glDrawElementsInstancedNV, emscripten_glDrawRangeElements: _emscripten_glDrawRangeElements, emscripten_glEnable: _emscripten_glEnable, emscripten_glEnableVertexAttribArray: _emscripten_glEnableVertexAttribArray, emscripten_glEndQuery: _emscripten_glEndQuery, emscripten_glEndQueryEXT: _emscripten_glEndQueryEXT, emscripten_glEndTransformFeedback: _emscripten_glEndTransformFeedback, emscripten_glFenceSync: _emscripten_glFenceSync, emscripten_glFinish: _emscripten_glFinish, emscripten_glFlush: _emscripten_glFlush, emscripten_glFlushMappedBufferRange: _emscripten_glFlushMappedBufferRange, emscripten_glFramebufferRenderbuffer: _emscripten_glFramebufferRenderbuffer, emscripten_glFramebufferTexture2D: _emscripten_glFramebufferTexture2D, emscripten_glFramebufferTextureLayer: _emscripten_glFramebufferTextureLayer, emscripten_glFrontFace: _emscripten_glFrontFace, emscripten_glGenBuffers: _emscripten_glGenBuffers, emscripten_glGenFramebuffers: _emscripten_glGenFramebuffers, emscripten_glGenQueries: _emscripten_glGenQueries, emscripten_glGenQueriesEXT: _emscripten_glGenQueriesEXT, emscripten_glGenRenderbuffers: _emscripten_glGenRenderbuffers, emscripten_glGenSamplers: _emscripten_glGenSamplers, emscripten_glGenTextures: _emscripten_glGenTextures, emscripten_glGenTransformFeedbacks: _emscripten_glGenTransformFeedbacks, emscripten_glGenVertexArrays: _emscripten_glGenVertexArrays, emscripten_glGenVertexArraysOES: _emscripten_glGenVertexArraysOES, emscripten_glGenerateMipmap: _emscripten_glGenerateMipmap, emscripten_glGetActiveAttrib: _emscripten_glGetActiveAttrib, emscripten_glGetActiveUniform: _emscripten_glGetActiveUniform, emscripten_glGetActiveUniformBlockName: _emscripten_glGetActiveUniformBlockName, emscripten_glGetActiveUniformBlockiv: _emscripten_glGetActiveUniformBlockiv, emscripten_glGetActiveUniformsiv: _emscripten_glGetActiveUniformsiv, emscripten_glGetAttachedShaders: _emscripten_glGetAttachedShaders, emscripten_glGetAttribLocation: _emscripten_glGetAttribLocation, emscripten_glGetBooleanv: _emscripten_glGetBooleanv, emscripten_glGetBufferParameteri64v: _emscripten_glGetBufferParameteri64v, emscripten_glGetBufferParameteriv: _emscripten_glGetBufferParameteriv, emscripten_glGetBufferPointerv: _emscripten_glGetBufferPointerv, emscripten_glGetBufferSubData: _emscripten_glGetBufferSubData, emscripten_glGetError: _emscripten_glGetError, emscripten_glGetFloatv: _emscripten_glGetFloatv, emscripten_glGetFragDataLocation: _emscripten_glGetFragDataLocation, emscripten_glGetFramebufferAttachmentParameteriv: _emscripten_glGetFramebufferAttachmentParameteriv, emscripten_glGetInteger64i_v: _emscripten_glGetInteger64i_v, emscripten_glGetInteger64v: _emscripten_glGetInteger64v, emscripten_glGetIntegeri_v: _emscripten_glGetIntegeri_v, emscripten_glGetIntegerv: _emscripten_glGetIntegerv, emscripten_glGetInternalformativ: _emscripten_glGetInternalformativ, emscripten_glGetProgramBinary: _emscripten_glGetProgramBinary, emscripten_glGetProgramInfoLog: _emscripten_glGetProgramInfoLog, emscripten_glGetProgramiv: _emscripten_glGetProgramiv, emscripten_glGetQueryObjecti64vEXT: _emscripten_glGetQueryObjecti64vEXT, emscripten_glGetQueryObjectivEXT: _emscripten_glGetQueryObjectivEXT, emscripten_glGetQueryObjectui64vEXT: _emscripten_glGetQueryObjectui64vEXT, emscripten_glGetQueryObjectuiv: _emscripten_glGetQueryObjectuiv, emscripten_glGetQueryObjectuivEXT: _emscripten_glGetQueryObjectuivEXT, emscripten_glGetQueryiv: _emscripten_glGetQueryiv, emscripten_glGetQueryivEXT: _emscripten_glGetQueryivEXT, emscripten_glGetRenderbufferParameteriv: _emscripten_glGetRenderbufferParameteriv, emscripten_glGetSamplerParameterfv: _emscripten_glGetSamplerParameterfv, emscripten_glGetSamplerParameteriv: _emscripten_glGetSamplerParameteriv, emscripten_glGetShaderInfoLog: _emscripten_glGetShaderInfoLog, emscripten_glGetShaderPrecisionFormat: _emscripten_glGetShaderPrecisionFormat, emscripten_glGetShaderSource: _emscripten_glGetShaderSource, emscripten_glGetShaderiv: _emscripten_glGetShaderiv, emscripten_glGetString: _emscripten_glGetString, emscripten_glGetStringi: _emscripten_glGetStringi, emscripten_glGetSynciv: _emscripten_glGetSynciv, emscripten_glGetTexParameterfv: _emscripten_glGetTexParameterfv, emscripten_glGetTexParameteriv: _emscripten_glGetTexParameteriv, emscripten_glGetTransformFeedbackVarying: _emscripten_glGetTransformFeedbackVarying, emscripten_glGetUniformBlockIndex: _emscripten_glGetUniformBlockIndex, emscripten_glGetUniformIndices: _emscripten_glGetUniformIndices, emscripten_glGetUniformLocation: _emscripten_glGetUniformLocation, emscripten_glGetUniformfv: _emscripten_glGetUniformfv, emscripten_glGetUniformiv: _emscripten_glGetUniformiv, emscripten_glGetUniformuiv: _emscripten_glGetUniformuiv, emscripten_glGetVertexAttribIiv: _emscripten_glGetVertexAttribIiv, emscripten_glGetVertexAttribIuiv: _emscripten_glGetVertexAttribIuiv, emscripten_glGetVertexAttribPointerv: _emscripten_glGetVertexAttribPointerv, emscripten_glGetVertexAttribfv: _emscripten_glGetVertexAttribfv, emscripten_glGetVertexAttribiv: _emscripten_glGetVertexAttribiv, emscripten_glHint: _emscripten_glHint, emscripten_glInvalidateFramebuffer: _emscripten_glInvalidateFramebuffer, emscripten_glInvalidateSubFramebuffer: _emscripten_glInvalidateSubFramebuffer, emscripten_glIsBuffer: _emscripten_glIsBuffer, emscripten_glIsEnabled: _emscripten_glIsEnabled, emscripten_glIsFramebuffer: _emscripten_glIsFramebuffer, emscripten_glIsProgram: _emscripten_glIsProgram, emscripten_glIsQuery: _emscripten_glIsQuery, emscripten_glIsQueryEXT: _emscripten_glIsQueryEXT, emscripten_glIsRenderbuffer: _emscripten_glIsRenderbuffer, emscripten_glIsSampler: _emscripten_glIsSampler, emscripten_glIsShader: _emscripten_glIsShader, emscripten_glIsSync: _emscripten_glIsSync, emscripten_glIsTexture: _emscripten_glIsTexture, emscripten_glIsTransformFeedback: _emscripten_glIsTransformFeedback, emscripten_glIsVertexArray: _emscripten_glIsVertexArray, emscripten_glIsVertexArrayOES: _emscripten_glIsVertexArrayOES, emscripten_glLineWidth: _emscripten_glLineWidth, emscripten_glLinkProgram: _emscripten_glLinkProgram, emscripten_glLoadIdentity: _emscripten_glLoadIdentity, emscripten_glMapBufferRange: _emscripten_glMapBufferRange, emscripten_glMatrixMode: _emscripten_glMatrixMode, emscripten_glMultiDrawArrays: _emscripten_glMultiDrawArrays, emscripten_glMultiDrawArraysANGLE: _emscripten_glMultiDrawArraysANGLE, emscripten_glMultiDrawArraysInstancedANGLE: _emscripten_glMultiDrawArraysInstancedANGLE, emscripten_glMultiDrawArraysInstancedBaseInstanceANGLE: _emscripten_glMultiDrawArraysInstancedBaseInstanceANGLE, emscripten_glMultiDrawArraysInstancedBaseInstanceWEBGL: _emscripten_glMultiDrawArraysInstancedBaseInstanceWEBGL, emscripten_glMultiDrawArraysInstancedWEBGL: _emscripten_glMultiDrawArraysInstancedWEBGL, emscripten_glMultiDrawArraysWEBGL: _emscripten_glMultiDrawArraysWEBGL, emscripten_glMultiDrawElements: _emscripten_glMultiDrawElements, emscripten_glMultiDrawElementsANGLE: _emscripten_glMultiDrawElementsANGLE, emscripten_glMultiDrawElementsInstancedANGLE: _emscripten_glMultiDrawElementsInstancedANGLE, emscripten_glMultiDrawElementsInstancedBaseVertexBaseInstanceANGLE: _emscripten_glMultiDrawElementsInstancedBaseVertexBaseInstanceANGLE, emscripten_glMultiDrawElementsInstancedBaseVertexBaseInstanceWEBGL: _emscripten_glMultiDrawElementsInstancedBaseVertexBaseInstanceWEBGL, emscripten_glMultiDrawElementsInstancedWEBGL: _emscripten_glMultiDrawElementsInstancedWEBGL, emscripten_glMultiDrawElementsWEBGL: _emscripten_glMultiDrawElementsWEBGL, emscripten_glPauseTransformFeedback: _emscripten_glPauseTransformFeedback, emscripten_glPixelStorei: _emscripten_glPixelStorei, emscripten_glPolygonModeWEBGL: _emscripten_glPolygonModeWEBGL, emscripten_glPolygonOffset: _emscripten_glPolygonOffset, emscripten_glPolygonOffsetClampEXT: _emscripten_glPolygonOffsetClampEXT, emscripten_glProgramBinary: _emscripten_glProgramBinary, emscripten_glProgramParameteri: _emscripten_glProgramParameteri, emscripten_glQueryCounterEXT: _emscripten_glQueryCounterEXT, emscripten_glReadBuffer: _emscripten_glReadBuffer, emscripten_glReadPixels: _emscripten_glReadPixels, emscripten_glReleaseShaderCompiler: _emscripten_glReleaseShaderCompiler, emscripten_glRenderbufferStorage: _emscripten_glRenderbufferStorage, emscripten_glRenderbufferStorageMultisample: _emscripten_glRenderbufferStorageMultisample, emscripten_glResumeTransformFeedback: _emscripten_glResumeTransformFeedback, emscripten_glSampleCoverage: _emscripten_glSampleCoverage, emscripten_glSamplerParameterf: _emscripten_glSamplerParameterf, emscripten_glSamplerParameterfv: _emscripten_glSamplerParameterfv, emscripten_glSamplerParameteri: _emscripten_glSamplerParameteri, emscripten_glSamplerParameteriv: _emscripten_glSamplerParameteriv, emscripten_glScissor: _emscripten_glScissor, emscripten_glShaderBinary: _emscripten_glShaderBinary, emscripten_glShaderSource: _emscripten_glShaderSource, emscripten_glStencilFunc: _emscripten_glStencilFunc, emscripten_glStencilFuncSeparate: _emscripten_glStencilFuncSeparate, emscripten_glStencilMask: _emscripten_glStencilMask, emscripten_glStencilMaskSeparate: _emscripten_glStencilMaskSeparate, emscripten_glStencilOp: _emscripten_glStencilOp, emscripten_glStencilOpSeparate: _emscripten_glStencilOpSeparate, emscripten_glTexImage2D: _emscripten_glTexImage2D, emscripten_glTexImage3D: _emscripten_glTexImage3D, emscripten_glTexParameterf: _emscripten_glTexParameterf, emscripten_glTexParameterfv: _emscripten_glTexParameterfv, emscripten_glTexParameteri: _emscripten_glTexParameteri, emscripten_glTexParameteriv: _emscripten_glTexParameteriv, emscripten_glTexStorage2D: _emscripten_glTexStorage2D, emscripten_glTexStorage3D: _emscripten_glTexStorage3D, emscripten_glTexSubImage2D: _emscripten_glTexSubImage2D, emscripten_glTexSubImage3D: _emscripten_glTexSubImage3D, emscripten_glTransformFeedbackVaryings: _emscripten_glTransformFeedbackVaryings, emscripten_glUniform1f: _emscripten_glUniform1f, emscripten_glUniform1fv: _emscripten_glUniform1fv, emscripten_glUniform1i: _emscripten_glUniform1i, emscripten_glUniform1iv: _emscripten_glUniform1iv, emscripten_glUniform1ui: _emscripten_glUniform1ui, emscripten_glUniform1uiv: _emscripten_glUniform1uiv, emscripten_glUniform2f: _emscripten_glUniform2f, emscripten_glUniform2fv: _emscripten_glUniform2fv, emscripten_glUniform2i: _emscripten_glUniform2i, emscripten_glUniform2iv: _emscripten_glUniform2iv, emscripten_glUniform2ui: _emscripten_glUniform2ui, emscripten_glUniform2uiv: _emscripten_glUniform2uiv, emscripten_glUniform3f: _emscripten_glUniform3f, emscripten_glUniform3fv: _emscripten_glUniform3fv, emscripten_glUniform3i: _emscripten_glUniform3i, emscripten_glUniform3iv: _emscripten_glUniform3iv, emscripten_glUniform3ui: _emscripten_glUniform3ui, emscripten_glUniform3uiv: _emscripten_glUniform3uiv, emscripten_glUniform4f: _emscripten_glUniform4f, emscripten_glUniform4fv: _emscripten_glUniform4fv, emscripten_glUniform4i: _emscripten_glUniform4i, emscripten_glUniform4iv: _emscripten_glUniform4iv, emscripten_glUniform4ui: _emscripten_glUniform4ui, emscripten_glUniform4uiv: _emscripten_glUniform4uiv, emscripten_glUniformBlockBinding: _emscripten_glUniformBlockBinding, emscripten_glUniformMatrix2fv: _emscripten_glUniformMatrix2fv, emscripten_glUniformMatrix2x3fv: _emscripten_glUniformMatrix2x3fv, emscripten_glUniformMatrix2x4fv: _emscripten_glUniformMatrix2x4fv, emscripten_glUniformMatrix3fv: _emscripten_glUniformMatrix3fv, emscripten_glUniformMatrix3x2fv: _emscripten_glUniformMatrix3x2fv, emscripten_glUniformMatrix3x4fv: _emscripten_glUniformMatrix3x4fv, emscripten_glUniformMatrix4fv: _emscripten_glUniformMatrix4fv, emscripten_glUniformMatrix4x2fv: _emscripten_glUniformMatrix4x2fv, emscripten_glUniformMatrix4x3fv: _emscripten_glUniformMatrix4x3fv, emscripten_glUnmapBuffer: _emscripten_glUnmapBuffer, emscripten_glUseProgram: _emscripten_glUseProgram, emscripten_glValidateProgram: _emscripten_glValidateProgram, emscripten_glVertexAttrib1f: _emscripten_glVertexAttrib1f, emscripten_glVertexAttrib1fv: _emscripten_glVertexAttrib1fv, emscripten_glVertexAttrib2f: _emscripten_glVertexAttrib2f, emscripten_glVertexAttrib2fv: _emscripten_glVertexAttrib2fv, emscripten_glVertexAttrib3f: _emscripten_glVertexAttrib3f, emscripten_glVertexAttrib3fv: _emscripten_glVertexAttrib3fv, emscripten_glVertexAttrib4f: _emscripten_glVertexAttrib4f, emscripten_glVertexAttrib4fv: _emscripten_glVertexAttrib4fv, emscripten_glVertexAttribDivisor: _emscripten_glVertexAttribDivisor, emscripten_glVertexAttribDivisorANGLE: _emscripten_glVertexAttribDivisorANGLE, emscripten_glVertexAttribDivisorARB: _emscripten_glVertexAttribDivisorARB, emscripten_glVertexAttribDivisorEXT: _emscripten_glVertexAttribDivisorEXT, emscripten_glVertexAttribDivisorNV: _emscripten_glVertexAttribDivisorNV, emscripten_glVertexAttribI4i: _emscripten_glVertexAttribI4i, emscripten_glVertexAttribI4iv: _emscripten_glVertexAttribI4iv, emscripten_glVertexAttribI4ui: _emscripten_glVertexAttribI4ui, emscripten_glVertexAttribI4uiv: _emscripten_glVertexAttribI4uiv, emscripten_glVertexAttribIPointer: _emscripten_glVertexAttribIPointer, emscripten_glVertexAttribPointer: _emscripten_glVertexAttribPointer, emscripten_glVertexPointer: _emscripten_glVertexPointer, emscripten_glViewport: _emscripten_glViewport, emscripten_glWaitSync: _emscripten_glWaitSync, emscripten_has_asyncify: _emscripten_has_asyncify, emscripten_hide_mouse: _emscripten_hide_mouse, emscripten_html5_remove_all_event_listeners: _emscripten_html5_remove_all_event_listeners, emscripten_idb_async_clear: _emscripten_idb_async_clear, emscripten_idb_async_delete: _emscripten_idb_async_delete, emscripten_idb_async_exists: _emscripten_idb_async_exists, emscripten_idb_async_load: _emscripten_idb_async_load, emscripten_idb_async_store: _emscripten_idb_async_store, emscripten_idb_clear: _emscripten_idb_clear, emscripten_idb_delete: _emscripten_idb_delete, emscripten_idb_exists: _emscripten_idb_exists, emscripten_idb_load: _emscripten_idb_load, emscripten_idb_store: _emscripten_idb_store, emscripten_is_main_browser_thread: _emscripten_is_main_browser_thread, emscripten_is_webgl_context_lost: _emscripten_is_webgl_context_lost, emscripten_lock_orientation: _emscripten_lock_orientation, emscripten_math_acos: _emscripten_math_acos, emscripten_math_acosh: _emscripten_math_acosh, emscripten_math_asin: _emscripten_math_asin, emscripten_math_asinh: _emscripten_math_asinh, emscripten_math_atan: _emscripten_math_atan, emscripten_math_atan2: _emscripten_math_atan2, emscripten_math_atanh: _emscripten_math_atanh, emscripten_math_cbrt: _emscripten_math_cbrt, emscripten_math_cos: _emscripten_math_cos, emscripten_math_cosh: _emscripten_math_cosh, emscripten_math_exp: _emscripten_math_exp, emscripten_math_expm1: _emscripten_math_expm1, emscripten_math_fmod: _emscripten_math_fmod, emscripten_math_hypot: _emscripten_math_hypot, emscripten_math_log: _emscripten_math_log, emscripten_math_log10: _emscripten_math_log10, emscripten_math_log1p: _emscripten_math_log1p, emscripten_math_log2: _emscripten_math_log2, emscripten_math_pow: _emscripten_math_pow, emscripten_math_random: _emscripten_math_random, emscripten_math_round: _emscripten_math_round, emscripten_math_sign: _emscripten_math_sign, emscripten_math_sin: _emscripten_math_sin, emscripten_math_sinh: _emscripten_math_sinh, emscripten_math_sqrt: _emscripten_math_sqrt, emscripten_math_tan: _emscripten_math_tan, emscripten_math_tanh: _emscripten_math_tanh, emscripten_notify_memory_growth: _emscripten_notify_memory_growth, emscripten_out: _emscripten_out, emscripten_outn: _emscripten_outn, emscripten_pause_main_loop: _emscripten_pause_main_loop, emscripten_pc_get_column: _emscripten_pc_get_column, emscripten_pc_get_file: _emscripten_pc_get_file, emscripten_pc_get_function: _emscripten_pc_get_function, emscripten_pc_get_line: _emscripten_pc_get_line, emscripten_performance_now: _emscripten_performance_now, emscripten_print_double: _emscripten_print_double, emscripten_promise_all: _emscripten_promise_all, emscripten_promise_all_settled: _emscripten_promise_all_settled, emscripten_promise_any: _emscripten_promise_any, emscripten_promise_await: _emscripten_promise_await, emscripten_promise_create: _emscripten_promise_create, emscripten_promise_destroy: _emscripten_promise_destroy, emscripten_promise_race: _emscripten_promise_race, emscripten_promise_resolve: _emscripten_promise_resolve, emscripten_promise_then: _emscripten_promise_then, emscripten_random: _emscripten_random, emscripten_request_animation_frame: _emscripten_request_animation_frame, emscripten_request_animation_frame_loop: _emscripten_request_animation_frame_loop, emscripten_request_fullscreen: _emscripten_request_fullscreen, emscripten_request_fullscreen_strategy: _emscripten_request_fullscreen_strategy, emscripten_request_pointerlock: _emscripten_request_pointerlock, emscripten_resize_heap: _emscripten_resize_heap, emscripten_resume_main_loop: _emscripten_resume_main_loop, emscripten_return_address: _emscripten_return_address, emscripten_run_preload_plugins: _emscripten_run_preload_plugins, emscripten_run_preload_plugins_data: _emscripten_run_preload_plugins_data, emscripten_run_script: _emscripten_run_script, emscripten_run_script_int: _emscripten_run_script_int, emscripten_run_script_string: _emscripten_run_script_string, emscripten_runtime_keepalive_check: _emscripten_runtime_keepalive_check, emscripten_runtime_keepalive_pop: _emscripten_runtime_keepalive_pop, emscripten_runtime_keepalive_push: _emscripten_runtime_keepalive_push, emscripten_sample_gamepad_data: _emscripten_sample_gamepad_data, emscripten_scan_registers: _emscripten_scan_registers, emscripten_set_batterychargingchange_callback_on_thread: _emscripten_set_batterychargingchange_callback_on_thread, emscripten_set_batterylevelchange_callback_on_thread: _emscripten_set_batterylevelchange_callback_on_thread, emscripten_set_beforeunload_callback_on_thread: _emscripten_set_beforeunload_callback_on_thread, emscripten_set_blur_callback_on_thread: _emscripten_set_blur_callback_on_thread, emscripten_set_canvas_element_size: _emscripten_set_canvas_element_size, emscripten_set_canvas_size: _emscripten_set_canvas_size, emscripten_set_click_callback_on_thread: _emscripten_set_click_callback_on_thread, emscripten_set_dblclick_callback_on_thread: _emscripten_set_dblclick_callback_on_thread, emscripten_set_devicemotion_callback_on_thread: _emscripten_set_devicemotion_callback_on_thread, emscripten_set_deviceorientation_callback_on_thread: _emscripten_set_deviceorientation_callback_on_thread, emscripten_set_element_css_size: _emscripten_set_element_css_size, emscripten_set_focus_callback_on_thread: _emscripten_set_focus_callback_on_thread, emscripten_set_focusin_callback_on_thread: _emscripten_set_focusin_callback_on_thread, emscripten_set_focusout_callback_on_thread: _emscripten_set_focusout_callback_on_thread, emscripten_set_fullscreenchange_callback_on_thread: _emscripten_set_fullscreenchange_callback_on_thread, emscripten_set_gamepadconnected_callback_on_thread: _emscripten_set_gamepadconnected_callback_on_thread, emscripten_set_gamepaddisconnected_callback_on_thread: _emscripten_set_gamepaddisconnected_callback_on_thread, emscripten_set_immediate: _emscripten_set_immediate, emscripten_set_immediate_loop: _emscripten_set_immediate_loop, emscripten_set_interval: _emscripten_set_interval, emscripten_set_keydown_callback_on_thread: _emscripten_set_keydown_callback_on_thread, emscripten_set_keypress_callback_on_thread: _emscripten_set_keypress_callback_on_thread, emscripten_set_keyup_callback_on_thread: _emscripten_set_keyup_callback_on_thread, emscripten_set_main_loop: _emscripten_set_main_loop, emscripten_set_main_loop_arg: _emscripten_set_main_loop_arg, emscripten_set_main_loop_expected_blockers: _emscripten_set_main_loop_expected_blockers, emscripten_set_main_loop_timing: _emscripten_set_main_loop_timing, emscripten_set_mousedown_callback_on_thread: _emscripten_set_mousedown_callback_on_thread, emscripten_set_mouseenter_callback_on_thread: _emscripten_set_mouseenter_callback_on_thread, emscripten_set_mouseleave_callback_on_thread: _emscripten_set_mouseleave_callback_on_thread, emscripten_set_mousemove_callback_on_thread: _emscripten_set_mousemove_callback_on_thread, emscripten_set_mouseout_callback_on_thread: _emscripten_set_mouseout_callback_on_thread, emscripten_set_mouseover_callback_on_thread: _emscripten_set_mouseover_callback_on_thread, emscripten_set_mouseup_callback_on_thread: _emscripten_set_mouseup_callback_on_thread, emscripten_set_orientationchange_callback_on_thread: _emscripten_set_orientationchange_callback_on_thread, emscripten_set_pointerlockchange_callback_on_thread: _emscripten_set_pointerlockchange_callback_on_thread, emscripten_set_pointerlockerror_callback_on_thread: _emscripten_set_pointerlockerror_callback_on_thread, emscripten_set_resize_callback_on_thread: _emscripten_set_resize_callback_on_thread, emscripten_set_scroll_callback_on_thread: _emscripten_set_scroll_callback_on_thread, emscripten_set_socket_close_callback: _emscripten_set_socket_close_callback, emscripten_set_socket_connection_callback: _emscripten_set_socket_connection_callback, emscripten_set_socket_error_callback: _emscripten_set_socket_error_callback, emscripten_set_socket_listen_callback: _emscripten_set_socket_listen_callback, emscripten_set_socket_message_callback: _emscripten_set_socket_message_callback, emscripten_set_socket_open_callback: _emscripten_set_socket_open_callback, emscripten_set_timeout: _emscripten_set_timeout, emscripten_set_timeout_loop: _emscripten_set_timeout_loop, emscripten_set_touchcancel_callback_on_thread: _emscripten_set_touchcancel_callback_on_thread, emscripten_set_touchend_callback_on_thread: _emscripten_set_touchend_callback_on_thread, emscripten_set_touchmove_callback_on_thread: _emscripten_set_touchmove_callback_on_thread, emscripten_set_touchstart_callback_on_thread: _emscripten_set_touchstart_callback_on_thread, emscripten_set_visibilitychange_callback_on_thread: _emscripten_set_visibilitychange_callback_on_thread, emscripten_set_webglcontextlost_callback_on_thread: _emscripten_set_webglcontextlost_callback_on_thread, emscripten_set_webglcontextrestored_callback_on_thread: _emscripten_set_webglcontextrestored_callback_on_thread, emscripten_set_wheel_callback_on_thread: _emscripten_set_wheel_callback_on_thread, emscripten_set_window_title: _emscripten_set_window_title, emscripten_sleep: _emscripten_sleep, emscripten_stack_snapshot: _emscripten_stack_snapshot, emscripten_stack_unwind_buffer: _emscripten_stack_unwind_buffer, emscripten_supports_offscreencanvas: _emscripten_supports_offscreencanvas, emscripten_throw_number: _emscripten_throw_number, emscripten_throw_string: _emscripten_throw_string, emscripten_unlock_orientation: _emscripten_unlock_orientation, emscripten_unwind_to_js_event_loop: _emscripten_unwind_to_js_event_loop, emscripten_vibrate: _emscripten_vibrate, emscripten_vibrate_pattern: _emscripten_vibrate_pattern, emscripten_webgl_commit_frame: _emscripten_webgl_commit_frame, emscripten_webgl_create_context: _emscripten_webgl_create_context, emscripten_webgl_destroy_context: _emscripten_webgl_destroy_context, emscripten_webgl_do_commit_frame: _emscripten_webgl_do_commit_frame, emscripten_webgl_do_create_context: _emscripten_webgl_do_create_context, emscripten_webgl_do_get_current_context: _emscripten_webgl_do_get_current_context, emscripten_webgl_enable_EXT_clip_control: _emscripten_webgl_enable_EXT_clip_control, emscripten_webgl_enable_EXT_polygon_offset_clamp: _emscripten_webgl_enable_EXT_polygon_offset_clamp, emscripten_webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance: _emscripten_webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance, emscripten_webgl_enable_WEBGL_multi_draw: _emscripten_webgl_enable_WEBGL_multi_draw, emscripten_webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance: _emscripten_webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance, emscripten_webgl_enable_WEBGL_polygon_mode: _emscripten_webgl_enable_WEBGL_polygon_mode, emscripten_webgl_enable_extension: _emscripten_webgl_enable_extension, emscripten_webgl_get_context_attributes: _emscripten_webgl_get_context_attributes, emscripten_webgl_get_current_context: _emscripten_webgl_get_current_context, emscripten_webgl_get_drawing_buffer_size: _emscripten_webgl_get_drawing_buffer_size, emscripten_webgl_get_parameter_d: _emscripten_webgl_get_parameter_d, emscripten_webgl_get_parameter_i64v: _emscripten_webgl_get_parameter_i64v, emscripten_webgl_get_parameter_o: _emscripten_webgl_get_parameter_o, emscripten_webgl_get_parameter_utf8: _emscripten_webgl_get_parameter_utf8, emscripten_webgl_get_parameter_v: _emscripten_webgl_get_parameter_v, emscripten_webgl_get_program_info_log_utf8: _emscripten_webgl_get_program_info_log_utf8, emscripten_webgl_get_program_parameter_d: _emscripten_webgl_get_program_parameter_d, emscripten_webgl_get_shader_info_log_utf8: _emscripten_webgl_get_shader_info_log_utf8, emscripten_webgl_get_shader_parameter_d: _emscripten_webgl_get_shader_parameter_d, emscripten_webgl_get_shader_source_utf8: _emscripten_webgl_get_shader_source_utf8, emscripten_webgl_get_supported_extensions: _emscripten_webgl_get_supported_extensions, emscripten_webgl_get_uniform_d: _emscripten_webgl_get_uniform_d, emscripten_webgl_get_uniform_v: _emscripten_webgl_get_uniform_v, emscripten_webgl_get_vertex_attrib_d: _emscripten_webgl_get_vertex_attrib_d, emscripten_webgl_get_vertex_attrib_o: _emscripten_webgl_get_vertex_attrib_o, emscripten_webgl_get_vertex_attrib_v: _emscripten_webgl_get_vertex_attrib_v, emscripten_webgl_make_context_current: _emscripten_webgl_make_context_current, emscripten_wget_data: _emscripten_wget_data, endprotoent: _endprotoent, environ_get: _environ_get, environ_sizes_get: _environ_sizes_get, exit: _exit, fd_close: _fd_close, fd_fdstat_get: _fd_fdstat_get, fd_pread: _fd_pread, fd_pwrite: _fd_pwrite, fd_read: _fd_read, fd_seek: _fd_seek, fd_sync: _fd_sync, fd_write: _fd_write, getaddrinfo: _getaddrinfo, getnameinfo: _getnameinfo, getprotobyname: _getprotobyname, getprotobynumber: _getprotobynumber, getprotoent: _getprotoent, glActiveTexture: _glActiveTexture, glAttachShader: _glAttachShader, glBegin: _glBegin, glBeginQuery: _glBeginQuery, glBeginQueryEXT: _glBeginQueryEXT, glBeginTransformFeedback: _glBeginTransformFeedback, glBindAttribLocation: _glBindAttribLocation, glBindBuffer: _glBindBuffer, glBindBufferBase: _glBindBufferBase, glBindBufferRange: _glBindBufferRange, glBindFramebuffer: _glBindFramebuffer, glBindRenderbuffer: _glBindRenderbuffer, glBindSampler: _glBindSampler, glBindTexture: _glBindTexture, glBindTransformFeedback: _glBindTransformFeedback, glBindVertexArray: _glBindVertexArray, glBindVertexArrayOES: _glBindVertexArrayOES, glBlendColor: _glBlendColor, glBlendEquation: _glBlendEquation, glBlendEquationSeparate: _glBlendEquationSeparate, glBlendFunc: _glBlendFunc, glBlendFuncSeparate: _glBlendFuncSeparate, glBlitFramebuffer: _glBlitFramebuffer, glBufferData: _glBufferData, glBufferSubData: _glBufferSubData, glCheckFramebufferStatus: _glCheckFramebufferStatus, glClear: _glClear, glClearBufferfi: _glClearBufferfi, glClearBufferfv: _glClearBufferfv, glClearBufferiv: _glClearBufferiv, glClearBufferuiv: _glClearBufferuiv, glClearColor: _glClearColor, glClearDepth: _glClearDepth, glClearDepthf: _glClearDepthf, glClearStencil: _glClearStencil, glClientWaitSync: _glClientWaitSync, glClipControlEXT: _glClipControlEXT, glColorMask: _glColorMask, glCompileShader: _glCompileShader, glCompressedTexImage2D: _glCompressedTexImage2D, glCompressedTexImage3D: _glCompressedTexImage3D, glCompressedTexSubImage2D: _glCompressedTexSubImage2D, glCompressedTexSubImage3D: _glCompressedTexSubImage3D, glCopyBufferSubData: _glCopyBufferSubData, glCopyTexImage2D: _glCopyTexImage2D, glCopyTexSubImage2D: _glCopyTexSubImage2D, glCopyTexSubImage3D: _glCopyTexSubImage3D, glCreateProgram: _glCreateProgram, glCreateShader: _glCreateShader, glCullFace: _glCullFace, glDeleteBuffers: _glDeleteBuffers, glDeleteFramebuffers: _glDeleteFramebuffers, glDeleteProgram: _glDeleteProgram, glDeleteQueries: _glDeleteQueries, glDeleteQueriesEXT: _glDeleteQueriesEXT, glDeleteRenderbuffers: _glDeleteRenderbuffers, glDeleteSamplers: _glDeleteSamplers, glDeleteShader: _glDeleteShader, glDeleteSync: _glDeleteSync, glDeleteTextures: _glDeleteTextures, glDeleteTransformFeedbacks: _glDeleteTransformFeedbacks, glDeleteVertexArrays: _glDeleteVertexArrays, glDeleteVertexArraysOES: _glDeleteVertexArraysOES, glDepthFunc: _glDepthFunc, glDepthMask: _glDepthMask, glDepthRange: _glDepthRange, glDepthRangef: _glDepthRangef, glDetachShader: _glDetachShader, glDisable: _glDisable, glDisableVertexAttribArray: _glDisableVertexAttribArray, glDrawArrays: _glDrawArrays, glDrawArraysInstanced: _glDrawArraysInstanced, glDrawArraysInstancedANGLE: _glDrawArraysInstancedANGLE, glDrawArraysInstancedARB: _glDrawArraysInstancedARB, glDrawArraysInstancedBaseInstance: _glDrawArraysInstancedBaseInstance, glDrawArraysInstancedBaseInstanceANGLE: _glDrawArraysInstancedBaseInstanceANGLE, glDrawArraysInstancedBaseInstanceWEBGL: _glDrawArraysInstancedBaseInstanceWEBGL, glDrawArraysInstancedEXT: _glDrawArraysInstancedEXT, glDrawArraysInstancedNV: _glDrawArraysInstancedNV, glDrawBuffers: _glDrawBuffers, glDrawBuffersEXT: _glDrawBuffersEXT, glDrawBuffersWEBGL: _glDrawBuffersWEBGL, glDrawElements: _glDrawElements, glDrawElementsInstanced: _glDrawElementsInstanced, glDrawElementsInstancedANGLE: _glDrawElementsInstancedANGLE, glDrawElementsInstancedARB: _glDrawElementsInstancedARB, glDrawElementsInstancedBaseVertexBaseInstanceANGLE: _glDrawElementsInstancedBaseVertexBaseInstanceANGLE, glDrawElementsInstancedBaseVertexBaseInstanceWEBGL: _glDrawElementsInstancedBaseVertexBaseInstanceWEBGL, glDrawElementsInstancedEXT: _glDrawElementsInstancedEXT, glDrawElementsInstancedNV: _glDrawElementsInstancedNV, glDrawRangeElements: _glDrawRangeElements, glEnable: _glEnable, glEnableVertexAttribArray: _glEnableVertexAttribArray, glEndQuery: _glEndQuery, glEndQueryEXT: _glEndQueryEXT, glEndTransformFeedback: _glEndTransformFeedback, glFenceSync: _glFenceSync, glFinish: _glFinish, glFlush: _glFlush, glFlushMappedBufferRange: _glFlushMappedBufferRange, glFramebufferRenderbuffer: _glFramebufferRenderbuffer, glFramebufferTexture2D: _glFramebufferTexture2D, glFramebufferTextureLayer: _glFramebufferTextureLayer, glFrontFace: _glFrontFace, glGenBuffers: _glGenBuffers, glGenFramebuffers: _glGenFramebuffers, glGenQueries: _glGenQueries, glGenQueriesEXT: _glGenQueriesEXT, glGenRenderbuffers: _glGenRenderbuffers, glGenSamplers: _glGenSamplers, glGenTextures: _glGenTextures, glGenTransformFeedbacks: _glGenTransformFeedbacks, glGenVertexArrays: _glGenVertexArrays, glGenVertexArraysOES: _glGenVertexArraysOES, glGenerateMipmap: _glGenerateMipmap, glGetActiveAttrib: _glGetActiveAttrib, glGetActiveUniform: _glGetActiveUniform, glGetActiveUniformBlockName: _glGetActiveUniformBlockName, glGetActiveUniformBlockiv: _glGetActiveUniformBlockiv, glGetActiveUniformsiv: _glGetActiveUniformsiv, glGetAttachedShaders: _glGetAttachedShaders, glGetAttribLocation: _glGetAttribLocation, glGetBooleanv: _glGetBooleanv, glGetBufferParameteri64v: _glGetBufferParameteri64v, glGetBufferParameteriv: _glGetBufferParameteriv, glGetBufferPointerv: _glGetBufferPointerv, glGetBufferSubData: _glGetBufferSubData, glGetError: _glGetError, glGetFloatv: _glGetFloatv, glGetFragDataLocation: _glGetFragDataLocation, glGetFramebufferAttachmentParameteriv: _glGetFramebufferAttachmentParameteriv, glGetInteger64i_v: _glGetInteger64i_v, glGetInteger64v: _glGetInteger64v, glGetIntegeri_v: _glGetIntegeri_v, glGetIntegerv: _glGetIntegerv, glGetInternalformativ: _glGetInternalformativ, glGetProgramBinary: _glGetProgramBinary, glGetProgramInfoLog: _glGetProgramInfoLog, glGetProgramiv: _glGetProgramiv, glGetQueryObjecti64vEXT: _glGetQueryObjecti64vEXT, glGetQueryObjectivEXT: _glGetQueryObjectivEXT, glGetQueryObjectui64vEXT: _glGetQueryObjectui64vEXT, glGetQueryObjectuiv: _glGetQueryObjectuiv, glGetQueryObjectuivEXT: _glGetQueryObjectuivEXT, glGetQueryiv: _glGetQueryiv, glGetQueryivEXT: _glGetQueryivEXT, glGetRenderbufferParameteriv: _glGetRenderbufferParameteriv, glGetSamplerParameterfv: _glGetSamplerParameterfv, glGetSamplerParameteriv: _glGetSamplerParameteriv, glGetShaderInfoLog: _glGetShaderInfoLog, glGetShaderPrecisionFormat: _glGetShaderPrecisionFormat, glGetShaderSource: _glGetShaderSource, glGetShaderiv: _glGetShaderiv, glGetString: _glGetString, glGetStringi: _glGetStringi, glGetSynciv: _glGetSynciv, glGetTexParameterfv: _glGetTexParameterfv, glGetTexParameteriv: _glGetTexParameteriv, glGetTransformFeedbackVarying: _glGetTransformFeedbackVarying, glGetUniformBlockIndex: _glGetUniformBlockIndex, glGetUniformIndices: _glGetUniformIndices, glGetUniformLocation: _glGetUniformLocation, glGetUniformfv: _glGetUniformfv, glGetUniformiv: _glGetUniformiv, glGetUniformuiv: _glGetUniformuiv, glGetVertexAttribIiv: _glGetVertexAttribIiv, glGetVertexAttribIuiv: _glGetVertexAttribIuiv, glGetVertexAttribPointerv: _glGetVertexAttribPointerv, glGetVertexAttribfv: _glGetVertexAttribfv, glGetVertexAttribiv: _glGetVertexAttribiv, glHint: _glHint, glInvalidateFramebuffer: _glInvalidateFramebuffer, glInvalidateSubFramebuffer: _glInvalidateSubFramebuffer, glIsBuffer: _glIsBuffer, glIsEnabled: _glIsEnabled, glIsFramebuffer: _glIsFramebuffer, glIsProgram: _glIsProgram, glIsQuery: _glIsQuery, glIsQueryEXT: _glIsQueryEXT, glIsRenderbuffer: _glIsRenderbuffer, glIsSampler: _glIsSampler, glIsShader: _glIsShader, glIsSync: _glIsSync, glIsTexture: _glIsTexture, glIsTransformFeedback: _glIsTransformFeedback, glIsVertexArray: _glIsVertexArray, glIsVertexArrayOES: _glIsVertexArrayOES, glLineWidth: _glLineWidth, glLinkProgram: _glLinkProgram, glLoadIdentity: _glLoadIdentity, glMapBufferRange: _glMapBufferRange, glMatrixMode: _glMatrixMode, glMultiDrawArrays: _glMultiDrawArrays, glMultiDrawArraysANGLE: _glMultiDrawArraysANGLE, glMultiDrawArraysInstancedANGLE: _glMultiDrawArraysInstancedANGLE, glMultiDrawArraysInstancedBaseInstanceANGLE: _glMultiDrawArraysInstancedBaseInstanceANGLE, glMultiDrawArraysInstancedBaseInstanceWEBGL: _glMultiDrawArraysInstancedBaseInstanceWEBGL, glMultiDrawArraysInstancedWEBGL: _glMultiDrawArraysInstancedWEBGL, glMultiDrawArraysWEBGL: _glMultiDrawArraysWEBGL, glMultiDrawElements: _glMultiDrawElements, glMultiDrawElementsANGLE: _glMultiDrawElementsANGLE, glMultiDrawElementsInstancedANGLE: _glMultiDrawElementsInstancedANGLE, glMultiDrawElementsInstancedBaseVertexBaseInstanceANGLE: _glMultiDrawElementsInstancedBaseVertexBaseInstanceANGLE, glMultiDrawElementsInstancedBaseVertexBaseInstanceWEBGL: _glMultiDrawElementsInstancedBaseVertexBaseInstanceWEBGL, glMultiDrawElementsInstancedWEBGL: _glMultiDrawElementsInstancedWEBGL, glMultiDrawElementsWEBGL: _glMultiDrawElementsWEBGL, glPauseTransformFeedback: _glPauseTransformFeedback, glPixelStorei: _glPixelStorei, glPolygonModeWEBGL: _glPolygonModeWEBGL, glPolygonOffset: _glPolygonOffset, glPolygonOffsetClampEXT: _glPolygonOffsetClampEXT, glProgramBinary: _glProgramBinary, glProgramParameteri: _glProgramParameteri, glQueryCounterEXT: _glQueryCounterEXT, glReadBuffer: _glReadBuffer, glReadPixels: _glReadPixels, glReleaseShaderCompiler: _glReleaseShaderCompiler, glRenderbufferStorage: _glRenderbufferStorage, glRenderbufferStorageMultisample: _glRenderbufferStorageMultisample, glResumeTransformFeedback: _glResumeTransformFeedback, glSampleCoverage: _glSampleCoverage, glSamplerParameterf: _glSamplerParameterf, glSamplerParameterfv: _glSamplerParameterfv, glSamplerParameteri: _glSamplerParameteri, glSamplerParameteriv: _glSamplerParameteriv, glScissor: _glScissor, glShaderBinary: _glShaderBinary, glShaderSource: _glShaderSource, glStencilFunc: _glStencilFunc, glStencilFuncSeparate: _glStencilFuncSeparate, glStencilMask: _glStencilMask, glStencilMaskSeparate: _glStencilMaskSeparate, glStencilOp: _glStencilOp, glStencilOpSeparate: _glStencilOpSeparate, glTexImage2D: _glTexImage2D, glTexImage3D: _glTexImage3D, glTexParameterf: _glTexParameterf, glTexParameterfv: _glTexParameterfv, glTexParameteri: _glTexParameteri, glTexParameteriv: _glTexParameteriv, glTexStorage2D: _glTexStorage2D, glTexStorage3D: _glTexStorage3D, glTexSubImage2D: _glTexSubImage2D, glTexSubImage3D: _glTexSubImage3D, glTransformFeedbackVaryings: _glTransformFeedbackVaryings, glUniform1f: _glUniform1f, glUniform1fv: _glUniform1fv, glUniform1i: _glUniform1i, glUniform1iv: _glUniform1iv, glUniform1ui: _glUniform1ui, glUniform1uiv: _glUniform1uiv, glUniform2f: _glUniform2f, glUniform2fv: _glUniform2fv, glUniform2i: _glUniform2i, glUniform2iv: _glUniform2iv, glUniform2ui: _glUniform2ui, glUniform2uiv: _glUniform2uiv, glUniform3f: _glUniform3f, glUniform3fv: _glUniform3fv, glUniform3i: _glUniform3i, glUniform3iv: _glUniform3iv, glUniform3ui: _glUniform3ui, glUniform3uiv: _glUniform3uiv, glUniform4f: _glUniform4f, glUniform4fv: _glUniform4fv, glUniform4i: _glUniform4i, glUniform4iv: _glUniform4iv, glUniform4ui: _glUniform4ui, glUniform4uiv: _glUniform4uiv, glUniformBlockBinding: _glUniformBlockBinding, glUniformMatrix2fv: _glUniformMatrix2fv, glUniformMatrix2x3fv: _glUniformMatrix2x3fv, glUniformMatrix2x4fv: _glUniformMatrix2x4fv, glUniformMatrix3fv: _glUniformMatrix3fv, glUniformMatrix3x2fv: _glUniformMatrix3x2fv, glUniformMatrix3x4fv: _glUniformMatrix3x4fv, glUniformMatrix4fv: _glUniformMatrix4fv, glUniformMatrix4x2fv: _glUniformMatrix4x2fv, glUniformMatrix4x3fv: _glUniformMatrix4x3fv, glUnmapBuffer: _glUnmapBuffer, glUseProgram: _glUseProgram, glValidateProgram: _glValidateProgram, glVertexAttrib1f: _glVertexAttrib1f, glVertexAttrib1fv: _glVertexAttrib1fv, glVertexAttrib2f: _glVertexAttrib2f, glVertexAttrib2fv: _glVertexAttrib2fv, glVertexAttrib3f: _glVertexAttrib3f, glVertexAttrib3fv: _glVertexAttrib3fv, glVertexAttrib4f: _glVertexAttrib4f, glVertexAttrib4fv: _glVertexAttrib4fv, glVertexAttribDivisor: _glVertexAttribDivisor, glVertexAttribDivisorANGLE: _glVertexAttribDivisorANGLE, glVertexAttribDivisorARB: _glVertexAttribDivisorARB, glVertexAttribDivisorEXT: _glVertexAttribDivisorEXT, glVertexAttribDivisorNV: _glVertexAttribDivisorNV, glVertexAttribI4i: _glVertexAttribI4i, glVertexAttribI4iv: _glVertexAttribI4iv, glVertexAttribI4ui: _glVertexAttribI4ui, glVertexAttribI4uiv: _glVertexAttribI4uiv, glVertexAttribIPointer: _glVertexAttribIPointer, glVertexAttribPointer: _glVertexAttribPointer, glVertexPointer: _glVertexPointer, glViewport: _glViewport, glWaitSync: _glWaitSync, glewGetErrorString: _glewGetErrorString, glewGetExtension: _glewGetExtension, glewGetString: _glewGetString, glewInit: _glewInit, glewIsSupported: _glewIsSupported, glutCreateWindow: _glutCreateWindow, glutDestroyWindow: _glutDestroyWindow, glutDisplayFunc: _glutDisplayFunc, glutFullScreen: _glutFullScreen, glutGet: _glutGet, glutGetModifiers: _glutGetModifiers, glutIdleFunc: _glutIdleFunc, glutInit: _glutInit, glutInitDisplayMode: _glutInitDisplayMode, glutInitWindowPosition: _glutInitWindowPosition, glutInitWindowSize: _glutInitWindowSize, glutKeyboardFunc: _glutKeyboardFunc, glutKeyboardUpFunc: _glutKeyboardUpFunc, glutMainLoop: _glutMainLoop, glutMotionFunc: _glutMotionFunc, glutMouseFunc: _glutMouseFunc, glutPassiveMotionFunc: _glutPassiveMotionFunc, glutPositionWindow: _glutPositionWindow, glutPostRedisplay: _glutPostRedisplay, glutReshapeFunc: _glutReshapeFunc, glutReshapeWindow: _glutReshapeWindow, glutSetCursor: _glutSetCursor, glutSpecialFunc: _glutSpecialFunc, glutSpecialUpFunc: _glutSpecialUpFunc, glutSwapBuffers: _glutSwapBuffers, glutTimerFunc: _glutTimerFunc, invoke_v, invoke_vd, invoke_vi, invoke_vii, llvm_eh_typeid_for: _llvm_eh_typeid_for, memory: wasmMemory, proc_exit: _proc_exit, random_get: _random_get, recvfrom_js: _recvfrom_js, sendto_js: _sendto_js, setNetworkCallback: _setNetworkCallback, setprotoent: _setprotoent, stackAlloc: _stackAlloc, stackRestore: _stackRestore, stackSave: _stackSave, strptime: _strptime, strptime_l: _strptime_l, uuid_clear: _uuid_clear, uuid_compare: _uuid_compare, uuid_copy: _uuid_copy, uuid_generate: _uuid_generate, uuid_is_null: _uuid_is_null, uuid_parse: _uuid_parse, uuid_type: _uuid_type, uuid_unparse: _uuid_unparse, uuid_unparse_lower: _uuid_unparse_lower, uuid_unparse_upper: _uuid_unparse_upper, uuid_variant: _uuid_variant };
        var wasmExports = await createWasm();
        function invoke_v(index) { var sp = stackSave(); try {
            getWasmTableEntry(index)();
        }
        catch (e) {
            stackRestore(sp);
            if (e !== e + 0)
                throw e;
            _setThrew(1, 0);
        } }
        function invoke_vd(index, a1) { var sp = stackSave(); try {
            getWasmTableEntry(index)(a1);
        }
        catch (e) {
            stackRestore(sp);
            if (e !== e + 0)
                throw e;
            _setThrew(1, 0);
        } }
        function invoke_vii(index, a1, a2) { var sp = stackSave(); try {
            getWasmTableEntry(index)(a1, a2);
        }
        catch (e) {
            stackRestore(sp);
            if (e !== e + 0)
                throw e;
            _setThrew(1, 0);
        } }
        function invoke_vi(index, a1) { var sp = stackSave(); try {
            getWasmTableEntry(index)(a1);
        }
        catch (e) {
            stackRestore(sp);
            if (e !== e + 0)
                throw e;
            _setThrew(1, 0);
        } }
        function callMain(args = []) { var entryFunction = resolveGlobalSymbol("main").sym; if (!entryFunction)
            return; args.unshift(thisProgram); var argc = args.length; var argv = stackAlloc((argc + 1) * 4); var argv_ptr = argv; args.forEach(arg => { HEAPU32[argv_ptr >> 2] = stringToUTF8OnStack(arg); argv_ptr += 4; }); HEAPU32[argv_ptr >> 2] = 0; try {
            var ret = entryFunction(argc, argv);
            exitJS(ret, true);
            return ret;
        }
        catch (e) {
            return handleException(e);
        } }
        function stackCheckInit() { _emscripten_stack_set_limits(33286528, 16509312); writeStackCookie(); }
        function run(args = arguments_) { if (runDependencies > 0) {
            dependenciesFulfilled = run;
            return;
        } stackCheckInit(); preRun(); if (runDependencies > 0) {
            dependenciesFulfilled = run;
            return;
        } function doRun() { Module["calledRun"] = true; if (ABORT)
            return; initRuntime(); preMain(); readyPromiseResolve?.(Module); Module["onRuntimeInitialized"]?.(); var noInitialRun = Module["noInitialRun"] || false; if (!noInitialRun)
            callMain(args); postRun(); } if (Module["setStatus"]) {
            Module["setStatus"]("Running...");
            setTimeout(() => { setTimeout(() => Module["setStatus"](""), 1); doRun(); }, 1);
        }
        else {
            doRun();
        } checkStackCookie(); }
        function preInit() { if (Module["preInit"]) {
            if (typeof Module["preInit"] == "function")
                Module["preInit"] = [Module["preInit"]];
            while (Module["preInit"].length > 0) {
                Module["preInit"].shift()();
            }
        } }
        if (runtimeInitialized) {
            moduleRtn = Module;
        }
        else {
            moduleRtn = new Promise((resolve, reject) => { readyPromiseResolve = resolve; readyPromiseReject = reject; });
        }
        ;
        return {
            Module,
            FS,
            HEAP32,
            HEAP16,
            HEAP8,
            HEAPU8,
            getValue,
            addFunction,
            removeFunction,
            start: () => {
                preInit();
                run();
            },
        };
    };
})();
export default Xash3D;
