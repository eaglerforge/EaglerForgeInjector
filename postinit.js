//EaglerForge post initialisation code.
ModAPI.hooks._classMap = {};
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
                    "methods": [],
                    "staticMethods": [],
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

        }
    })
});