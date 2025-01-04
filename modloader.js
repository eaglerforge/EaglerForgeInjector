globalThis.modapi_modloader = "(" + (() => {
    globalThis.promisifyIDBRequest = function promisifyIDBRequest(request) {
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    globalThis.getDatabase = async function getDatabase() {
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

    globalThis.getMods = async function getMods() {
        const db = await getDatabase();
        const transaction = db.transaction(["filesystem"], "readonly");
        const objectStore = transaction.objectStore("filesystem");
        const object = await promisifyIDBRequest(objectStore.get("mods.txt"));
        var out = object ? (await object.text()).split("|").toSorted() : [];
        db.close();
        return out;
    }

    globalThis.getMod = async function getMod(mod) {
        const db = await getDatabase();
        const transaction = db.transaction(["filesystem"], "readonly");
        const objectStore = transaction.objectStore("filesystem");
        const object = await promisifyIDBRequest(objectStore.get("mods/" + mod));
        var out =  object ? (await object.text()) : "";
        db.close();
        return out;
    }

    globalThis.saveMods = async function saveMods(mods) {
        const db = await getDatabase();
        const transaction = db.transaction(["filesystem"], "readwrite");
        const objectStore = transaction.objectStore("filesystem");
        const encoder = new TextEncoder();
        const modsData = encoder.encode(mods.toSorted().join("|"));
        const modsBlob = new Blob([modsData], { type: "text/plain" });
        await promisifyIDBRequest(objectStore.put(modsBlob, "mods.txt"));
        db.close();
    }

    globalThis.addMod = async function addMod(mod) {
        const mods = await getMods();
        mods.push("web@" + mod);
        await saveMods(mods);
    }

    globalThis.addFileMod = async function addFileMod(mod, textContents) {
        const mods = await getMods();
        if (mods.includes(mod)) {
            await removeMod(mods.indexOf(mod));
        } else {
            mods.push(mod);
        }
        await saveMods(mods);

        const db = await getDatabase();
        const transaction = db.transaction(["filesystem"], "readwrite");
        const objectStore = transaction.objectStore("filesystem");
        const encoder = new TextEncoder();
        const modsData = encoder.encode(textContents);
        const modsBlob = new Blob([modsData], { type: "text/plain" });
        await promisifyIDBRequest(objectStore.put(modsBlob, "mods/" + mod));
        db.close();
    }

    globalThis.removeMod = async function removeMod(index) {
        const mods = await getMods();
        if (index >= 0 && index < mods.length) {
            var deleted = mods.splice(index, 1)[0];
            await saveMods(mods);
            if (!deleted.startsWith("web@")) {
                const db = await getDatabase();
                const transaction = db.transaction(["filesystem"], "readwrite");
                const objectStore = transaction.objectStore("filesystem");
                await promisifyIDBRequest(objectStore.delete("mods/" + deleted));
                db.close();
            }
        }
    }

    globalThis.resetMods = async function resetMods() {
        console.log("Resetting mods...");
        const db = await getDatabase();
        const transaction = db.transaction(["filesystem"], "readwrite");
        const objectStore = transaction.objectStore("filesystem");
        await promisifyIDBRequest(objectStore.clear());
        console.log("Mods reset");
        db.close();
    }

    globalThis.modLoader = async function modLoader(modsArr = []) {
        if (!window.eaglerMLoaderMainRun) {
            var searchParams = new URLSearchParams(location.search);
            searchParams.getAll("mod").forEach((modToAdd) => {
                console.log(
                    "[EaglerML] Adding mod to loadlist from search params: " + modToAdd
                );
                modsArr.push("web@" + modToAdd);
            });
            searchParams.getAll("plugin").forEach((modToAdd) => {
                console.log(
                    "[EaglerML] Adding mod to loadlist from search params: " + modToAdd
                );
                modsArr.push("web@" + modToAdd);
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
                    modsArr.push("web@" + modToAdd);
                });
            }

            console.log("[EaglerML] Searching in iDB");
            try {
                var idbMods = await getMods();
                modsArr = modsArr.concat(idbMods
                    .filter(x => { return x && x.length > 0 })
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
                script.setAttribute("data-hash", ModAPI.util.hashCode("web@" + currentMod));
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
        modsArr.sort();
        for (let i = 0; i < modsArr.length; i++) {
            let currentMod = modsArr[i];
            var isIDBMod = !currentMod.startsWith("web@");
            if (!isIDBMod) {
                currentMod = currentMod.replace("web@", "");
            }
            console.log("[EaglerML] Starting " + currentMod);
            try {
                var responseText = isIDBMod ? await getMod(currentMod) : await (await fetch(currentMod)).text();
                console.log("[EaglerML] Loading " + currentMod + " via method A.");
                var script = document.createElement("script");
                script.setAttribute("data-hash", ModAPI.util.hashCode((isIDBMod ? "" : "web@") + currentMod));
                try {
                    script.src =
                        "data:text/javascript," + encodeURIComponent(responseText);
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
            } catch (error) {
                methodB(currentMod);
            }
        }
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
}).toString() + ")();"