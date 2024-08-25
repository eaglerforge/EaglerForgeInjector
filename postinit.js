(() => {
    //EaglerForge post initialization code.
    //This script cannot contain backticks, escape characters, or backslashes in order to inject into the dedicated server code.
    ModAPI.hooks._classMap = {};
    globalThis.PluginAPI ||= ModAPI;
    ModAPI.mcinstance ||= {};
    ModAPI.javaClient ||= {};
    ModAPI.dedicatedServer ||= {};
    ModAPI.dedicatedServer._data ||= [];
    ModAPI.dedicatedServer.appendCode = function (code) {
        ModAPI.dedicatedServer._data.push(code);
    }
    ModAPI.util ||= {};
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
    ModAPI.util.getCompiledNameFromPackage = function (classId) {
        var name = "";
        var classStuff = classId.split(".");
        classStuff.forEach((component, i) => {
            if (i === classStuff.length - 1) {
                name += "_" + component;
            } else {
                name += component[0].toLowerCase();
            }
        });
        return name;
    }
    ModAPI.version = "v2.0";
    ModAPI.flavour = "injector";
    ModAPI.credits = ["ZXMushroom63", "radmanplays", "OtterCodes101", "TheIdiotPlays"];
    ModAPI.hooks.regenerateClassMap = function () {
        ModAPI.hooks._rippedConstructorKeys = Object.keys(ModAPI.hooks._rippedConstructors);
        ModAPI.hooks._rippedMethodKeys = Object.keys(ModAPI.hooks._rippedMethodTypeMap);
        ModAPI.hooks._rippedData.forEach(block => {
            block.forEach(item => {
                if (typeof item === "function") {
                    if (!item.$meta || typeof item.$meta.name !== "string") {
                        return;
                    }

                    var classId = item.$meta.name;
                    var compiledName = ModAPI.util.getCompiledNameFromPackage(classId);


                    if (!ModAPI.hooks._classMap[classId]) {
                        ModAPI.hooks._classMap[classId] = {
                            "name": classId.split(".")[classId.split(".").length - 1],
                            "id": classId,
                            "binaryName": item.$meta.binaryName,
                            "constructors": [],
                            "methods": {},
                            "staticMethods": {},
                            "staticVariables": {},
                            "staticVariableNames": [],
                            "class": item,
                            "compiledName": compiledName
                        }
                    }
                    if (typeof item.$meta.superclass === "function" && item.$meta.superclass.$meta) {
                        ModAPI.hooks._classMap[classId].superclass = item.$meta.superclass.$meta.name;
                    }
                    ModAPI.hooks._classMap[classId].staticVariableNames = ModAPI.hooks._rippedStaticIndexer[compiledName];
                    ModAPI.hooks._classMap[classId].staticVariables = ModAPI.hooks._rippedStaticProperties[compiledName];
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
                            targetMethodMap[method.replace(compiledName + "_", "")] = {
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
    }
    ModAPI.hooks.regenerateClassMap();
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
            var outputValue = Reflect.get(target, outProp, receiver);
            if (outputValue && typeof outputValue === "object" && Array.isArray(outputValue.data) && typeof outputValue.type === "function") {
                return outputValue.data;
            }
            if (outputValue && typeof outputValue === "function") {
                return function (...args) {
                    return outputValue.apply(target, args);
                }
            }
            return outputValue;
        },
        set(object, prop, value) {
            var outProp = "$" + prop;
            object[outProp] = value;
            return true;
        },
    };
    const TeaVMArray_To_Recursive_BaseData_ProxyConf = {
        get(target, prop, receiver) {
            var outputValue = Reflect.get(target, prop, receiver);
            if (outputValue && typeof outputValue === "object" && !Array.isArray(outputValue)) {
                return new Proxy(outputValue, TeaVM_to_Recursive_BaseData_ProxyConf);
            }
            return outputValue;
        },
        set(object, prop, value) {
            object[prop] = value;
            return true;
        }
    }
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
            if (outputValue && typeof outputValue === "object" && Array.isArray(outputValue.data) && typeof outputValue.type === "function") {
                return new Proxy(outputValue.data, TeaVMArray_To_Recursive_BaseData_ProxyConf);
            }
            if (outputValue && typeof outputValue === "object" && !Array.isArray(outputValue)) {
                return new Proxy(outputValue, TeaVM_to_Recursive_BaseData_ProxyConf);
            }
            if (outputValue && typeof outputValue === "function") {
                return function (...args) {
                    return outputValue.apply(target, args);
                }
            }
            return outputValue;
        },
        set(object, prop, value) {
            var outProp = "$" + prop;
            object[outProp] = value;
            return true;
        },
    };
    ModAPI.util.TeaVM_to_BaseData_ProxyConf = TeaVM_to_BaseData_ProxyConf;
    ModAPI.util.TeaVMArray_To_Recursive_BaseData_ProxyConf = TeaVMArray_To_Recursive_BaseData_ProxyConf;
    ModAPI.util.TeaVM_to_Recursive_BaseData_ProxyConf = TeaVM_to_Recursive_BaseData_ProxyConf;
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

    ModAPI.util.stringToUint16Array = function stringToUint16Array(str) {
        const buffer = new ArrayBuffer(str.length * 2); // 2 bytes for each char
        const uint16Array = new Uint16Array(buffer);
        for (let i = 0; i < str.length; i++) {
            uint16Array[i] = str.charCodeAt(i);
        }
        return uint16Array;
    }

    var stringDefaultConstructor = ModAPI.hooks._classMap["java.lang.String"].constructors.filter(x => { return x.length === 0 })[0];
    ModAPI.util.string = ModAPI.util.str = function (string) {
        var jclString = stringDefaultConstructor();
        jclString.$characters.data = ModAPI.util.stringToUint16Array(string);
        return jclString;
    }

    ModAPI.util.setStringContent = function (jclString) {
        jclString.$characters.data = ModAPI.util.stringToUint16Array(string);
    }

    ModAPI.util.jclStrToJsStr = function (jclString) {
        var uint16Array = jclString.$characters.data;
        let str = '';
        for (let i = 0; i < uint16Array.length; i++) {
            str += String.fromCharCode(uint16Array[i]);
        }
        return str;
    }

    ModAPI.displayToChat = function (param) {
        var v = typeof param === "object" ? param.msg : (param + "");
        v ||= "";
        var jclString = ModAPI.util.string(v);
        ModAPI.hooks.methods["nmcg_GuiNewChat_printChatMessage"](ModAPI.javaClient.$ingameGUI.$persistantChatGUI, ModAPI.hooks._classMap["net.minecraft.util.ChatComponentText"].constructors[0](jclString));
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

    var integratedServerStartup = ModAPI.util.getMethodFromPackage("net.lax1dude.eaglercraft.v1_8.sp.internal.ClientPlatformSingleplayer", "loadIntegratedServerSourceInline");
    //Integrated server setup has a randomised suffix on the end
    integratedServerStartup = ModAPI.hooks._rippedMethodKeys.filter(key => { return key.startsWith(integratedServerStartup); })[0];
    const integratedServerStartupMethod = ModAPI.hooks.methods[integratedServerStartup];
    ModAPI.hooks.methods[integratedServerStartup] = function (worker, bootstrap) {
        var x = integratedServerStartupMethod.apply(this, [worker, bootstrap + ";" + globalThis.modapi_postinit + ";" + ModAPI.dedicatedServer._data.join(";")]);
        return x;
    };

    ModAPI.events.newEvent("sendchatmessage");
    const sendChatMessageMethodName = ModAPI.util.getMethodFromPackage("net.minecraft.client.entity.EntityPlayerSP", "sendChatMessage");
    const sendChatMessage = ModAPI.hooks.methods[sendChatMessageMethodName];
    ModAPI.hooks.methods[sendChatMessageMethodName] = function ($this, $message) {
        var data = {
            preventDefault: false,
            message: ModAPI.util.jclStrToJsStr($message)
        }
        ModAPI.events.callEvent("sendchatmessage", data);
        if (data.preventDefault) {
            return;
        }
        return sendChatMessage.apply(this, [$this, ModAPI.util.str(data.message) || $message]);
    }
})();