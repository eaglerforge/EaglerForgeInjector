(function Waypoints() {
    ModAPI.meta.title("Waypoints Mod");
    ModAPI.meta.description("Use /setwp <name> to make a waypoint, and /wp <name> to go to it. /remwp <name> to delete a waypoint. /listwp to list all waypoints.");
    ModAPI.meta.credits("By blizz828, Block_2222 & ZXMushroom63");

    ModAPI.dedicatedServer.appendCode(async ()=>{ //The mods should probably be running on the server
        function initDB(dbName, storeName) {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(dbName, 2);
        
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains(storeName)) {
                        db.createObjectStore(storeName);
                    }
                    resolve(db);
                };
        
                request.onsuccess = (event) => {
                    const db = event.target.result;
                    resolve(db);
                };
        
                request.onerror = (event) => {
                    reject('Error opening database: ' + event.target.errorCode);
                };
            });
        }        
        function storeString(dbName, storeName, key, value) {
            return initDB(dbName, storeName).then((db) => {
                return new Promise((resolve, reject) => {
                    const transaction = db.transaction(storeName, 'readwrite');
                    const store = transaction.objectStore(storeName);
                    const putRequest = store.put(value, key);
        
                    putRequest.onsuccess = () => {
                        resolve('String stored successfully.');
                    };
        
                    putRequest.onerror = (event) => {
                        reject('Error storing string: ' + event.target.errorCode);
                    };
                });
            });
        }        
        function retrieveString(dbName, storeName, key) {
            return initDB(dbName, storeName).then((db) => {
                return new Promise((resolve, reject) => {
                    const transaction = db.transaction(storeName, 'readonly');
                    const store = transaction.objectStore(storeName);
                    const getRequest = store.get(key);
        
                    getRequest.onsuccess = () => {
                        if (getRequest.result !== undefined) {
                            resolve(getRequest.result);
                        } else {
                            resolve('');
                        }
                    };
        
                    getRequest.onerror = (event) => {
                        resolve('');
                    };
                });
            });
        }        
        

        var data = {};
        try {
            data = JSON.parse(await retrieveString("waypoints_db", "waypoints", "waypoints"));
        } catch(e) {
            //didn't ask
        }

        async function saveData() {
            await storeString("waypoints_db", "waypoints", "waypoints", JSON.stringify(data));
        }
        

        ModAPI.addEventListener("processcommand", (e)=>{
            if (!ModAPI.reflect.getClassById("net.minecraft.entity.player.EntityPlayerMP").instanceOf(e.sender.getRef())) {
                return;
            }

            if (e.command.toLowerCase().startsWith("/setwp ") && e.sender.canCommandSenderUseCommand(2, ModAPI.util.str("setwp"))) {
                e.preventDefault = true;
                var pos = e.sender.getPosition();
                var name = ModAPI.util.unstring(e.sender.getName().getRef());
                var waypointId = e.command.split(" ")[1] || "waypoint";
                waypointId = waypointId.replace(/[^a-zA-Z0-9_]/gm, "_");
                if (!data[name]) {
                    data[name] = {};
                }
                data[name][waypointId] = [pos.x,pos.y,pos.z,e.sender.dimension];
                saveData();
                e.sender.addChatMessage(ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](ModAPI.util.str("Set waypoint "+waypointId+".")));
            }
            if (e.command.toLowerCase().startsWith("/wp ") && e.sender.canCommandSenderUseCommand(2, ModAPI.util.str("wp"))) {
                e.preventDefault = true;
                var name = ModAPI.util.unstring(e.sender.getName().getRef());
                var waypointId = e.command.split(" ")[1];
                if (waypointId && Array.isArray(data?.[name]?.[waypointId])) {

                    // Wildly important! regular setPosition triggers minecraft's built in anti-cheat and teleports you back in the same tick.
                    if (data?.[name]?.[waypointId]?.[3] && (data?.[name]?.[waypointId]?.[3] !== e.sender.dimension)) {
                        e.sender.travelToDimension(data?.[name]?.[waypointId]?.[3]);
                    }
                    
                    e.sender.setPositionAndUpdate(...data?.[name]?.[waypointId]);

                    e.sender.addChatMessage(ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](ModAPI.util.str("Teleported to waypoint " + waypointId + ".")));
                } else {
                    e.sender.addChatMessage(ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](ModAPI.util.str("No such waypoint.")));
                }
            }
            if (e.command.toLowerCase().startsWith("/remwp ") && e.sender.canCommandSenderUseCommand(2, ModAPI.util.str("remwp"))) {
                e.preventDefault = true;
                var name = ModAPI.util.unstring(e.sender.getName().getRef());
                var waypointId = e.command.split(" ")[1] || "waypoint";
                if (!data[name]) {
                    data[name] = {};
                }
                delete data[name][waypointId];
                saveData();
                e.sender.addChatMessage(ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](ModAPI.util.str("Removed waypoint "+waypointId+".")));
            }
            if ((e.command.toLowerCase() === "/listwp") && e.sender.canCommandSenderUseCommand(2, ModAPI.util.str("listwp"))) {
                e.preventDefault = true;
                var name = ModAPI.util.unstring(e.sender.getName().getRef());
                if (!data[name]) {
                    data[name] = {};
                }
                e.sender.addChatMessage(ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](ModAPI.util.str("Your waypoints: " + Object.keys(data[name]).join(", "))));
            }
        });
    });
})();