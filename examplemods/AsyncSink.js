ModAPI.meta.title("AsyncSink");
ModAPI.meta.description("Library for patching and hooking into asynchronous filesystem requests for EaglercraftX.");
const asyncSinkIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAAXNSR0IArs4c6QAAAL9JREFUOE9jZGBg+M9ABcAIMsgtPo3hzZ2zYONEVIxJZu9aOIsBbJCRtTHcEJAgLgBSh82ic0fPIgyCKQAJXrx4EcUsfX19sBiIRrYU5gu4Qchew2cQyHSQYehBgdNruFwEcybMZci+gIcRIa+hhxu6LzBiDZvX0A1BDyuivYbLIJK8pqevjze5GlsbMxAdayCT/PQwDRS2gaQror2m36KH4SqjZybwxEl0gsQWRkM01ogpVQh6jaJihBgXEFIDAAIQ9AFDJlrxAAAAAElFTkSuQmCC";
ModAPI.meta.icon(asyncSinkIcon);
ModAPI.meta.credits("By ZXMushroom63");
(function AsyncSinkFn() {
    //AsyncSink is a plugin to debug and override asynchronous methods in EaglercraftX
    async function runtimeComponent() {
        const booleanResult = (b) => ModAPI.hooks.methods.nlevit_BooleanResult__new(b * 1);
        const wrap = ModAPI.hooks.methods.otji_JSWrapper_wrap;
        const unwrap = ModAPI.hooks.methods.otji_JSWrapper_unwrap;
        function getAsyncHandlerName(name) {
            var suffix = `$AsyncHandlers_${name}$_asyncCall_$`;
            return ModAPI.hooks._rippedMethodKeys.find(x => x.endsWith(suffix));
        }
        var fs_debugging = false;
        const encoder = new TextEncoder('utf-8');
        var filesystemPlatform = ModAPI.hooks.methods.nlevit_IndexedDBFilesystem$AsyncHandlers_readWholeFile ? true : false;
        if (!filesystemPlatform) {
            console.error("AsyncSink requires EaglercraftX u37 or greater to work! Attempting to run anyway...");
        }
        const AsyncSink = {};
        const originalSuspend = ModAPI.hooks.TeaVMThread.prototype.suspend;
        AsyncSink.startDebugging = function hookIntoSuspend() {
            ModAPI.hooks.TeaVMThread.prototype.suspend = function suspend(...args) {
                console.log("[AsyncSink] Context suspended! Callback: ", args[0]);
                return originalSuspend.apply(this, args);
            }
        }
        AsyncSink.stopDebugging = function unhookFromSuspend() {
            ModAPI.hooks.TeaVMThread.prototype.suspend = originalSuspend;
        }

        AsyncSink.startDebuggingFS = function hookIntoSuspend() {
            fs_debugging = true;
        }
        AsyncSink.stopDebuggingFS = function unhookFromSuspend() {
            fs_debugging = false;
        }

        // @type Map<string, ArrayBuffer>
        AsyncSink.FS = new Map();
        AsyncSink.L10N = new Map();
        AsyncSink.FSOverride = new Set();
        AsyncSink.MIDDLEWARE = [];
        AsyncSink.setFile = function setFile(path, data) {
            if (typeof data === "string") {
                data = encoder.encode(data).buffer;
            }
            AsyncSink.FSOverride.add(path);
            AsyncSink.FS.set(path, data);
            return true;
        }

        AsyncSink.deleteFile = function deleteFile(path) {
            AsyncSink.FSOverride.delete(path);
            AsyncSink.FS.delete(path);
            return true;
        }

        AsyncSink.getFile = function getFile(path) {
            return AsyncSink.FS.get(path) || new ArrayBuffer(0);
        }

        AsyncSink.fileExists = function fileExists(path) {
            return AsyncSink.FS.has(path);
        }

        var readWholeFileName = getAsyncHandlerName("readWholeFile");
        var writeWholeFileName = getAsyncHandlerName("writeWholeFile");
        var deleteFileName = getAsyncHandlerName("deleteFile");
        var fileExistsName = getAsyncHandlerName("fileExists");

        const originalReadWholeFile = ModAPI.hooks.methods[readWholeFileName];
        ModAPI.hooks.methods[readWholeFileName] = function (...args) {
            if (fs_debugging) {
                console.log("[AsynkSinkFS] File read request sent: " + ModAPI.util.ustr(args[1]));
            }
            if (AsyncSink.FSOverride.has(ModAPI.util.ustr(args[1]))) {
                if (fs_debugging) {
                    console.log("[AsynkSinkFS] Replied with copy from fake filesystem.");
                }
                return wrap(AsyncSink.getFile(ModAPI.util.ustr(args[1])));
            }
            var ev = { method: "read", file: ModAPI.util.ustr(args[1]), shim: false, shimOutput: new ArrayBuffer() };
            AsyncSink.MIDDLEWARE.forEach((fn) => { fn(ev) });
            if (ev.shim) {
                return wrap(ev.shimOutput);
            }
            return originalReadWholeFile.apply(this, args);
        };

        const originalWriteWholeFile = ModAPI.hooks.methods[writeWholeFileName];
        ModAPI.hooks.methods[writeWholeFileName] = function (...args) {
            if (fs_debugging) {
                console.log("[AsynkSinkFS] File write request sent: " + ModAPI.util.ustr(args[1]), args[2]);
            }
            if (AsyncSink.FSOverride.has(ModAPI.util.ustr(args[1]))) {
                if (fs_debugging) {
                    console.log("[AsynkSinkFS] Writing to fake filesystem.");
                }
                AsyncSink.setFile(ModAPI.util.ustr(args[1]), args[2]);
                return booleanResult(true);
            }
            var ev = { method: "write", file: ModAPI.util.ustr(args[1]), data: args[2], shim: false, shimOutput: true };
            AsyncSink.MIDDLEWARE.forEach((fn) => { fn(ev) });
            if (ev.shim) {
                return booleanResult(ev.shimOutput);
            }
            return originalWriteWholeFile.apply(this, args);
        };

        const originalDeleteFile = ModAPI.hooks.methods[deleteFileName];
        ModAPI.hooks.methods[deleteFileName] = function (...args) {
            if (fs_debugging) {
                console.log("[AsynkSinkFS] File delete request sent: " + ModAPI.util.ustr(args[1]));
            }
            if (AsyncSink.FSOverride.has(ModAPI.util.ustr(args[1]))) {
                if (fs_debugging) {
                    console.log("[AsynkSinkFS] Deleting entry from fake filesystem.");
                }
                AsyncSink.deleteFile(ModAPI.util.ustr(args[1]));
                return booleanResult(true);
            }
            var ev = { method: "delete", file: ModAPI.util.ustr(args[1]), shim: false, shimOutput: true };
            AsyncSink.MIDDLEWARE.forEach((fn) => { fn(ev) });
            if (ev.shim) {
                return booleanResult(ev.shimOutput);
            }
            return originalDeleteFile.apply(this, args);
        };

        const originalFileExists = ModAPI.hooks.methods[fileExistsName];
        ModAPI.hooks.methods[fileExistsName] = function (...args) {
            if (fs_debugging) {
                console.log("[AsynkSinkFS] File exists request sent: " + ModAPI.util.ustr(args[1]));
            }
            if (AsyncSink.FSOverride.has(ModAPI.util.ustr(args[1]))) {
                if (fs_debugging) {
                    console.log("[AsynkSinkFS] Replying with information from fake filesystem.");
                }
                var result = AsyncSink.fileExists(ModAPI.util.ustr(args[1]));
                return booleanResult(result);
            }
            var ev = { method: "exists", file: ModAPI.util.ustr(args[1]), shim: false, shimOutput: true };
            AsyncSink.MIDDLEWARE.forEach((fn) => { fn(ev) });
            if (ev.shim) {
                return booleanResult(ev.shimOutput);
            }
            return originalFileExists.apply(this, args);
        };

        const L10NRead = ModAPI.util.getMethodFromPackage("net.minecraft.util.StatCollector", "translateToLocal");
        const originalL10NRead = ModAPI.hooks.methods[L10NRead];
        ModAPI.hooks.methods[L10NRead] = function (...args) {
            var key = ModAPI.util.ustr(args[0]);
            if (AsyncSink.L10N.has(key)) {
                return ModAPI.util.str(AsyncSink.L10N.get(key));
            }
            return originalL10NRead.apply(this, args);
        };

        const L18NFormat = ModAPI.util.getMethodFromPackage("net.minecraft.client.resources.I18n", "format");
        const originalL18NFormat = ModAPI.hooks.methods[L18NFormat];
        ModAPI.hooks.methods[L18NFormat] = function (...args) {
            var key = ModAPI.util.ustr(args[0]);
            if (AsyncSink.L10N.has(key)) {
                args[0] = ModAPI.util.str(AsyncSink.L10N.get(key));
            }
            return originalL18NFormat.apply(this, args);
        };

        const L10NCheck = ModAPI.util.getMethodFromPackage("net.minecraft.util.StatCollector", "canTranslate");
        const originalL10NCheck = ModAPI.hooks.methods[L10NCheck];
        ModAPI.hooks.methods[L10NCheck] = function (...args) {
            if (AsyncSink.L10N.has(ModAPI.util.ustr(args[0]))) {
                return 1;
            }
            return originalL10NCheck.apply(this, args);
        };

        globalThis.AsyncSink = AsyncSink;
        ModAPI.events.newEvent("lib:asyncsink");
        ModAPI.events.callEvent("lib:asyncsink", {});
        console.log("[AsyncSink] Loaded!");
    }
    runtimeComponent();
    ModAPI.dedicatedServer.appendCode(runtimeComponent);


    async function assureAsyncSinkResources() {
        const dec = new TextDecoder("utf-8");
        const enc = new TextEncoder("utf-8");
        var resourcePackKey = (await indexedDB.databases()).find(x => x?.name?.endsWith("_resourcePacks")).name;
        const dbRequest = indexedDB.open(resourcePackKey);
        const db = await promisifyIDBRequest(dbRequest);
        const transaction = db.transaction(["filesystem"], "readonly");
        const objectStore = transaction.objectStore("filesystem");
        var object = (await promisifyIDBRequest(objectStore.get(["resourcepacks/manifest.json"])))?.data;
        var resourcePackList = object ? JSON.parse(dec.decode(object)) : { resourcePacks: [] };
        var pack = {
            domains: ["minecraft", "eagler"],
            folder: "AsyncSinkLib",
            name: "AsyncSinkLib",
            timestamp: Date.now()
        };
        if (!Array.isArray(resourcePackList.resourcePacks)) {
            resourcePackList.resourcePacks = [];
        }
        if (resourcePackList.resourcePacks.find(x => x.name === "AsyncSinkLib")) {
            var idx = resourcePackList.resourcePacks.indexOf(resourcePackList.resourcePacks.find(x => x.name === "AsyncSinkLib"));
            resourcePackList.resourcePacks[idx] = pack;
        } else {
            resourcePackList.resourcePacks.push(pack);
        }

        const writeableTransaction = db.transaction(["filesystem"], "readwrite");
        const writeableObjectStore = writeableTransaction.objectStore("filesystem");
        await promisifyIDBRequest(writeableObjectStore.put({
            path: "resourcepacks/manifest.json",
            data: enc.encode(JSON.stringify(resourcePackList)).buffer
        }));
        await promisifyIDBRequest(writeableObjectStore.put({
            path: "resourcepacks/AsyncSinkLib/pack.mcmeta",
            data: enc.encode(JSON.stringify({
                "pack": {
                    "pack_format": 1,
                    "description": "AsyncSink Library Resources"
                }
            })).buffer
        }));

        var icon = {
            path: "resourcepacks/AsyncSinkLib/pack.png",
            data: await (await fetch(asyncSinkIcon)).arrayBuffer()
        };

        const imageTransaction = db.transaction(["filesystem"], "readwrite");
        const imageObjectStore = imageTransaction.objectStore("filesystem");

        await promisifyIDBRequest(imageObjectStore.put(icon));
    }

    // Client side reminders to enable the AsyncSink Resource Pack
    var asyncSinkInstallStatus = false;
    var installMessage = document.createElement("span");
    installMessage.innerText = "Please enable the AsyncSink resource pack\nIn game, use the .reload_tex command to load textures for modded blocks and items.";
    installMessage.style = "background-color: rgba(0,0,0,0.7); color: red; position: fixed; top: 0; left: 0; font-family: sans-serif; pointer-events: none; user-select: none;";
    document.body.appendChild(installMessage);

    assureAsyncSinkResources();
    setInterval(() => {
        var resourcePackEntries = ModAPI.mc.mcResourcePackRepository.getRepositoryEntries().getCorrective();
        var array = resourcePackEntries.array || [resourcePackEntries.element];
        asyncSinkInstallStatus = array.find(x => ModAPI.util.ustr(x.reResourcePack.resourcePackFile.getRef()) === "AsyncSinkLib") ? true : false;
        //assureAsyncSinkResources();
        if (asyncSinkInstallStatus) {
            installMessage.style.display = "none";
        } else {
            installMessage.style.display = "initial";
        }
    }, 8000);
    ModAPI.events.newEvent("custom:asyncsink_reloaded");
    ModAPI.addEventListener("sendchatmessage", (e) => {
        if (e.message.toLowerCase().startsWith(".reload_tex")) {
            e.preventDefault = true;
            ModAPI.mc.renderItem.itemModelMesher.simpleShapesCache.clear();
            ModAPI.promisify(ModAPI.mc.refreshResources)().then(() => {
                ModAPI.events.callEvent("custom:asyncsink_reloaded", {});
            });
        }
    });
    ModAPI.events.newEvent("lib:asyncsink:registeritems");
    const regItemsName = ModAPI.util.getMethodFromPackage("net.minecraft.client.renderer.entity.RenderItem", "registerItems");
    const oldRegisterItems = ModAPI.hooks.methods[regItemsName];
    ModAPI.hooks.methods[regItemsName] = function (...args) {
        oldRegisterItems.apply(this, args);
        ModAPI.events.callEvent("lib:asyncsink:registeritems", ModAPI.util.wrap(args[0]));
    }

})();