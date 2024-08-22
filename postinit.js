(() => {
    //EaglerForge post initialization code.
    ModAPI.hooks._classMap = {};
    globalThis.PluginAPI ||= ModAPI;
    ModAPI.mcinstance ||= {};
    ModAPI.javaClient ||= {};
    ModAPI.version = "v2.0";
    ModAPI.flavour = "injector";
    ModAPI.credits = ["ZXMushroom63", "radmanplays", "OtterCodes101", "TheIdiotPlays"];
    ModAPI.hooks._rippedConstructorKeys = Object.keys(ModAPI.hooks._rippedConstructors);
    ModAPI.hooks._rippedMethodKeys = Object.keys(ModAPI.hooks._rippedMethodTypeMap);
    ModAPI.hooks._rippedData.forEach(block => {
        block.forEach(item => {
            if (typeof item === "function") {
                var compiledName = item.name;
                if (!item.$meta || typeof item.$meta.name !== "string") {
                    return;
                }
                var classId = item.$meta.name;
                if (!ModAPI.hooks._classMap[classId]) {
                    ModAPI.hooks._classMap[classId] = {
                        "name": classId.split(".")[classId.split(".").length - 1],
                        "id": classId,
                        "binaryName": item.$meta.binaryName,
                        "constructors": [],
                        "methods": {},
                        "staticMethods": {},
                        "class": item,
                        "compiledName": compiledName
                    }
                }
                if (typeof item.$meta.superclass === "function" && item.$meta.superclass.$meta) {
                    ModAPI.hooks._classMap[classId].superclass = item.$meta.superclass.$meta.name;
                }
                if (item["$$constructor$$"]) {
                    //Class does not have any hand written constructors
                    //Eg: class MyClass {}
                    ModAPI.hooks._classMap[classId].constructors.push(item["$$constructor$$"]);
                } else {
                    //Class has hand written constructors, we need to search in the stash
                    ModAPI.hooks._rippedConstructorKeys.forEach(constructor => {
                        if (constructor.startsWith(compiledName + "__init_") && !constructor.includes("$lambda$")) {
                            ModAPI.hooks._classMap[classId].constructors.push(ModAPI.hooks._rippedConstructors[constructor]);
                        }
                    });
                }
                ModAPI.hooks._rippedMethodKeys.forEach((method) => {
                    if (method.startsWith(compiledName + "_") && !method.includes("$lambda$")) {
                        var targetMethodMap = ModAPI.hooks._classMap[classId].methods;
                        if (ModAPI.hooks._rippedMethodTypeMap[method] === "static") {
                            targetMethodMap = ModAPI.hooks._classMap[classId].staticMethods;
                        }
                        targetMethodMap[method] = {
                            method: ModAPI.hooks.methods[method],
                            proxiedMethod: function (...args) {
                                return ModAPI.hooks.methods[method].apply(this, args);
                            },
                            methodName: method
                        };
                    }
                });
            }
        });
    });
    var reloadDeprecationWarnings = 0;
    const TeaVM_to_BaseData_ProxyConf = {
        get(target, prop, receiver) {
            if (prop === "reload") {
                return function () {
                    if (reloadDeprecationWarnings < 10) {
                        console.warn("ModAPI/PluginAPI reload() is obsolete, please stop using it in code.")
                        reloadDeprecationWarnings++;
                    }
                }
            }

            var outProp = "$" + prop;
            console.log(outProp);
            return Reflect.get(target, outProp, receiver);
        },
        set(object, prop, value) {
            var outProp = "$" + prop;
            object[outProp] = value;
            return true;
        },
    };
    const TeaVM_to_Recursive_BaseData_ProxyConf = {
        get(target, prop, receiver) {
            if (prop === "reload") {
                return function () {
                    if (reloadDeprecationWarnings < 10) {
                        console.warn("ModAPI/PluginAPI reload() is obsolete, please stop using it in code.")
                        reloadDeprecationWarnings++;
                    }
                }
            }

            var outProp = "$" + prop;
            var outputValue = Reflect.get(target, outProp, receiver);
            if (outputValue && typeof outputValue === "object") {
                return new Proxy(outputValue, TeaVM_to_Recursive_BaseData_ProxyConf);
            }
            return outputValue;
        },
        set(object, prop, value) {
            var outProp = "$" + prop;
            object[outProp] = value;
            return true;
        },
    };
    ModAPI.required = new Set();
    ModAPI.events = {};
    ModAPI.events.types = ["event"];
    ModAPI.events.listeners = { "event": [] };
    ModAPI.addEventListener = function addEventListener(name, callback) {
        if (!callback) {
            throw new Error("Invalid callback!");
        }
        if (ModAPI.events.types.includes(name)) {
            if (!Array.isArray(ModAPI.events.listeners[name])) {
                ModAPI.events.listeners[name] = [];
            }
            ModAPI.events.listeners[name].push(callback);
            console.log("Added new event listener.");
        } else {
            throw new Error("This event does not exist!");
        }
    };

    ModAPI.removeEventListener = function removeEventListener(name, func, slow) {
        if (!func) {
            throw new Error("Invalid callback!");
        }
        if (!Array.isArray(ModAPI.events.listeners[name])) {
            ModAPI.events.listeners[name] = [];
        }
        var targetArr = ModAPI.events.listeners[name];
        if (!slow) {
            if (targetArr.indexOf(func) !== -1) {
                targetArr.splice(targetArr.indexOf(func), 1);
                console.log("Removed event listener.");
            }
        } else {
            var functionString = func.toString();
            targetArr.forEach((f, i) => {
                if (f.toString() === functionString) {
                    targetArr.splice(i, 1);
                    console.log("Removed event listener.");
                }
            });
        }
    };
    ModAPI.events.newEvent = function newEvent(name) {
        ModAPI.events.types.push(name);
    };

    ModAPI.events.callEvent = function callEvent(name, data) {
        if (
            !ModAPI.events.types.includes(name) ||
            !Array.isArray(ModAPI.events.listeners[name])
        ) {
            if (!Array.isArray(ModAPI.events.listeners[name])) {
                if (ModAPI.events.types.includes(name)) {
                    ModAPI.events.listeners.event.forEach((func) => {
                        func({ event: name, data: data });
                    });
                    return;
                }
                return;
            }
            console.error(
                "ModAPI/PluginAPI has been called with an invalid event name: " + name
            );
            console.error("Please report this bug to the repo.");
            return;
        }
        ModAPI.events.listeners[name].forEach((func) => {
            func(data);
        });
        ModAPI.events.listeners.event.forEach((func) => {
            func({ event: name, data: data });
        });
    };
    ModAPI.events.newEvent("update");
    ModAPI.util ||= {};
    ModAPI.util.TeaVM_to_BaseData_ProxyConf = TeaVM_to_BaseData_ProxyConf;
    ModAPI.util.getMethodFromPackage = function (classId, methodName) {
        var name = "";
        var classStuff = classId.split(".");
        classStuff.forEach((component, i) => {
            if (i === classStuff.length - 1) {
                name += "_" + component;
            } else {
                name += component[0].toLowerCase();
            }
        });
        name += "_" + methodName;
        return name;
    }
    ModAPI.require = function (module) {
        ModAPI.required.add(module);
    };
    ModAPI.onUpdate = function () {
        if (ModAPI.required.has("player") && ModAPI.javaClient && ModAPI.javaClient.$thePlayer) {
            ModAPI.player = new Proxy(ModAPI.javaClient.$thePlayer, TeaVM_to_Recursive_BaseData_ProxyConf);
        }
        if (ModAPI.required.has("network") && ModAPI.javaClient && ModAPI.javaClient.$thePlayer && ModAPI.javaClient.$thePlayer.$sendQueue) {
            ModAPI.network = new Proxy(ModAPI.javaClient.$thePlayer.$sendQueue, TeaVM_to_Recursive_BaseData_ProxyConf);
        }
        try {
            ModAPI.events.callEvent("update");
        } catch (error) {
            console.error(error);
        }
    }
    const updateMethodName = ModAPI.util.getMethodFromPackage("net.minecraft.client.entity.EntityPlayerSP", "onUpdate");
    const originalUpdate = ModAPI.hooks.methods[updateMethodName];
    ModAPI.hooks.methods[updateMethodName] = function (...args) {
        ModAPI.onUpdate();
        return originalUpdate.apply(this, args);
    };

    const initMethodName = ModAPI.util.getMethodFromPackage("net.minecraft.client.Minecraft", "startGame");
    const originalInit = ModAPI.hooks.methods[initMethodName];
    ModAPI.hooks.methods[initMethodName] = function (...args) {
        var x = originalInit.apply(this, args);
        //args[0] means $this (ie: minecraft instance).
        ModAPI.mcinstance = ModAPI.javaClient = args[0];
        ModAPI.settings = new Proxy(ModAPI.mcinstance.$gameSettings, TeaVM_to_Recursive_BaseData_ProxyConf);
        return x;
    };
})();