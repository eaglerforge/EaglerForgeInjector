globalThis.modapi_postinit = "(" + (() => {
    //EaglerForge post initialization code.
    //This script cannot contain backticks, escape characters, or backslashes in order to inject into the dedicated server code.
    var startedModLoader = false;
    var BACKSLASH = String.fromCharCode(92);
    var STRIP_COMMENTS = new RegExp(atob("KChcL1wvLiokKXwoXC9cKltcc1xTXSo/XCpcLykp"), "gm");
    var ARGUMENT_NAMES = new RegExp(atob("KFteXHMsXSsp"), "g");


    function startModLoader() {
        if (!startedModLoader) {
            startedModLoader = true;
            modLoader([]);
        }
    }

    ModAPI.hooks._classMap = {};
    globalThis.PluginAPI ||= ModAPI;
    ModAPI.mcinstance ||= {};
    ModAPI.javaClient ||= {};
    ModAPI.meta = {};
    ModAPI.meta._titleMap = {};
    ModAPI.meta._descriptionMap = {};
    ModAPI.meta._developerMap = {};
    ModAPI.meta._iconMap = {};
    ModAPI.meta._versionMap = {};
    ModAPI.array = {};

    ModAPI.version = "__modapi_version_code__";
    ModAPI.flavour = "injector";
    ModAPI.GNU = "terry pratchett";
    ModAPI.credits = ["ZXMushroom63", "radmanplays", "Murturtle", "OtterCodes101", "TheIdiotPlays", "OeildeLynx31", "Stpv22"];

    function limitSize(x, n) {
        if (x.length > n) {
            return x.substring(0, n) + "…";
        } else {
            return x;
        }
    }
    function arraysAreSame(arr1, arr2) {
        if (!arr1 || !arr2)
            return false;
        if(arr1 === arr2)
            return true;
        if (arr1.length !== arr2.length)
            return false;

        for (var i = 0, l=arr1.length; i < l; i++) {
            if (arr1[i] instanceof Array && arr2[i] instanceof Array) {
                if (!arr1[i].equals(arr2[i]))
                    return false;       
            }
            else if (arr1[i] !== arr2[i]) {
                return false;   
            }           
        }       
        return true;
    }
    function getParamNames(func) {
        var fnStr = func.toString().replace(STRIP_COMMENTS, '');
        var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
        if (result === null)
            result = [];
        return result;
    }
    function getEaglerConfigFlag(key) {
        var searchParams = new URLSearchParams(location.search);
        return (globalThis.eaglercraftXOpts?.[key] || searchParams.get(key)) ? true : false
    }
    function easyStaticMethod(classId, methodName, autoUnpack) {
        var method = ModAPI.reflect.getClassById(classId).staticMethods[methodName].method;
        return function easyImpl(...args) {
            return method(...(autoUnpack ? args.map(x => {
                if ((typeof x === "object") && (x.isModProxy === true)) {
                    return x.getRef();
                }
                return x;
            }) : args))
        }
    }
    ModAPI.meta.title = function (title) {
        if (!document.currentScript || document.currentScript.getAttribute("data-isMod") !== "true") {
            return console.log("[ModAPIMeta] Cannot set meta for non-mod script.");
        }
        if (!document.currentScript.hasAttribute("data-hash")) {
            return console.log("[ModAPIMeta] Script does not have a hashcode.");
        }
        ModAPI.meta._titleMap[document.currentScript.getAttribute("data-hash")] = limitSize(title, 36);
    }
    ModAPI.meta.icon = function (iconSrc) {
        if (!document.currentScript || document.currentScript.getAttribute("data-isMod") !== "true") {
            return console.log("[ModAPIMeta] Cannot set meta for non-mod script.");
        }
        if (!document.currentScript.hasAttribute("data-hash")) {
            return console.log("[ModAPIMeta] Script does not have a hashcode.");
        }
        ModAPI.meta._iconMap[document.currentScript.getAttribute("data-hash")] = iconSrc;
    }
    ModAPI.meta.credits = function (cd) {
        if (!document.currentScript || document.currentScript.getAttribute("data-isMod") !== "true") {
            return console.log("[ModAPIMeta] Cannot set meta for non-mod script.");
        }
        if (!document.currentScript.hasAttribute("data-hash")) {
            return console.log("[ModAPIMeta] Script does not have a hashcode.");
        }
        ModAPI.meta._developerMap[document.currentScript.getAttribute("data-hash")] = limitSize(cd, 128);
    }
    ModAPI.meta.description = function (desc) {
        if (!document.currentScript || document.currentScript.getAttribute("data-isMod") !== "true") {
            return console.log("[ModAPIMeta] Cannot set meta for non-mod script.");
        }
        if (!document.currentScript.hasAttribute("data-hash")) {
            return console.log("[ModAPIMeta] Script does not have a hashcode.");
        }
        ModAPI.meta._descriptionMap[document.currentScript.getAttribute("data-hash")] = limitSize(desc, 160);
    }
    ModAPI.meta.version = function (ver) {
        if (!document.currentScript || document.currentScript.getAttribute("data-isMod") !== "true") {
            return console.log("[ModAPIMeta] Cannot set meta for non-mod script.");
        }
        if (!document.currentScript.hasAttribute("data-hash")) {
            return console.log("[ModAPIMeta] Script does not have a hashcode.");
        }
        ModAPI.meta._versionMap[document.currentScript.getAttribute("data-hash")] = limitSize(ver, 7);
    }
    ModAPI.reflect ||= {};
    ModAPI.server = ModAPI.serverInstance = null;
    ModAPI.dedicatedServer ||= {};
    ModAPI.dedicatedServer._data ||= [];
    ModAPI.dedicatedServer._wasUsed = false;
    ModAPI.dedicatedServer.appendCode = function (code) {
        if (ModAPI.dedicatedServer._wasUsed) {
            return console.warn("The dedicated server has already launched, ModAPI.dedicatedServer.appendCode() is useless.");
        }
        if (typeof code === "function") {
            ModAPI.dedicatedServer._data.push("(" + code.toString() + ")(true)");
        } else if (typeof code === "string") {
            ModAPI.dedicatedServer._data.push(code);
        }
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
    ModAPI.util.getCompiledNameFromPackage = ModAPI.util.getCompiledName = function (classId) {
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

    ModAPI.util.asClass = ModAPI.hooks._teavm.$rt_cls;

    ModAPI.util.wrap = function (outputValue, target, corrective, disableFunctions) {
        target ||= {};
        corrective ||= false;
        disableFunctions ||= false;
        const CorrectiveArray = patchProxyConfToCorrective(ModAPI.util.TeaVMArray_To_Recursive_BaseData_ProxyConf);
        const CorrectiveRecursive = patchProxyConfToCorrective(ModAPI.util.TeaVM_to_Recursive_BaseData_ProxyConf);
        if (outputValue && typeof outputValue === "object" && Array.isArray(outputValue.data) && typeof outputValue.type === "function") {
            if (corrective) {
                return new Proxy(outputValue.data, CorrectiveArray);
            }
            return new Proxy(outputValue.data, ModAPI.util.TeaVMArray_To_Recursive_BaseData_ProxyConf);
        }
        if (outputValue && typeof outputValue === "object" && !Array.isArray(outputValue)) {
            if (corrective) {
                return new Proxy(outputValue, CorrectiveRecursive);
            }
            return new Proxy(outputValue, ModAPI.util.TeaVM_to_Recursive_BaseData_ProxyConf);
        }
        if (!disableFunctions && outputValue && typeof outputValue === "function" && target) {
            return function (...args) {
                var xOut = outputValue.apply(target, args);
                if (xOut && typeof xOut === "object" && Array.isArray(xOut.data) && typeof xOut.type === "function") {
                    if (corrective) {
                        return new Proxy(xOut.data, CorrectiveArray);
                    }
                    return new Proxy(xOut.data, ModAPI.util.TeaVMArray_To_Recursive_BaseData_ProxyConf);
                }
                if (xOut && typeof xOut === "object" && !Array.isArray(xOut)) {
                    if (corrective) {
                        return new Proxy(xOut, CorrectiveRecursive);
                    }
                    return new Proxy(xOut, ModAPI.util.TeaVM_to_Recursive_BaseData_ProxyConf);
                }
                return xOut;
            }
        }
        return null;
    }
    ModAPI.array.object = function (jclass, size) {
        if (Array.isArray(size)) {
            return ModAPI.hooks._teavm.$rt_createArrayFromData(jclass, size);
        }
        return ModAPI.hooks._teavm.$rt_createArray(jclass, size);
    }
    ModAPI.array.boolean = function (size) {
        if (Array.isArray(size)) {
            return ModAPI.hooks._teavm.$rt_createBooleanArrayFromData(size);
        }
        return ModAPI.hooks._teavm.$rt_createBooleanArray(size);
    }
    ModAPI.array.byte = function (size) {
        if (Array.isArray(size)) {
            return ModAPI.hooks._teavm.$rt_createByteArrayFromData(size);
        }
        return ModAPI.hooks._teavm.$rt_createByteArray(size);
    }
    ModAPI.array.char = function (size) {
        if (Array.isArray(size)) {
            return ModAPI.hooks._teavm.$rt_createCharArrayFromData(size);
        }
        return ModAPI.hooks._teavm.$rt_createCharArray(size);
    }
    ModAPI.array.short = function (size) {
        if (Array.isArray(size)) {
            return ModAPI.hooks._teavm.$rt_createShortArrayFromData(size);
        }
        return ModAPI.hooks._teavm.$rt_createShortArray(size);
    }
    ModAPI.array.int = function (size) {
        if (Array.isArray(size)) {
            return ModAPI.hooks._teavm.$rt_createIntArrayFromData(size);
        }
        return ModAPI.hooks._teavm.$rt_createIntArray(size);
    }
    ModAPI.array.float = function (size) {
        if (Array.isArray(size)) {
            return ModAPI.hooks._teavm.$rt_createFloatArrayFromData(size);
        }
        return ModAPI.hooks._teavm.$rt_createFloatArray(size);
    }
    ModAPI.array.double = function (size) {
        if (Array.isArray(size)) {
            return ModAPI.hooks._teavm.$rt_createDoubleArrayFromData(size);
        }
        return ModAPI.hooks._teavm.$rt_createDoubleArray(size);
    }

    //Proxy to make sure static variables are initialized before access.
    function makeClinitProxy(staticVariables, clinit) {
        return new Proxy(staticVariables, {
            get: function (a, b, c) {
                clinit();
                return Reflect.get(a, b, c);
            }
        });
    }

    ModAPI.hooks.regenerateClassMap = function () {
        ModAPI.hooks._rippedConstructorKeys = Object.keys(ModAPI.hooks._rippedConstructors);
        ModAPI.hooks._rippedInternalConstructorKeys = Object.keys(ModAPI.hooks._rippedInternalConstructors);
        ModAPI.hooks._rippedMethodKeys = Object.keys(ModAPI.hooks._rippedMethodTypeMap);
        ModAPI.hooks._rippedInterfaceKeys = Object.keys(ModAPI.hooks._rippedInterfaceMap);

        var compiledNames = new Set();
        var metaMap = {};

        //Loop through ripped metadata passes. Classes obtained through this method have full metadata (superclasses, full names, binary names, actual class)
        ModAPI.hooks._rippedData.forEach(block => {
            block.forEach(item => {
                if (typeof item === "function") {
                    if (!item.$meta || typeof item.$meta.name !== "string") {
                        if (item.name && item.name.split("_").length === 2) {
                            metaMap[item.name] = item;
                            compiledNames.add(item.name);
                        }
                        return;
                    }
                    var compiledName = ModAPI.util.getCompiledNameFromPackage(item.$meta.name);
                    compiledNames.add(compiledName);
                    metaMap[compiledName] = item;
                }
            });
        });


        ModAPI.hooks._rippedConstructorKeys.forEach(constructor => {
            if (typeof constructor === "string" && constructor.length > 0) {
                //Constructor names are phrased as aaa_Apple__init_3 or similar, the separator is __init_
                var constructorData = constructor.split("__init_");
                if (constructorData[0] && constructorData[0].includes("_")) {
                    compiledNames.add(constructorData[0]);
                }
            }
        });

        ModAPI.hooks._rippedInterfaceKeys.forEach(className => {
            if (typeof className === "string" && className.length > 0) {
                //Interfaces using $rt_classWithoutFields(0) and no constructors.
                if (className && className.includes("_")) {
                    compiledNames.add(className);
                }
            }
        });


        //Initialise all compiled names into the class map
        compiledNames.forEach(compiledName => {
            var item = metaMap[compiledName] || ModAPI.hooks._rippedInterfaceMap[compiledName];
            var classId = item?.$meta?.name || null;

            if (!ModAPI.hooks._classMap[compiledName]) {
                var argumentCache = null;
                ModAPI.hooks._classMap[compiledName] = {
                    "name": compiledName.split("_")[1],
                    "id": classId,
                    "binaryName": item?.$meta?.binaryName || null,
                    "constructors": [],
                    "internalConstructors": [],
                    "methods": {},
                    "staticMethods": {},
                    "staticVariables": {},
                    "staticVariableNames": [],
                    "class": item || null,
                    "hasMeta": !!(item?.$meta),
                    "instanceOf": function (object) {
                        try {
                            return ModAPI.hooks._teavm.$rt_isInstance(object, item || null);
                        } catch {
                            return false;
                        }
                    },
                    "compiledName": compiledName,
                    "getConstructorByArgs": function (...argNames) {
                        if (!argumentCache) {
                            argumentCache = [];
                            this.internalConstructors.forEach(x=>{
                                argumentCache.push(getParamNames(x).slice(1).map(y => y.substring(1)));
                            });
                        }
                        for (let i = 0; i < argumentCache.length; i++) {
                            const args = argumentCache[i];
                            if (arraysAreSame(args, argNames)) {
                                return this.constructors[i];
                            }
                        }
                    },
                }
            }

            if (typeof item?.$meta?.superclass === "function" && item?.$meta?.superclass?.$meta) {
                ModAPI.hooks._classMap[compiledName].superclassRaw = item.$meta.superclass;
            } else {
                ModAPI.hooks._classMap[compiledName].superclassRaw = null;
            }

            if (item?.["$$constructor$$"]) {
                //Class does not have any hand written constructors
                //Eg: class MyClass {}
                ModAPI.hooks._classMap[compiledName].constructors.push(item["$$constructor$$"]);
            } else {
                //Class has hand written constructors, we need to search in the stash
                ModAPI.hooks._rippedConstructorKeys.forEach(constructor => {
                    if (constructor.startsWith(compiledName + "__init_") && !constructor.includes("$lambda$")) {
                        ModAPI.hooks._classMap[compiledName].constructors.push(ModAPI.hooks._rippedConstructors[constructor]);
                    }
                });
            }

            ModAPI.hooks._rippedInternalConstructorKeys.forEach(initialiser => { // Find internal constructors/initialisers. Used for calling super() on custom classes. (They are the different implementations of a classes constructor, that don't automatically create an object. Thus, it is identical to calling super)
                if (initialiser.startsWith(compiledName + "__init_") && !initialiser.includes("$lambda$")) {
                    ModAPI.hooks._classMap[compiledName].internalConstructors.push(ModAPI.hooks._rippedInternalConstructors[initialiser]);
                }
            });

            ModAPI.hooks._rippedMethodKeys.forEach((method) => {
                if (method.startsWith(compiledName + "_") && !method.includes("$lambda$")) {
                    var targetMethodMap = ModAPI.hooks._classMap[compiledName].methods;
                    if (ModAPI.hooks._rippedMethodTypeMap[method] === "static") {
                        targetMethodMap = ModAPI.hooks._classMap[compiledName].staticMethods;
                    }
                    targetMethodMap[method.replace(compiledName + "_", "")] = {
                        method: ModAPI.hooks.methods[method],
                        methodName: method,
                        methodNameShort: method.replace(compiledName + "_", "")
                    };

                    //Prototype Injection, allows for far easier access to methods
                    if (typeof item === "function" && ModAPI.hooks._rippedMethodTypeMap[method] === "instance") {
                        var prototypeInjectedMethod = function prototypeInjectedMethod(...args) {
                            return ModAPI.hooks.methods[method].apply(this, [this, ...args]);
                        }
                        if ((item.prototype["$" + method.replace(compiledName + "_", "")]?.name ?? "prototypeInjectedMethod") === "prototypeInjectedMethod") {
                            item.prototype["$" + method.replace(compiledName + "_", "")] = prototypeInjectedMethod;
                        } else {
                            item.prototype["$" + method.replace(compiledName + "_", "")] ||= prototypeInjectedMethod;
                        }
                    }
                }
            });
            ModAPI.hooks._classMap[compiledName].staticVariables = makeClinitProxy(ModAPI.hooks._rippedStaticProperties[compiledName] || {}, (() => {
                (ModAPI.hooks._rippedStaticProperties[compiledName].$callClinit ?? (() => { }))();
            }));
            ModAPI.hooks._classMap[compiledName].staticVariableNames = Object.keys(ModAPI.hooks._classMap[compiledName].staticVariables);
        });

        //populate superclasses
        compiledNames.forEach(compiledName => {
            var item = ModAPI.hooks._classMap[compiledName];
            if (item.superclassRaw) {
                item.superclass = ModAPI.hooks._classMap[item.superclassRaw.name];
            } else {
                item.superclass = null;
            }
        });

        ModAPI.reflect.classes = Object.values(ModAPI.hooks._classMap);
        ModAPI.reflect.classMap = ModAPI.hooks._classMap;
        console.log("[ModAPI] Regenerated hook classmap.");
    }
    ModAPI.hooks.regenerateClassMap();
    ModAPI.reflect.getClassById = function (classId) {
        return ModAPI.hooks._classMap[ModAPI.util.getCompiledName(classId)];
    }
    ModAPI.reflect.getClassByName = function (className) {
        var classKeys = Object.keys(ModAPI.hooks._classMap);
        var key = classKeys.filter(k => { return ModAPI.hooks._classMap[k].name === className })[0];
        return key ? ModAPI.hooks._classMap[key] : null;
    }

    //Magical function for making a subclass with a custom constructor that you can easily use super(...) on.
    ModAPI.reflect.getSuper = function getSuper(reflectClass, filter) {
        filter ||= (x) => x.length === 1;
        while (!reflectClass.internalConstructors.find(filter) && reflectClass.superclass) {
            reflectClass = reflectClass.superclass;
        }
        var initialiser = reflectClass.internalConstructors.find(filter);
        if (!initialiser) {
            throw new Error("[ModAPI] Failed to find matching superclass constructor in tree.");
        }
        return function superFunction(thisArg, ...extra_args) {
            reflectClass.class.call(thisArg);
            initialiser(thisArg, ...extra_args);
        }
    }

    //Make it extend the parent. Used to iteratively load the superclasses' prototype methods.
    ModAPI.reflect.prototypeStack = function prototypeStack(reflectClass, classFn) {
        classFn.prototype = Object.create(reflectClass.class.prototype);
        classFn.prototype.constructor = classFn;
        classFn.$meta = {
            item: null,
            supertypes: [reflectClass.class]
        };
        classFn.classObject = null;
    }
    ModAPI.reflect.implements = function impl(classFn, reflectClass) {
        classFn.$meta ||= {};
        classFn.$meta.supertypes ||= [];
        if (reflectClass && reflectClass.class) {
            classFn.$meta.supertypes.push(reflectClass.class);
        }
    }

    var reloadDeprecationWarnings = 0;
    const TeaVMArray_To_Recursive_BaseData_ProxyConf = {
        get(target, prop, receiver) {
            var corrective = !!this._corrective;
            if (prop === "getRef") {
                return function () {
                    return target;
                }
            }
            var outputValue = Reflect.get(target, prop, receiver);
            var wrapped = ModAPI.util.wrap(outputValue, target, corrective, true);
            if (wrapped) {
                return wrapped;
            }
            return outputValue;
        },
        set(object, prop, value) {
            object[prop] = value;
            return true;
        }
    }
    const TeaVM_to_Recursive_BaseData_ProxyConf = {
        ownKeys(target) {
            return Reflect.ownKeys(target).map(x => x.substring(1));
        },
        getOwnPropertyDescriptor(target, prop) {
            return Object.getOwnPropertyDescriptor(target, "$" + prop);
        },
        has(target, prop) {
            return ("$" + prop) in target;
        },
        get(target, prop, receiver) {
            var corrective = !!this._corrective;
            if (prop === "getCorrective") {
                return function () {
                    return new Proxy(target, patchProxyConfToCorrective(TeaVM_to_Recursive_BaseData_ProxyConf));
                }
            }
            if (prop === "isCorrective") {
                return function () {
                    return corrective;
                }
            }
            if (prop === "getRef") {
                return function () {
                    return target;
                }
            }
            if (prop === "reload") {
                return function () {
                    if (reloadDeprecationWarnings < 10) {
                        console.warn("ModAPI/PluginAPI reload() is obsolete, please stop using it in code.")
                        reloadDeprecationWarnings++;
                    }
                }
            }
            if (prop === "isModProxy") {
                return true;
            }

            var outProp = "$" + prop;
            if (corrective) {
                outProp = ModAPI.util.getNearestProperty(target, outProp);
            }
            var outputValue = Reflect.get(target, outProp, receiver);
            var wrapped = ModAPI.util.wrap(outputValue, target, corrective, false);
            if (wrapped) {
                return wrapped;
            }
            return outputValue;
        },
        set(object, prop, value) {
            var corrective = !!this._corrective;
            var outProp = "$" + prop;
            if (corrective) {
                outProp = ModAPI.util.getNearestProperty(object, outProp);
            }
            object[outProp] = value;
            return true;
        },
    };
    function patchProxyConfToCorrective(conf) {
        var pconf = Object.assign({}, conf);
        pconf._corrective = true;
        return pconf;
    }
    const StaticProps_ProxyConf = {
        get(target, prop, receiver) {
            var outProp = prop;
            var outputValue = Reflect.get(target, outProp, receiver);
            if (outputValue && typeof outputValue === "object" && Array.isArray(outputValue.data) && typeof outputValue.type === "function") {
                return new Proxy(outputValue.data, TeaVMArray_To_Recursive_BaseData_ProxyConf);
            }
            if (outputValue && typeof outputValue === "object" && !Array.isArray(outputValue)) {
                return new Proxy(outputValue, TeaVM_to_Recursive_BaseData_ProxyConf);
            }
            return outputValue;
        },
        set(object, prop, value) {
            var outProp = prop;
            object[outProp] = value;
            return true;
        },
    };
    ModAPI.util.TeaVMArray_To_Recursive_BaseData_ProxyConf = TeaVMArray_To_Recursive_BaseData_ProxyConf;
    ModAPI.util.TeaVM_to_Recursive_BaseData_ProxyConf = TeaVM_to_Recursive_BaseData_ProxyConf;
    ModAPI.util.StaticProps_ProxyConf = StaticProps_ProxyConf;
    ModAPI.required = new Set();
    ModAPI.events = {};
    ModAPI.events.types = ["event"];
    ModAPI.events.lib_map = {};
    ModAPI.events.listeners = { "event": [] };
    ModAPI.addEventListener = function addEventListener(name, callback) {
        if (name.startsWith("lib:")) {
            if (Object.keys(ModAPI.events.lib_map).includes(name)) {
                callback(ModAPI.events.lib_map[name]);
            } else {
                if (!Array.isArray(ModAPI.events.listeners[name])) {
                    ModAPI.events.listeners[name] = [];
                }
                ModAPI.events.listeners[name].push(callback);
            }
            console.log("[ModAPI] Added new library listener: " + name);
            return;
        }
        if (!callback || typeof callback !== "function") {
            throw new Error("[ModAPI] Invalid callback!");
        }
        if (ModAPI.events.types.includes(name) || name.startsWith("custom:")) {
            if (!Array.isArray(ModAPI.events.listeners[name])) {
                ModAPI.events.listeners[name] = [];
            }
            ModAPI.events.listeners[name].push(callback);
            console.log("[ModAPI] Added new event listener: " + name);
        } else {
            throw new Error("[ModAPI] This event does not exist!");
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
                console.log("[ModAPI] Removed event listener.");
            }
        } else {
            var functionString = func.toString();
            targetArr.forEach((f, i) => {
                if (f.toString() === functionString) {
                    targetArr.splice(i, 1);
                    console.log("[ModAPI] Removed event listener.");
                }
            });
        }
    };
    ModAPI.events.newEvent = function newEvent(name, side = "unknown") {
        if (!ModAPI.events.types.includes(name)) {
            console.log("[ModAPI] Registered " + side + " event: " + name);
            ModAPI.events.types.push(name);
        }
    };

    ModAPI.events.callEvent = function callEvent(name, data) {
        if (ModAPI.events.types.includes(name) && name.startsWith("lib:")) {
            if (Array.isArray(ModAPI.events.listeners[name])) {
                ModAPI.events.listeners[name].forEach((func) => {
                    func(data);
                });
            }
            ModAPI.events.lib_map[name] = data;
            return;
        }
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
    ModAPI.events.newEvent("update", "client");

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
        if (ModAPI.required.has("world") && ModAPI.javaClient && ModAPI.javaClient.$theWorld) {
            ModAPI.world = new Proxy(ModAPI.javaClient.$theWorld, TeaVM_to_Recursive_BaseData_ProxyConf);
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

    //Overrides $rt_resuming, $rt_suspending, $rt_currentThread. Experimental, but should be used if call stack leaks occur as a result of running internal code.
    ModAPI.freezeCallstack = function () {
        ModAPI.hooks.freezeCallstack = true;
    }
    ModAPI.unfreezeCallstack = function () {
        ModAPI.hooks.freezeCallstack = false;
    }

    //Function used for running @Async / @Async-dependent TeaVM methods.
    ModAPI.promisify = function promisify(fn) {
        return function promisifiedJavaMethod(...inArguments) {
            return new Promise((res, rej) => {
                Promise.resolve().then( //queue microtask
                    () => {
                        ModAPI.hooks._teavm.$rt_startThread(() => {
                            return fn(...inArguments);
                        }, function (out) {
                            res(out);
                        });
                    }
                );
            });
        }
    }

    ModAPI.util.string = ModAPI.util.str = ModAPI.hooks._teavm.$rt_str;

    ModAPI.util.setStringContent = function (jclString, string) {
        jclString.$characters.data = ModAPI.util.stringToUint16Array(string);
    }

    ModAPI.util.jclStrToJsStr = ModAPI.util.unstr = ModAPI.util.unstring = ModAPI.util.ustr = ModAPI.hooks._teavm.$rt_ustr;

    ModAPI.displayToChat = function (param) {
        var v = typeof param === "object" ? param.msg : (param + "");
        v ||= "";
        var jclString = ModAPI.util.string(v);
        ModAPI.hooks.methods["nmcg_GuiNewChat_printChatMessage"](ModAPI.javaClient.$ingameGUI.$persistantChatGUI, ModAPI.hooks._classMap[ModAPI.util.getCompiledName("net.minecraft.util.ChatComponentText")].constructors[0](jclString));
    }

    ModAPI.util.makeArray = function makeArray(arrayClass, arrayContents = []) {
        return ModAPI.hooks._teavm.$rt_createArrayFromData(arrayClass, arrayContents);
    }

    ModAPI.util.hashCode = function hashCode(string) {
        var hash = 0;
        for (var i = 0; i < string.length; i++) {
            var code = string.charCodeAt(i);
            hash = ((hash << 5) - hash) + code;
            hash = hash & hash;
        }
        return Math.floor(Math.abs(hash)) + "";
    };

    //Check whether the thread is in a critical transition state (resuming or suspending)
    //Calling functions in a critical state will cause stack implosions.
    ModAPI.util.isCritical = function isCritical() {
        return ModAPI.hooks._teavm.$rt_suspending() || ModAPI.hooks._teavm.$rt_resuming();
    }

    ModAPI.util.getNearestProperty = function getNearestProperty(object, prop) {
        if (!object) {
            return null;
        }
        if (prop in object) {
            return prop;
        }
        var possibleKeys = Object.keys(object).filter(x => { return x.startsWith(prop) });
        possibleKeys = possibleKeys.filter(x => {
            return Number.isFinite(parseInt(x.substring(prop.length))) || (x.substring(prop.length).length === 0);
        })
        return possibleKeys.sort((a, b) => {
            return a.length - b.length;
        })[0] || null;
    }

    ModAPI.util.modifyFunction = function (fn, patcherFn) {
        // Convert the original function to a string
        let functionString = fn.toString();

        // Extract the function body
        let bodyStart = functionString.indexOf('{') + 1;
        let bodyEnd = functionString.lastIndexOf('}');
        let functionBody = functionString.substring(bodyStart, bodyEnd);

        // Replace the function body with new instructions
        let modifiedFunctionBody = patcherFn(functionBody) || 'return;';

        // Create a new function with the same arguments and the modified body
        let args = functionString.substring(functionString.indexOf('(') + 1, functionString.indexOf(')'));
        let modifiedFunction = new Function(args, modifiedFunctionBody);

        return modifiedFunction;
    }

    ModAPI.clickMouse = function () {
        ModAPI.hooks.methods["nmc_Minecraft_clickMouse"](ModAPI.javaClient);
    }

    ModAPI.rightClickMouse = function () {
        ModAPI.hooks.methods["nmc_Minecraft_rightClickMouse"](ModAPI.javaClient);
    }

    ModAPI.getFPS = function () {
        return ModAPI.hooks.methods["nmc_Minecraft_getDebugFPS"](ModAPI.javaClient);
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
        ModAPI.mc = ModAPI.minecraft = new Proxy(args[0], TeaVM_to_Recursive_BaseData_ProxyConf);
        globalThis.Minecraft = ModAPI.mcinstance = ModAPI.javaClient = args[0];
        ModAPI.settings = new Proxy(ModAPI.mcinstance.$gameSettings, TeaVM_to_Recursive_BaseData_ProxyConf);

        startModLoader();

        return x;
    };

    var inlineIntegratedServerStartup = ModAPI.util.getMethodFromPackage("net.lax1dude.eaglercraft.v1_8.sp.internal.ClientPlatformSingleplayer", "loadIntegratedServerSourceInline");
    //Integrated server setup has a randomised suffix on the end
    inlineIntegratedServerStartup = ModAPI.hooks._rippedMethodKeys.filter(key => { return key.startsWith(inlineIntegratedServerStartup); })[0];
    const inlineIntegratedServerStartupMethod = ModAPI.hooks.methods[inlineIntegratedServerStartup];
    ModAPI.hooks.methods[inlineIntegratedServerStartup] = function (worker, bootstrap) {
        var x = inlineIntegratedServerStartupMethod.apply(this, [worker, bootstrap + ";" + globalThis.modapi_postinit + ";" + ModAPI.dedicatedServer._data.join(";")]);
        ModAPI.dedicatedServer._data = [];
        ModAPI.dedicatedServer._wasUsed = true;
        console.log("[ModAPI] Hooked into inline integrated server.");
        return x;
    };

    var integratedServerStartup = ModAPI.util.getMethodFromPackage("net.lax1dude.eaglercraft.v1_8.sp.internal.ClientPlatformSingleplayer", "createBlobObj");
    //Integrated server setup has a randomised suffix on the end
    integratedServerStartup = ModAPI.hooks._rippedMethodKeys.filter(key => { return key.startsWith(integratedServerStartup); })[0];
    const integratedServerStartupMethod = ModAPI.hooks.methods[integratedServerStartup];
    ModAPI.hooks.methods[integratedServerStartup] = function (worker, bootstrap) {
        var x = integratedServerStartupMethod.apply(this, [worker, bootstrap + ";" + globalThis.modapi_postinit + ";" + ModAPI.dedicatedServer._data.join(";")]);
        ModAPI.dedicatedServer._data = [];
        ModAPI.dedicatedServer._wasUsed = true;
        console.log("[ModAPI] Hooked into external integrated server.");
        return x;
    };

    var desktopServerStartup = ModAPI.util.getMethodFromPackage("net.lax1dude.eaglercraft.v1_8.sp.internal.ClientPlatformSingleplayer", "startIntegratedServer");
    const desktopServerStartupMethod = ModAPI.hooks.methods[desktopServerStartup];
    ModAPI.hooks.methods[desktopServerStartup] = function (...args) {
        var x = desktopServerStartupMethod.apply(this, args);
        ModAPI.dedicatedServer._data.forEach((code) => {
            (new Function(code))();
        });
        console.log("[ModAPI] Hooked into external integrated server.");
        return x;
    };

    ModAPI.events.newEvent("load", "client");

    ModAPI.events.newEvent("sendchatmessage", "client");
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
        if (typeof data.message === "string") {
            ModAPI.util.setStringContent($message, data.message)
        }
        return sendChatMessage.apply(this, [$this, $message]);
    }

    const ScaledResolutionConstructor = ModAPI.reflect.getClassByName("ScaledResolution").constructors[0];
    ModAPI.events.newEvent("frame", "client");
    const frameMethodName = ModAPI.util.getMethodFromPackage("net.minecraft.client.Minecraft", "runTick");
    const frameMethod = ModAPI.hooks.methods[frameMethodName];
    ModAPI.hooks.methods[frameMethodName] = function (...args) {
        ModAPI.events.callEvent("frame", {});
        if (ModAPI.required.has("resolution") && ModAPI.mcinstance) {
            ModAPI.ScaledResolution = ModAPI.resolution = new Proxy(ScaledResolutionConstructor(ModAPI.mcinstance), TeaVM_to_Recursive_BaseData_ProxyConf);
        }
        return frameMethod.apply(this, args);
    }

    ModAPI.events.newEvent("tick", "server");
    const serverTickMethodName = ModAPI.util.getMethodFromPackage("net.minecraft.server.MinecraftServer", "tick");
    const serverTickMethod = ModAPI.hooks.methods[serverTickMethodName];
    ModAPI.hooks.methods[serverTickMethodName] = function ($this) {
        if (ModAPI.util.isCritical()) {
            return serverTickMethod.apply(this, [$this]);
        }
        var data = { preventDefault: false }
        ModAPI.events.callEvent("tick", data);
        if (data.preventDefault) {
            return;
        }
        return serverTickMethod.apply(this, [$this]);
    }

    ModAPI.events.newEvent("serverstart", "server");
    const serverStartMethodName = ModAPI.util.getMethodFromPackage("net.lax1dude.eaglercraft.v1_8.sp.server.EaglerMinecraftServer", "startServer");
    const serverStartMethod = ModAPI.hooks.methods[serverStartMethodName];
    ModAPI.hooks.methods[serverStartMethodName] = function ($this) {
        var x = serverStartMethod.apply(this, [$this]);
        ModAPI.server = new Proxy($this, ModAPI.util.TeaVM_to_Recursive_BaseData_ProxyConf);
        ModAPI.rawServer = $this;
        ModAPI.events.callEvent("serverstart", {});
        return x;
    }

    ModAPI.events.newEvent("serverstop", "server");
    const serverStopMethodName = ModAPI.util.getMethodFromPackage("net.minecraft.server.MinecraftServer", "stopServer");
    const serverStopMethod = ModAPI.hooks.methods[serverStopMethodName];
    ModAPI.hooks.methods[serverStopMethodName] = function ($this) {
        var x = serverStopMethod.apply(this, [$this]);
        ModAPI.server = ModAPI.serverInstance = null;
        ModAPI.events.callEvent("serverstop", {});
        return x;
    }

    ModAPI.events.newEvent("receivechatmessage", "server");
    const receiveChatMessageMethodName = ModAPI.util.getMethodFromPackage("net.minecraft.network.play.client.C01PacketChatMessage", "processPacket");
    const receiveChatMessageMethod = ModAPI.hooks.methods[receiveChatMessageMethodName];
    ModAPI.hooks.methods[receiveChatMessageMethodName] = function (...args) {
        var $this = args[0];
        var data = {
            preventDefault: false,
            message: ModAPI.util.jclStrToJsStr($this.$message3)
        }
        ModAPI.events.callEvent("sendchatmessage", data);
        if (data.preventDefault) {
            return;
        }
        if (typeof data.message === "string") {
            ModAPI.util.setStringContent($this.$message3, data.message)
        }
        var x = receiveChatMessageMethod.apply(this, args);
        return x;
    }

    ModAPI.events.newEvent("processcommand", "server");
    const processCommandMethodName = ModAPI.util.getMethodFromPackage("net.minecraft.command.CommandHandler", "executeCommand");
    const processCommandMethod = ModAPI.hooks.methods[processCommandMethodName];
    ModAPI.hooks.methods[processCommandMethodName] = function ($this, $sender, $rawCommand) {
        var data = {
            preventDefault: false,
            sender: new Proxy($sender, TeaVM_to_Recursive_BaseData_ProxyConf),
            command: ModAPI.util.jclStrToJsStr($rawCommand)
        }
        if (data.command.toLowerCase().startsWith("/efdebug")) {
            // Utility command to debug the dedicated server.
            data.preventDefault = true;
            debugger;
        } else {
            ModAPI.events.callEvent("processcommand", data);
        }
        if (data.preventDefault) {
            return 0;
        }
        if (typeof data.command === "string") {
            ModAPI.util.setStringContent($rawCommand, data.command)
        }
        var x = processCommandMethod.apply(this, [$this, $sender, $rawCommand]);
        return x;
    }

    ModAPI.util.bootstrap = function () {
        ModAPI.items = new Proxy(ModAPI.hooks._classMap[ModAPI.util.getCompiledName("net.minecraft.init.Items")].staticVariables, StaticProps_ProxyConf);
        ModAPI.blocks = new Proxy(ModAPI.hooks._classMap[ModAPI.util.getCompiledName("net.minecraft.init.Blocks")].staticVariables, StaticProps_ProxyConf);
        ModAPI.materials = new Proxy(ModAPI.hooks._classMap[ModAPI.util.getCompiledName("net.minecraft.block.material.Material")].staticVariables, StaticProps_ProxyConf);
        ModAPI.enchantments = new Proxy(ModAPI.hooks._classMap[ModAPI.util.getCompiledName("net.minecraft.enchantment.Enchantment")].staticVariables, StaticProps_ProxyConf);
    }

    ModAPI.events.newEvent("bootstrap", "server");
    const bootstrapClass = ModAPI.reflect.getClassById("net.minecraft.init.Bootstrap");
    const originalBootstrap = ModAPI.hooks.methods[ModAPI.util.getMethodFromPackage("net.minecraft.init.Bootstrap", "register")];
    ModAPI.hooks.methods[ModAPI.util.getMethodFromPackage("net.minecraft.init.Bootstrap", "register")] = function (...args) {
        if (bootstrapClass.staticVariables.alreadyRegistered) {
            return;
        }
        var x = originalBootstrap.apply(this, args);
        ModAPI.util.bootstrap();
        console.log("[ModAPI] Hooked into bootstrap. .blocks, .items, .materials and .enchantments are now accessible.");
        ModAPI.events.callEvent("bootstrap", {});
        return x;
    }

    const originalOptionsInit = ModAPI.hooks.methods[ModAPI.util.getMethodFromPackage("net.minecraft.client.gui.GuiOptions", "initGui")];
    ModAPI.hooks.methods[ModAPI.util.getMethodFromPackage("net.minecraft.client.gui.GuiOptions", "initGui")] = function (...args) {
        var x = originalOptionsInit.apply(this, args);

        //NOT A BUG DO NOT FIX
        var msg = Math.random() < 0.025 ? "Plugins" : "Mods";

        // Find the right constructor. (int id, int x, int y, int width, int height, String buttonText);
        var btnConstructor = ModAPI.hooks._classMap['nmcg_GuiButton'].constructors.filter(c => { return c.length === 6 })[0];
        var heightProp = ModAPI.util.getNearestProperty(args[0], "$height");
        var btn = btnConstructor(9635329, 0, args[0][heightProp] - 21, 100, 20, ModAPI.util.str(msg));
        args[0].$buttonList.$add(btn);

        return x;
    }

    const originalOptionsAction = ModAPI.hooks.methods[ModAPI.util.getMethodFromPackage("net.minecraft.client.gui.GuiOptions", "actionPerformed")];
    ModAPI.hooks.methods[ModAPI.util.getMethodFromPackage("net.minecraft.client.gui.GuiOptions", "actionPerformed")] = function (...args) {
        var idProp = ModAPI.util.getNearestProperty(args[1], "$id");
        if (args[1] && args[1][idProp] === 9635329) {
            if (typeof window.modapi_displayModGui === "function") {
                window.modapi_displayModGui();
            } else {
                alert("[ModAPI] Mod Manager GUI does not exist!")
            }
        }
        var x = originalOptionsAction.apply(this, args);
        return x;
    }

    const originalCrashMethod = ModAPI.hooks.methods[ModAPI.util.getMethodFromPackage("net.lax1dude.eaglercraft.v1_8.internal.teavm.ClientMain", "showCrashScreen")];
    ModAPI.hooks.methods[ModAPI.util.getMethodFromPackage("net.lax1dude.eaglercraft.v1_8.internal.teavm.ClientMain", "showCrashScreen")] = function (...args) {
        if (window.confirm("Your game has crashed, do you want to open the mod manager gui?")) {
            return modapi_displayModGui();
        };
        var x = originalCrashMethod.apply(this, args);
        return x;
    }
    var inited = false;
    const originalMainMethod = ModAPI.hooks.methods[ModAPI.util.getMethodFromPackage("net.lax1dude.eaglercraft.v1_8.internal.teavm.ClientMain", "_main")];
    ModAPI.hooks.methods[ModAPI.util.getMethodFromPackage("net.lax1dude.eaglercraft.v1_8.internal.teavm.ClientMain", "_main")] = function (...args) {
        if ((!inited) && (!getEaglerConfigFlag("noInitialModGui"))) {
            inited = true;
            return modapi_displayModGui(globalThis.main);
        } else {
            return originalMainMethod.apply(this, args);
        }
    }

    if (globalThis.modapi_specialevents && Array.isArray(globalThis.modapi_specialevents)) {
        globalThis.modapi_specialevents.forEach(eventName => {
            ModAPI.events.newEvent(eventName, "patcher");
        });
    }

    ModAPI.util.getIdFromItem = easyStaticMethod("net.minecraft.item.Item", "getIdFromItem", true);
    ModAPI.util.getItemById = easyStaticMethod("net.minecraft.item.Item", "getItemById", false);
    ModAPI.util.getItemFromBlock = easyStaticMethod("net.minecraft.item.Item", "getItemFromBlock", true);
    ModAPI.util.getBlockById = easyStaticMethod("net.minecraft.block.Block", "getBlockById", false);
    ModAPI.util.getBlockFromItem = easyStaticMethod("net.minecraft.block.Block", "getBlockFromItem", true);
    ModAPI.util.getIdFromBlock = easyStaticMethod("net.minecraft.block.Block", "getIdFromBlock", true);

    function qhash(txt, arr, interval) {
        // var interval = 4095; //used to be 4095 - arr.length, but that increases incompatibility based on load order and other circumstances
        if (arr.length >= interval) {
            console.error("[ModAPI.keygen] Ran out of IDs while generating for " + txt);
            return -1;
        }
        var x = 1;
        for (let i = 0; i < txt.length; i++) {
            x += txt.charCodeAt(i);
            x = x << txt.charCodeAt(i);
            x = Math.abs(x);
            x = x % interval;
        }
        var hash = x;
        while (arr.includes(hash)) {
            hash = (hash + 1) % interval;
        }
        return hash;
    }


    ModAPI.keygen = {};
    var registryNamespaceMethod = ModAPI.hooks.methods[ModAPI.util.getMethodFromPackage("net.minecraft.util.RegistryNamespaced", "register")];
    ModAPI.hooks.methods[ModAPI.util.getMethodFromPackage("net.minecraft.util.RegistryNamespaced", "register")] = function (...args) {
        args[0].$modapi_specmap ||= new Map();
        args[0].$modapi_specmap.set(args[2], args[1]);
        return registryNamespaceMethod.apply(this, args);
    }
    ModAPI.keygen.item = function (item) {
        var values = [...ModAPI.reflect.getClassById("net.minecraft.item.Item").staticVariables.itemRegistry.$modapi_specmap.values()];
        return qhash(item, values, 4095);
    }
    ModAPI.keygen.block = function (block) {
        var values = [...ModAPI.reflect.getClassById("net.minecraft.block.Block").staticVariables.blockRegistry.$modapi_specmap.values()];
        return qhash(block, values, 4095);
    }
    ModAPI.keygen.entity = function (entity) {
        var hashMap = ModAPI.util.wrap(ModAPI.reflect.getClassById("net.minecraft.entity.EntityList").staticVariables.idToClassMapping).getCorrective();
        var values = hashMap.keys.getRef().data.filter(x=>hashMap.get(x));
        return qhash(entity, values, 127);
    }
}).toString() + ")();";
