globalThis.ModAPIVersion = "v2.7";
globalThis.doEaglerforge = true;
document.querySelector("title").innerText = `EaglerForge Injector ${ModAPIVersion}`;
document.querySelector("h1").innerText = `EaglerForge Injector ${ModAPIVersion}`;
function wait(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(() => { resolve(); }, ms);
    });
}
function _status(x) {
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
async function processClasses(string) {
    if (globalThis.doShronk) {
        if (!confirm("The minify step is extremely slow, especially on lower-end devices, and can take upwards of 15 minutes.")) {
            return;
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
    patchedFile = patchedFile.replace(
        /function \$rt_metadata\(data\)( ?){/gm,
        `function $rt_metadata(data) {
            /*/EaglerForge Client Patch/*/
            ModAPI.hooks._rippedData.push(data);
            /*/EaglerForge Client Patch/*/`
    );

    patchedFile = patchedFile.replaceAll(
        `return thread != null && thread.isResuming()`,
        (match) => {
            return freezeCallstack + match;
        }
    );

    patchedFile = patchedFile.replaceAll(
        `return thread != null && thread.isSuspending();`,
        (match) => {
            return freezeCallstack + match;
        }
    );

    patchedFile = patchedFile.replaceAll(
        `return $rt_currentNativeThread;`,
        (match) => {
            return (
                `if(ModAPI.hooks.freezeCallstack){return {isResuming: ()=>{false}, isSuspending: ()=>{false}, push: (a)=>{}, pop: ()=>{console.warn("Frozen stack was popped, context is now unstable.")}}};` +
                match
            );
        }
    );

    patchedFile = patchedFile.replaceAll("function TeaVMThread(", "globalThis.ModAPI.hooks.TeaVMThread = TeaVMThread;\nfunction TeaVMThread(");

    _status("Getting clinit list...");
    var clinitList = [...patchedFile.matchAll(/^[\t ]*function \S+?_\S+?_\$callClinit\(/gm)].map(x => x[0].replaceAll("function ", "").replaceAll("(", "").trim());
    console.log(clinitList);

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
    var staticVariables = [
        ...patchedFile.matchAll(/var \S+?_\S+?_\S+? = /gm),
    ].flatMap((x) => {
        return x[0];
    }).filter(x => {
        return (!x.includes("$_clinit_$")) && (!x.includes("$lambda$"))
    });
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
    patchedFile = PatchesRegistry.patchFile(patchedFile);

    if (globalThis.doShronk) {
        _status("Shrinking file...");
        await wait(50);

        patchedFile = await shronk(patchedFile);
    }


    _status("Injecting scripts...");
    await wait(50);
    patchedFile = patchedFile.replace(
        ` id="game_frame">`,
        ` id="game_frame">
    \<script id="modapi_patchesreg_events"\>${PatchesRegistry.getEventInjectorCode()};\<\/script\>
    \<script id="modapi_postinit"\>${globalThis.modapi_postinit.replace("__modapi_version_code__", ModAPIVersion)}\<\/script\>
    \<script id="modapi_modloader"\>${globalThis.modapi_modloader}\<\/script\>
    \<script id="modapi_guikit"\>${globalThis.modapi_guikit}\<\/script\>
    \<script id="modapi_postinit_data"\>globalThis.modapi_postinit = \`${globalThis.modapi_postinit.replaceAll("\\", "\\\\")}\`\<\/script\>
    \<script id="libserverside"\>{"._|_libserverside_|_."}\<\/script\>
    \<script id="__eaglerforgeinjector_installation_flag__"\>console.log("Thank you for using EaglerForge!");\<\/script\>`
    );
    patchedFile = patchedFile.replace(`<title>EaglercraftX 1.8</title>`, `<title>EFI ${globalThis.ModAPIVersion}</title>`);
    patchedFile = patchedFile.replaceAll(/main\(\);\s*?}/gm, (match) => {
        return match.replace("main();", "main();ModAPI.hooks._postInit();");
    });

    _status("Done, awaiting input...");
    await wait(50);
    return patchedFile;
}

document.querySelector("#giveme").addEventListener("click", () => {
    if (
        !document.querySelector("input").files ||
        !document.querySelector("input").files[0]
    ) {
        return;
    }
    // @type File
    var file = document.querySelector("input").files[0];
    var fileType = file.name.split(".");
    fileType = fileType[fileType.length - 1];

    file.text().then(async (string) => {
        var patchedFile = string;

        if (globalThis.doEaglerforge) {
            if (string.includes("__eaglerforgeinjector_installation_flag__")) {
                return alert("this file already has eaglerforge injected in it, you nonce.\nif you're trying to update, you need a vanilla file.");
            }
            patchedFile = await processClasses(patchedFile);
        } else if (globalThis.doShronk) {
            patchedFile = await shronk(patchedFile);
        }

        patchedFile.replace(`{"._|_libserverside_|_."}`, "");
        var blob = new Blob([patchedFile], { type: file.type });
        saveAs(blob, "processed." + fileType);
    });
});

document.querySelector("#givemeserver").addEventListener("click", () => {
    if (
        !document.querySelector("input").files ||
        !document.querySelector("input").files[0]
    ) {
        return;
    }
    // @type File
    var file = document.querySelector("input").files[0];
    var fileType = file.name.split(".");
    fileType = fileType[fileType.length - 1];

    file.text().then(async (string) => {
        var patchedFile = string;

        if (globalThis.doEaglerforge) {
            patchedFile = await processClasses(patchedFile);
        } else if (globalThis.doShronk) {
            patchedFile = await shronk(patchedFile);
        }

        patchedFile.replace(`{"._|_libserverside_|_."}`, `(${EFServer.toString()})()`);
        var blob = new Blob([patchedFile], { type: file.type });
        saveAs(blob, "efserver." + fileType);
    });
});
