// Library to make adding custom items with EaglerForgeInjector much easier.
(function LibItems() {
    ModAPI.meta.title("LibCustomItems");
    ModAPI.meta.credits("By ZXMushroom63");
    ModAPI.meta.icon("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAQdJREFUOE9jZGBg+M9AAWAEGbBl2QmyjPCJsmAgaABbdybc8F+l01EswmsATONXLi4GYSkpBgZ+foY1O3cyuHWuhhuC1QBkjf///QMrFtHWZmD4+BHDEBQDUGzU1ITb8ubqVZyGoBjwsCONQYqXl0FYU5MBpAlsKxRgM+STUwoDhgG66upgZ4IAuiEooRcXx/DpCRuqAU97shg0jYzgfsVpSFwcg5mZGcOedRewGDBhAgPDokUohsBthmoE8U+dOoXdBfHHjoElUQxB03i9oABspnTJNFQXgARB3oAbwsAAdirMRmSNMFdhTQcwQ/BpxGsAzCUwRSCn4gJE5QV8uQxuAFlZEaoJAKrYrAHl38o6AAAAAElFTkSuQmCC");
    ModAPI.meta.description("Library to make adding basic custom items easier.");
    ModAPI.events.newEvent("lib:libcustomitems:loaded");
    function libServerside() {
        var packetblockchange = ModAPI.reflect.getClassByName("S23PacketBlockChange").constructors.find(x => { return x.length === 2 });
        var sendPacket = ModAPI.reflect.getClassByName("NetHandlerPlayServer").methods.sendPacket.method;
        globalThis.LCI_REGISTRY ||= [];
        globalThis.LCI_RMBEVENTS ||= {};
        globalThis.LCI_LMBEVENTS ||= {};
        globalThis.LCI_RECIPEEVENTS ||= {};
        globalThis.LCI_ITEMDB ||= {};
        globalThis.LibCustomItems = {
            makeItemStack: function makeItemStack(tag) {
                return globalThis.LCI_ITEMDB[tag] || null;
            }
        };
        var useName = ModAPI.util.getMethodFromPackage("net.minecraft.network.NetHandlerPlayServer", "processPlayerBlockPlacement");
        var oldUse = ModAPI.hooks.methods[useName];
        ModAPI.hooks.methods[useName] = function ($this, packet) {
            if ($this?.$playerEntity?.$inventory && $this.$playerEntity.$inventory.$getCurrentItem()) {
                var item = $this.$playerEntity.$inventory.$getCurrentItem();
                if (item.$stackTagCompound && item.$stackTagCompound.$hasKey(ModAPI.util.str("display"), 10)) {
                    var displayTag = item.$stackTagCompound.$getCompoundTag(ModAPI.util.str("display"));
                    if (displayTag.$hasKey(ModAPI.util.str("Lore"), 9)) {
                        var loreTag = displayTag.$getTag(ModAPI.util.str("Lore"));
                        if (loreTag.$tagCount() > 0 && globalThis.LCI_REGISTRY.includes(ModAPI.util.ustr(loreTag.$getStringTagAt(0)))) {
                            var cid = ModAPI.util.ustr(loreTag.$getStringTagAt(0));
                            if (!globalThis.LCI_RMBEVENTS[cid]) {
                                return oldUse.apply(this, [$this, packet]);
                            }
                            var positionTag = Object.keys(packet).filter(x => { return x.startsWith("$position") })[0];
                            if (packet[positionTag].$x === -1 && packet[positionTag].$y === -1 && packet[positionTag].$z === -1) {
                                return 0;
                            }
                            var r = globalThis.LCI_RMBEVENTS[cid].call(globalThis,
                                new Proxy($this.$playerEntity, ModAPI.util.TeaVM_to_Recursive_BaseData_ProxyConf),
                                new Proxy($this.$serverController.$worldServerForDimension($this.$playerEntity.$dimension), ModAPI.util.TeaVM_to_Recursive_BaseData_ProxyConf),
                                new Proxy(item, ModAPI.util.TeaVM_to_Recursive_BaseData_ProxyConf),
                                new Proxy(packet[positionTag], ModAPI.util.TeaVM_to_Recursive_BaseData_ProxyConf));
                            if (!r) {
                                return oldUse.apply(this, [$this, packet]);
                            }
                            return 0;
                        }
                    }
                }
            }
            return oldUse.apply(this, [$this, packet]);
        }
        var digName = ModAPI.util.getMethodFromPackage("net.minecraft.network.NetHandlerPlayServer", "processPlayerDigging");
        var oldDig = ModAPI.hooks.methods[digName];
        ModAPI.hooks.methods[digName] = function ($this, packet) {
            if ($this?.$playerEntity?.$inventory && $this.$playerEntity.$inventory.$getCurrentItem()) {
                var item = $this.$playerEntity.$inventory.$getCurrentItem();
                if (item.$stackTagCompound && item.$stackTagCompound.$hasKey(ModAPI.util.str("display"), 10)) {
                    var displayTag = item.$stackTagCompound.$getCompoundTag(ModAPI.util.str("display"));
                    if (displayTag.$hasKey(ModAPI.util.str("Lore"), 9)) {
                        var loreTag = displayTag.$getTag(ModAPI.util.str("Lore"));
                        if (loreTag.$tagCount() > 0 && globalThis.LCI_REGISTRY.includes(ModAPI.util.ustr(loreTag.$getStringTagAt(0)))) {
                            var cid = ModAPI.util.ustr(loreTag.$getStringTagAt(0));
                            if (!globalThis.LCI_LMBEVENTS[cid]) {
                                return oldDig.apply(this, [$this, packet]);
                            }
                            var $status = ModAPI.util.getNearestProperty(packet, "$status");
                            var statusTag = Object.keys(packet[$status]).find(x => { return x.startsWith("$name") });
                            var positionTag = Object.keys(packet).filter(x => { return x.startsWith("$position") })[0];
                            var stat = ModAPI.util.unstr(packet[$status][statusTag]);
                            if (stat === "START_DESTROY_BLOCK") {
                                sendPacket($this, packetblockchange($this.$serverController.$worldServerForDimension($this.$playerEntity.$dimension), packet[positionTag]));
                            }
                            if (stat !== "START_DESTROY_BLOCK") {
                                if (stat === "STOP_DESTROY_BLOCK") {
                                    sendPacket($this, packetblockchange($this.$serverController.$worldServerForDimension($this.$playerEntity.$dimension), packet[positionTag]));
                                }
                                return 0;
                            }

                            var r = globalThis.LCI_LMBEVENTS[cid].call(globalThis,
                                new Proxy($this.$playerEntity, ModAPI.util.TeaVM_to_Recursive_BaseData_ProxyConf),
                                new Proxy($this.$serverController.$worldServerForDimension($this.$playerEntity.$dimension), ModAPI.util.TeaVM_to_Recursive_BaseData_ProxyConf),
                                new Proxy(item, ModAPI.util.TeaVM_to_Recursive_BaseData_ProxyConf),
                                new Proxy(packet[positionTag], ModAPI.util.TeaVM_to_Recursive_BaseData_ProxyConf));
                            if (!r) {
                                return oldDig.apply(this, [$this, packet]);
                            }
                            return 0;
                        }
                    }
                }
            }
            return oldDig.apply(this, [$this, packet]);
        }
    }
    function LCI_registerItem(data) {
        globalThis.LCI_REGISTRY ||= [];
        globalThis.LCI_RMBEVENTS ||= {};
        globalThis.LCI_LMBEVENTS ||= {};
        globalThis.LCI_RECIPEEVENTS ||= {};
        globalThis.LCI_ITEMDB ||= {};
        globalThis.LCI_REGISTRY.push(data.tag);
        if (data.onRightClickGround) {
            globalThis.LCI_RMBEVENTS[data.tag] = new Function("user", "world", "itemstack", "blockpos", data.onRightClickGround);
        }
        if (data.onLeftClickGround) {
            globalThis.LCI_LMBEVENTS[data.tag] = new Function("user", "world", "itemstack", "blockpos", data.onLeftClickGround);
        }
        if (data.craftingExtra) {
            globalThis.LCI_RECIPEEVENTS[data.tag] = new Function("itemstack", data.craftingExtra);
        }
        var ObjectClass = ModAPI.reflect.getClassById("java.lang.Object").class;
        function ToChar(char) {
            return ModAPI.reflect.getClassById("java.lang.Character").staticMethods.valueOf.method(char[0].charCodeAt(0));
        }
        ModAPI.dedicatedServer.appendCode(`(function () {
            function handler() {
                LCI_registerItem(${JSON.stringify(data)});
                ModAPI.removeEventListener("tick", handler);
            }
            ModAPI.addEventListener("tick", handler);
        })()`);
        var recipeInternal = [];
        Object.keys(data.recipeLegend).forEach((key) => {
            recipeInternal.push(ToChar(key));
            var ingredient = null;
            var schema = data.recipeLegend[key];
            if (schema.type === "block") {
                ingredient = ModAPI.blocks[schema.id].getRef();
            } else {
                ingredient = ModAPI.items[schema.id].getRef();
            }
            recipeInternal.push(ingredient);
        });
        var recipeContents = data.recipe.flatMap(x => { return ModAPI.util.str(x) });
        var recipe = ModAPI.util.makeArray(ObjectClass, recipeContents.concat(recipeInternal));

        var testItem = ModAPI.reflect.getClassById("net.minecraft.item.ItemStack").constructors[4](ModAPI.items[data.base].getRef(), data.qty);
        testItem.$stackTagCompound = ModAPI.reflect.getClassById("net.minecraft.nbt.NBTTagCompound").constructors[0]();
        testItem.$stackTagCompound.$setTag(ModAPI.util.str("display"), ModAPI.reflect.getClassById("net.minecraft.nbt.NBTTagCompound").constructors[0]());
        var displayTag = testItem.$stackTagCompound.$getCompoundTag(ModAPI.util.str("display"));
        displayTag.$setString(ModAPI.util.str("Name"), ModAPI.util.str(data.name));
        var lore = ModAPI.reflect.getClassById("net.minecraft.nbt.NBTTagList").constructors[0]();
        lore.$appendTag(ModAPI.reflect.getClassById("net.minecraft.nbt.NBTTagString").constructors.filter(x => { return x.length === 1 })[0](ModAPI.util.str(data.tag)));
        displayTag.$setTag(ModAPI.util.str("Lore"), lore);
        if (globalThis.LCI_RECIPEEVENTS[data.tag]) {
            globalThis.LCI_RECIPEEVENTS[data.tag](new Proxy(testItem, ModAPI.util.TeaVM_to_Recursive_BaseData_ProxyConf));
        }
        globalThis.LCI_ITEMDB[data.tag] = new Proxy(testItem, ModAPI.util.TeaVM_to_Recursive_BaseData_ProxyConf);

        var craftingManager = ModAPI.reflect.getClassById("net.minecraft.item.crafting.CraftingManager").staticMethods.getInstance.method();
        if((data.useRecipe !== false) || (data.useRecipe !== "false")) {
            ModAPI.hooks.methods.nmic_CraftingManager_addRecipe(craftingManager, testItem, recipe);
        }
    }
    ModAPI.dedicatedServer.appendCode(libServerside);
    ModAPI.dedicatedServer.appendCode("globalThis.LCI_registerItem = " + LCI_registerItem.toString());
    window.LibCustomItems = {};
    LibCustomItems.registerItem = function register(data) {
        LCI_registerItem(data);
    }
    LibCustomItems.makeItemStack = function makeItemStack(tag) {
        return globalThis.LCI_ITEMDB[tag] || null;
    }
    ModAPI.events.callEvent("lib:libcustomitems:loaded", {});
})();
