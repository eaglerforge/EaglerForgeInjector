var assets = {
    modapi_guikit: null,
    modapi_postinit: null,
    modapi_modloader: null,
    PatchesRegistry: null,
    EFServer: null,
    minify: null
};
if (globalThis.process) {
    assets.modapi_guikit = require("./modgui").modapi_guikit;
    assets.modapi_postinit = require("./postinit").modapi_postinit;
    assets.modapi_modloader = require("./modloader").modapi_modloader;
    assets.PatchesRegistry = require("./patches").PatchesRegistry;
    assets.EFServer = require("./efserver").EFServer;
    assets.minify = require("./minify").minify;
} else {
    assets.PatchesRegistry = PatchesRegistry;
    assets.minify = minify;
    assets.EFServer = EFServer;
    assets.modapi_postinit = modapi_postinit;
    assets.modapi_modloader = modapi_modloader;
    assets.modapi_guikit = modapi_guikit;
}
var modapi_preinit = `globalThis.ModAPI ||= {};
          ModAPI.hooks ||= {};
          ModAPI.hooks.freezeCallstack = false;
          ModAPI.hooks._rippedData ||= [];
          ModAPI.hooks._rippedInterfaceMap ||= {};
          ModAPI.hooks._teavm ||= {};
          ModAPI.hooks._rippedConstructors ||= {};
          ModAPI.hooks._rippedInternalConstructors ||= {};
          ModAPI.hooks.methods ||= {};
          ModAPI.hooks._rippedMethodTypeMap ||= {};
          ModAPI.hooks._postInit ||= ()=>{};
          ModAPI.hooks._rippedStaticProperties ||= {};
          ModAPI.hooks._rippedStaticIndexer ||= {};
      `;
var freezeCallstack = `if(ModAPI.hooks.freezeCallstack){return false};`;
const EFIConfig = {
    ModAPIVersion: "v2.7.94", //also change in package.json
    doEaglerforge: true,
    verbose: false,
    doServerExtras: false,
    doMinify: false,
    doMinifyPlus: false
}
if (globalThis.process) {
    var backgroundLog = (x) => {
        if (EFIConfig.verbose) {
            console.log(x);
        }
    };
    var alert = console.error;
    var confirm = console.warn;
}
function wait(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(() => { resolve(); }, ms);
    });
}
function _status(x) {
    if (globalThis.process) {
        return console.log(x);
    }
    backgroundLog(x, true);
    document.querySelector("#status").innerText = x;
}
function entriesToStaticVariableProxy(entries, prefix, clinitList) {
    prefix = prefix.replace(
        "var ",
        ""
    );
    if (entries.length === 0) {
        return `ModAPI.hooks._rippedStaticProperties[\`${prefix}\`]={};`;
    }
    if (clinitList.includes(prefix + "_$callClinit")) {
        entries.push({
            name: "$callClinit",
            variable: prefix + "_$callClinit"
        });
    }
    var getComponents = "";
    entries.forEach((entry) => {
        getComponents += `
             case \`${entry.name}\`: return ${entry.variable};`;
    });
    getComponents += `
            default: return Reflect.get(a,b,c);`

    var setComponents = "";
    entries.forEach((entry) => {
        setComponents += `
            case \`${entry.name}\`: ${entry.variable} = c; break;`;
    });
    setComponents += ` default: a[b]=c;`
    /*/

        ModAPI.hooks._rippedStaticIndexer[\`${prefix.replace(
        "var ",
        ""
    )}\`] = [${entries
        .flatMap((x) => {
            return '"' + x.name + '"';
        })
        .join(",")}];
    /*/
    var proxy = `ModAPI.hooks._rippedStaticProperties[\`${prefix.replace(
        "var ",
        ""
    )}\`] = new Proxy({${entries
        .flatMap((x) => {
            return '"' + x.name + '"';
        })
        .join(":null,") + (entries.length > 0 ? ":null" : "")
        }}, {
            get: function (a,b,c) {
                switch (b) {
                    ${getComponents}
                }
            },
            set: function (a,b,c) {
                switch (b) {
                    ${setComponents}
                }
                return true;
            }
          });`;
    return proxy;
}
async function processClasses(string, parser) {
    _status("Running EaglerForgeInjector " + EFIConfig.ModAPIVersion);
    if (string.includes("__eaglerforgeinjector_installation_flag__")) {
        backgroundLog("Detected input containing EFI installation flag.", true);
        return alert("this file already has EaglerForge injected in it, you nonce.\nif you're trying to update, you need a vanilla file.")
    }
    if (!string.includes("function nmc_Minecraft_startGame(")) {
        backgroundLog("Detected invalid input.\nPlease ensure file is unsigned, unminified and unobfuscated.", true);
        return alert("This file does not match the requirements for EaglerForgeInjector. (not unminified & unobfuscated). Check info.")
    }
    if (EFIConfig.doMinify) {
        if (!confirm("The minify step is extremely slow, especially on lower-end devices, and can take upwards of 15 minutes.") && !module) {
            return;
        }
        backgroundLog("[MINIFY] Minify warning bypassed.");
        if (globalThis.process) {
            await wait(1000);
        }
    }
    _status("Beginning patch process...");
    await wait(50);
    var patchedFile = string;
    patchedFile = patchedFile.replaceAll(
        `(function(root, module) {`,
        `${modapi_preinit}
(function(root, module) {`
    );
    patchedFile = patchedFile.replaceAll(
        `var main;(function(){`,
        `${modapi_preinit}
var main;(function(){`
    );

    _status("Patching threads and reflect metadata...");

    await wait(50);
    patchedFile = patchedFile
        .replace("\r", "")
        .replace(
            "var main;\n(function() {",
            modapi_preinit + "var main;\n(function() {"
        );
    backgroundLog("[JSPATCH] Adding pre-init script");
    patchedFile = patchedFile.replace(
        /function \$rt_metadata\(data\)( ?){/gm,
        `function $rt_metadata(data) {
            /*/EaglerForge Client Patch/*/
            ModAPI.hooks._rippedData.push(data);
            /*/EaglerForge Client Patch/*/`
    );
    backgroundLog("[JSPATCH] Redirecting $rt_metadata to ModAPI.hooks._rippedData");
    patchedFile = patchedFile.replaceAll(
        `return thread != null && thread.isResuming()`,
        (match) => {
            return freezeCallstack + match;
        }
    );
    backgroundLog("[JSPATCH] Freeze-callstack patch on TeaVMThread.isResuming()");
    patchedFile = patchedFile.replaceAll(
        `return thread != null && thread.isSuspending();`,
        (match) => {
            return freezeCallstack + match;
        }
    );
    backgroundLog("[JSPATCH] Freeze-callstack patch on TeaVMThread.isSuspending()");

    patchedFile = patchedFile.replaceAll(
        `return $rt_currentNativeThread;`,
        (match) => {
            return (
                `if(ModAPI.hooks.freezeCallstack){return {isResuming: ()=>{false}, isSuspending: ()=>{false}, push: (a)=>{}, pop: ()=>{console.warn("Frozen stack was popped, context is now unstable.")}}};` +
                match
            );
        }
    );
    backgroundLog("[JSPATCH] Freeze-callstack patch thread getter");

    patchedFile = patchedFile.replaceAll("function TeaVMThread(", "globalThis.ModAPI.hooks.TeaVMThread = TeaVMThread;\nfunction TeaVMThread(");

    _status("Getting clinit list...");
    var clinitList = [...patchedFile.matchAll(/^[\t ]*function \S+?_\S+?_\$callClinit\(/gm)].map(x => x[0].replaceAll("function ", "").replaceAll("(", "").trim());

    _status("Extracting constructors and methods...");
    await wait(50);

    const extractConstructorRegex =
        /^\s*function (\S*?)__init_\d*?\((?!\$)/gm;
    const extractConstructorFullNameRegex =
        /function (\S*?)__init_[0-9]*/gm;
    patchedFile = patchedFile.replaceAll(
        extractConstructorRegex,
        (match) => {
            var fullName = match.match(extractConstructorFullNameRegex);
            fullName = fullName[0].replace("function ", "");
            return (
                `ModAPI.hooks._rippedConstructors[\`${fullName}\`] = ${fullName};
` + match
            );
        }
    );

    backgroundLog("-> Extract contructor 1");

    const extractInternalConstructorRegex =
        /^\s*function (\S*?)__init_\d*?\(\$this/gm; //same as extract constructor regex, but only allow $this as first argument
    patchedFile = patchedFile.replaceAll(
        extractInternalConstructorRegex,
        (match) => {
            var fullName = match.match(extractConstructorFullNameRegex);
            fullName = fullName[0].replace("function ", "");
            return (
                `ModAPI.hooks._rippedInternalConstructors[\`${fullName}\`] = ${fullName};
` + match
            );
        }
    );

    backgroundLog("-> Extract contructor 2");

    const extractInstanceMethodRegex =
        /^[\t ]*function \S+?_\S+?_\S+?\((\$this)?/gm; // /^[\t ]*function \S+?_\S+?_\S+?\(\$this/gm
    const extractInstanceMethodFullNameRegex = /function (\S*?)\(/gm; // /function (\S*?)\(\$this/gm
    patchedFile = patchedFile.replaceAll(
        extractInstanceMethodRegex,
        (match) => {
            if (
                match.includes("__init_") ||
                match.includes("__clinit_") ||
                match.includes("_$callClinit")
            ) {
                return match;
            }
            var fullName = match.match(extractInstanceMethodFullNameRegex);
            fullName = fullName[0].replace("function ", "").replace("(", "");
            return (
                `function ${fullName}(...args) {
              return ModAPI.hooks.methods[\`${fullName}\`].apply(this, args);
          }
          ModAPI.hooks._rippedMethodTypeMap[\`${fullName}\`] = \`${match.endsWith("($this") ? "instance" : "static"
                }\`;
            ModAPI.hooks.methods[\`${fullName}\`]=` +
                match.replace(fullName + "(", "(")
            );
        }
    );

    backgroundLog("-> Extract instance methods");
    backgroundLog("-> Expose instance methods");

    var staticVariables = [
        ...patchedFile.matchAll(/var \S+?_\S+?_\S+? = /gm),
    ].flatMap((x) => {
        return x[0];
    }).filter(x => {
        return (!x.includes("$_clinit_$")) && (!x.includes("$lambda$"))
    });
    backgroundLog("-> Extract static variables");
    //Also stores classes from $rt_classWithoutFields(0)
    patchedFile = patchedFile.replaceAll(
        /var \S+?_\S+? = \$rt_classWithoutFields\(\S*?\);/gm,
        function (match) {
            var prefix = match.replaceAll(
                / = \$rt_classWithoutFields\(\S*?\);/gm,
                ""
            );
            var entries = [];

            staticVariables.forEach((entry) => {
                if (entry.startsWith(prefix)) {
                    var variableName = entry
                        .replace("var ", "")
                        .replace(" = ", "");
                    var segments = variableName.split("_");
                    segments.splice(0, 2);
                    var name = segments.join("_");
                    entries.push({
                        name: name,
                        variable: variableName,
                    });
                }
            });

            var proxy = entriesToStaticVariableProxy(entries, prefix, clinitList);
            var shortPrefix = prefix.replace(
                "var ",
                ""
            );
            return match + `ModAPI.hooks._rippedInterfaceMap[\`${shortPrefix}\`]=${shortPrefix};` + proxy;
        }
    );
    //Edge cases. sigh
    //Done: add support for static properties on classes with constructors like this: function nmcg_GuiMainMenu() {
    backgroundLog("-> Expose static variables");


    patchedFile = patchedFile.replaceAll(
        /function [a-z]+?_([a-zA-Z0-9\$]+?)\(\) \{/gm,
        (match) => {
            var prefix = "var " + match.replace("function ", "").replace("() {", "");
            var entries = [];

            staticVariables.forEach((entry) => {
                if (entry.startsWith(prefix)) {
                    var variableName = entry
                        .replace("var ", "")
                        .replace(" = ", "");
                    var segments = variableName.split("_");
                    segments.splice(0, 2);
                    var name = segments.join("_");
                    entries.push({
                        name: name,
                        variable: variableName,
                    });
                }
            });

            var proxy = entriesToStaticVariableProxy(entries, prefix, clinitList);

            return proxy + "\n" + match;
        }
    );
    _status("Extracting teavm internals...");
    await wait(50);
    patchedFile = patchedFile.replaceAll(
        /function \$rt_\S+?\(/gm,
        (match) => {
            var name = match.replace("function ", "");
            name = name.substring(0, name.length - 1);
            return (
                `ModAPI.hooks._teavm[\`${name}\`]=${name};
    ` + match
            );
        }
    );

    _status("Applying bonus patches from patch registry...");
    await wait(50);
    patchedFile = assets.PatchesRegistry.patchFile(patchedFile);

    if (EFIConfig.doMinify) {
        _status("Shrinking file...");
        await wait(50);
        if (globalThis.process) {
            let _minify = assets.minify;
            patchedFile = await _minify(patchedFile, parser, EFIConfig);
        } else {
            patchedFile = await minify(patchedFile, parser, EFIConfig);
        }
    }


    _status("Injecting scripts...");
    await wait(50);
    // 1.12 check is using nleit_MainClass, because peyton felt like renaming stuff. annoying, but useful too ig
    patchedFile = patchedFile.replace(
        ` id="game_frame">`,
        ` id="game_frame">
    \<script id="modapi_patchesreg_events"\>${assets.PatchesRegistry.getEventInjectorCode()};\<\/script\>
    \<script id="modapi_postinit"\>${assets.modapi_postinit.replace("__modapi_version_code__", EFIConfig.ModAPIVersion)}\<\/script\>
    \<script id="modapi_modloader"\>${assets.modapi_modloader}\<\/script\>
    \<script id="modapi_guikit"\>${assets.modapi_guikit}\<\/script\>
    \<script id="modapi_postinit_data"\>globalThis.modapi_postinit = \`${assets.modapi_postinit.replaceAll("\\", "\\\\")}\`\<\/script\>
    \<script id="libserverside"\>{"._|_libserverside_|_."}\<\/script\>
    \<script id="__eaglerforgeinjector_installation_flag__"\>console.log("Thank you for using EaglerForge!");\<\/script\>`
    );
    backgroundLog("[HTML] Injecting script files");
    patchedFile = patchedFile.replace(`<title>EaglercraftX`, `<title>EFI ${EFIConfig.ModAPIVersion} on`);
    patchedFile = patchedFile.replace(`<title>Eaglercraft`, `<title>EFI ${EFIConfig.ModAPIVersion} on`);

    backgroundLog("[HTML] Injecting title");
    patchedFile = patchedFile.replaceAll(/main\(\);\s*?}/gm, (match) => {
        return match.replace("main();", "main();ModAPI.hooks._postInit();");
    });
    backgroundLog("[HTML] Injecting main function");

    _status("Done, awaiting input...");
    await wait(50);
    return patchedFile;
}
async function patchClient(string, parser) {
    var patchedFile = string;
    if (EFIConfig.doEaglerforge) {
        patchedFile = await processClasses(patchedFile, parser);
    } else if (EFIConfig.doMinify) {
        patchedFile = await minify(patchedFile, parser, EFIConfig);
    }

    if (!patchedFile) {
        return;
    }

    if (EFIConfig.doServerExtras) {
        patchedFile = patchedFile.replace(`{"._|_libserverside_|_."}`, `(${assets.EFServer.toString()})()`);
        backgroundLog("[EFSERVER] Injecting libserverside corelib");
        patchedFile = patchedFile.replace("<title>EFI", "<title>EF Server");
        backgroundLog("[EFSERVER] Patching title");
    } else {
        patchedFile.replace(`{"._|_libserverside_|_."}`, "");
    }
    return patchedFile;
}

if (globalThis.process) {
    module.exports = {
        patchClient: patchClient,
        conf: EFIConfig
    }
}
