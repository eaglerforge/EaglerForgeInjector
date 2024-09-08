function promisifyIDBRequest(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getDatabase() {
    const dbRequest = indexedDB.open("EF_MODS");
    const db = await promisifyIDBRequest(dbRequest);

    if (!db.objectStoreNames.contains("filesystem")) {
        db.close();
        const version = db.version + 1;
        const upgradeRequest = indexedDB.open("EF_MODS", version);
        upgradeRequest.onupgradeneeded = (event) => {
            const upgradedDb = event.target.result;
            upgradedDb.createObjectStore("filesystem");
        };
        return promisifyIDBRequest(upgradeRequest);
    }

    return db;
}

async function getMods() {
    const db = await getDatabase();
    const transaction = db.transaction(["filesystem"], "readonly");
    const objectStore = transaction.objectStore("filesystem");
    const object = await promisifyIDBRequest(objectStore.get("mods.txt"));
    return object ? (await object.text()).split("|") : [];
}

async function saveMods(mods) {
    const db = await getDatabase();
    const transaction = db.transaction(["filesystem"], "readwrite");
    const objectStore = transaction.objectStore("filesystem");
    const encoder = new TextEncoder();
    const modsData = encoder.encode(mods.join("|"));
    const modsBlob = new Blob([modsData], { type: "text/plain" });
    await promisifyIDBRequest(objectStore.put(modsBlob, "mods.txt"));
}

async function addMod(mod) {
    const mods = await getMods();
    mods.push(mod);
    await saveMods(mods);
}

async function removeMod(index) {
    const mods = await getMods();
    if (index >= 0 && index < mods.length) {
        mods.splice(index, 1);
        await saveMods(mods);
    }
}

async function resetMods() {
    await saveMods([]);
    console.log("Mods reset");
}

window.modLoader = async function modLoader(modsArr = []) {
    if (!window.eaglerMLoaderMainRun) {
        var searchParams = new URLSearchParams(location.search);
        searchParams.getAll("mod").forEach((modToAdd) => {
            console.log(
                "[EaglerML] Adding mod to loadlist from search params: " + modToAdd
            );
            modsArr.push(modToAdd);
        });
        searchParams.getAll("plugin").forEach((modToAdd) => {
            console.log(
                "[EaglerML] Adding mod to loadlist from search params: " + modToAdd
            );
            modsArr.push(modToAdd);
        });
        if (
            !!eaglercraftXOpts &&
            !!eaglercraftXOpts.Mods &&
            Array.isArray(eaglercraftXOpts.Mods)
        ) {
            eaglercraftXOpts.Mods.forEach((modToAdd) => {
                console.log(
                    "[EaglerML] Adding mod to loadlist from eaglercraftXOpts: " +
                    modToAdd
                );
                modsArr.push(modToAdd);
            });
        }

        console.log("[EaglerML] Searching in iDB");
        try {
            var idbMods = await getMods();
            modsArr = modsArr.concat(idbMods
                .filter(x => { return x && x.length > 0 })
                .flatMap(x => { if (x.startsWith("web@")) { return x.replace("web@", "") } return x })
            );
        } catch (error) {
            console.error(error);
        }

        window.eaglerMLoaderMainRun = true;
    }
    if (window.noLoadMods === true) {
        modsArr.splice(0, modsArr.length);
    }
    function checkModsLoaded(totalLoaded, identifier) {
        console.log(
            "[EaglerML] Checking if mods are finished :: " +
            totalLoaded +
            "/" +
            modsArr.length
        );
        if (totalLoaded >= modsArr.length) {
            clearInterval(identifier);
            window.ModGracePeriod = false;
            if (
                window.eaglerMLoaderMainRun &&
                ModAPI &&
                ModAPI.events &&
                ModAPI.events.callEvent
            ) {
                ModAPI.events.callEvent("load", {});
            }
            console.log(
                "[EaglerML] Checking if mods are finished :: All mods loaded! Grace period off."
            );
        }
    }
    function methodB(currentMod) {
        try {
            console.log("[EaglerML] Loading " + currentMod + " via method B.");
            var script = document.createElement("script");
            script.setAttribute("data-hash", ModAPI.util.hashCode("web@"+currentMod));
            script.src = currentMod;
            script.setAttribute("data-isMod", "true");
            script.onerror = () => {
                console.log(
                    "[EaglerML] Failed to load " + currentMod + " via method B!"
                );
                script.remove();
                totalLoaded++;
            };
            script.onload = () => {
                console.log(
                    "[EaglerML] Successfully loaded " + currentMod + " via method B."
                );
                totalLoaded++;
            };
            document.body.appendChild(script);
        } catch (error) {
            console.log(
                "[EaglerML] Oh no! The mod " + currentMod + " failed to load!"
            );
            totalLoaded++;
        }
    }
    window.ModGracePeriod = true;
    var totalLoaded = 0;
    var loaderCheckInterval = null;
    modsArr.forEach((c) => {
        let currentMod = c;
        console.log("[EaglerML] Starting " + currentMod);
        try {
            var req = new XMLHttpRequest();
            req.open("GET", currentMod);
            req.onload = function xhrLoadHandler() {
                console.log("[EaglerML] Loading " + currentMod + " via method A.");
                var script = document.createElement("script");
                script.setAttribute("data-hash", ModAPI.util.hashCode("web@"+currentMod));
                try {
                    script.src =
                        "data:text/javascript," + encodeURIComponent(req.responseText);
                } catch (error) {
                    methodB(currentMod);
                    return;
                }
                script.setAttribute("data-isMod", "true");
                script.onerror = () => {
                    console.log(
                        "[EaglerML] Failed to load " + currentMod + " via method A!"
                    );
                    script.remove();
                    totalLoaded++;
                };
                script.onload = () => {
                    console.log(
                        "[EaglerML] Successfully loaded " + currentMod + " via method A."
                    );
                    totalLoaded++;
                };
                document.body.appendChild(script);
            };
            req.onerror = function xhrErrorHandler() {
                methodB(currentMod);
            };
            req.send();
        } catch (error) {
            methodB(currentMod);
        }
    });
    loaderCheckInterval = setInterval(() => {
        checkModsLoaded(totalLoaded, loaderCheckInterval);
    }, 500);
    console.log(
        "[EaglerML] Starting to load " + modsArr.length + " mods..."
    );
    window.returnTotalLoadedMods = function returnTotalLoadedMods() {
        return totalLoaded;
    };
};