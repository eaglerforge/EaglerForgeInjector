ModAPI.meta.title("LibCustomRender");
ModAPI.meta.credits("By ZXMushroom63");
ModAPI.meta.icon("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAQdJREFUOE9jZGBg+M9AAWAEGbBl2QmyjPCJsmAgaABbdybc8F+l01EswmsATONXLi4GYSkpBgZ+foY1O3cyuHWuhhuC1QBkjf///QMrFtHWZmD4+BHDEBQDUGzU1ITb8ubqVZyGoBjwsCONQYqXl0FYU5MBpAlsKxRgM+STUwoDhgG66upgZ4IAuiEooRcXx/DpCRuqAU97shg0jYzgfsVpSFwcg5mZGcOedRewGDBhAgPDokUohsBthmoE8U+dOoXdBfHHjoElUQxB03i9oABspnTJNFQXgARB3oAbwsAAdirMRmSNMFdhTQcwQ/BpxGsAzCUwRSCn4gJE5QV8uQxuAFlZEaoJAKrYrAHl38o6AAAAAElFTkSuQmCC");
ModAPI.meta.description("Library to make retexturing LCI items easier. Requires AsyncSink.");
(function LibRender() {
    function getLore(item) {
        if (item.$stackTagCompound && item.$stackTagCompound.$hasKey(ModAPI.util.str("display"), 10)) {
            var displayTag = item.$stackTagCompound.$getCompoundTag(ModAPI.util.str("display"));
            if (displayTag.$hasKey(ModAPI.util.str("Lore"), 9)) {
                var loreTag = displayTag.$getTag(ModAPI.util.str("Lore"));
                if (loreTag.$tagCount() > 0) {
                    return ModAPI.util.ustr(loreTag.$getStringTagAt(0));
                }
            }
        }
    }
    function cloneBaseModel(baseModel, newTexture) {
        var newBaseModelBuilder = ModAPI.reflect.getClassByName("SimpleBakedModel$Builder").constructors[0](0, 0, ModAPI.reflect.getClassByName("ItemCameraTransforms").constructors.find(x => x.length === 0)());
        var textureProp = ModAPI.util.getNearestProperty("$texture", newBaseModel);
    }

    ModAPI.events.newEvent("lib:libcustomrender:loaded");
    var ItemRenderer = ModAPI.minecraft.renderItem;
    var ItemModelMesher = ItemRenderer.itemModelMesher;
    var laxImgDataClass = ModAPI.reflect.getClassByName("ImageData").class;
    var makeLax1dudeImageData = ModAPI.reflect.getClassByName("ImageData").constructors.find(x => x.length === 3);
    var eaglerTextureAtlasSprite = (imageData, name) => {
        var atlas = ModAPI.reflect.getClassByName("EaglerTextureAtlasSprite").constructors[0](ModAPI.util.str(name));
        var alias = ModAPI.util.wrap(atlas);
        alias.loadSprite(ModAPI.util.makeArray(laxImgDataClass, [imageData]));
    };
    const LibCustomRender = {};
    LibCustomRender.map = {};
    LibCustomRender.addRetextureRule = (loreString, textureBuffer, baseItem) => {
        baseItem ||= "paper";
        var actualLoreStr = loreString;
        loreString = loreString.replaceAll(":", "_").toLowerCase().replace(/[^a-z_]/g, '');
        if (!(textureBuffer instanceof ImageData)) {
            return console.error("Texture for retexture rule is not an ArrayBuffer.");
        }
        if (!(typeof loreString === "string")) {
            return console.error("loreString for retexture rule is not a string.");
        }
        var baseModel = ItemModelMesher.simpleShapesCache.get(ModAPI.hooks.methods.jl_Integer_valueOf(ItemModelMesher.getIndex(ModAPI.items[baseItem].getRef(), 0)));
        LibCustomRender.map[loreString] = {
            meta_int: ModAPI.util.hashCode(loreString) % 256,
            lore: actualLoreStr,
            identifier: loreString,
            model: makeModelJSON(loreString)
        }
        var itemstack = ModAPI.reflect.getClassById("net.minecraft.item.ItemStack").constructors[5](ModAPI.items[baseItem].getRef(), 1, LibCustomRender.map[loreString].meta_int);
        LibCustomRender.map[loreString].stack = itemstack;
        ItemRenderer.registerItem0(ModAPI.items[baseItem].getRef(), LibCustomRender.map[loreString].meta_int, ModAPI.util.str(loreString));
    }

    // override
    // public IBakedModel getItemModel(ItemStack stack) {
    //     Item item = stack.getItem();
    // In ItemModelMesher.java

    var methods = Object.keys(ModAPI.hooks.methods);
    var prefix = ModAPI.util.getMethodFromPackage("net.minecraft.client.renderer.ItemModelMesher", "getItemModel");
    var methodName = methods.find(x => x.startsWith(prefix) && ModAPI.hooks.methods[x].length === 2);
    var original = ModAPI.hooks.methods[methodName];
    var testStack = ModAPI.reflect.getClassById("net.minecraft.item.ItemStack").constructors[5](ModAPI.items.paper.getRef(), 1, 0);
    ModAPI.hooks.methods[methodName] = function (...args) {
        var item = args[1];
        var lore = item ? getLore(item) : "";
        if (!item) {
            return original.apply(this, args);
        }
        var shouldOverride = false;
        var overrideItem = null;
        var overrideModelT = null;
        var overrides = Object.values(LibCustomRender.map);
        for (let i = 0; i < overrides.length; i++) {
            const override = overrides[i];
            if (lore === override.lore) {
                shouldOverride = true;
                overrideModelT = override.model;
                overrideItem = override.stack;
                break;
            }
        }
        if (shouldOverride) {
            return overrideModelT;
            return original.apply(this, [args[0], overrideItem]);
        }
        return original.apply(this, args);
    }

    ModAPI.events.callEvent("lib:libcustomrender:loaded", {});
    globalThis.LibCustomRender = LibCustomRender;
})();