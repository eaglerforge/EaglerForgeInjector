ModAPI.meta.title("LibCustomRender");
ModAPI.meta.credits("By ZXMushroom63");
ModAPI.meta.icon("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAQdJREFUOE9jZGBg+M9AAWAEGbBl2QmyjPCJsmAgaABbdybc8F+l01EswmsATONXLi4GYSkpBgZ+foY1O3cyuHWuhhuC1QBkjf///QMrFtHWZmD4+BHDEBQDUGzU1ITb8ubqVZyGoBjwsCONQYqXl0FYU5MBpAlsKxRgM+STUwoDhgG66upgZ4IAuiEooRcXx/DpCRuqAU97shg0jYzgfsVpSFwcg5mZGcOedRewGDBhAgPDokUohsBthmoE8U+dOoXdBfHHjoElUQxB03i9oABspnTJNFQXgARB3oAbwsAAdirMRmSNMFdhTQcwQ/BpxGsAzCUwRSCn4gJE5QV8uQxuAFlZEaoJAKrYrAHl38o6AAAAAElFTkSuQmCC");
ModAPI.meta.description("Library to make retexturing LCI items easier. Requires AsyncSink.");
(async function LibRender() {
    function waitUntilPropertyExists(obj, prop) {
        return new Promise((res, rej)=>{
            var timer = setInterval(()=>{
                if (obj[prop]) {
                    clearInterval(timer);
                    res();
                }
            }, 50);
        });
    }
    function rgbaToInt(red, green, blue, alpha) {
        return (alpha << 24) | (red << 16) | (green << 8) | blue;
    }
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
    function recursiveAssign(target, patch) {
        var keys = Object.keys(patch);
        keys.forEach(k => {
            if (typeof patch[k] === "object" && patch[k]) {
                recursiveAssign(target[k], patch[k]);
            } else if (typeof patch[k] === "number") {
                target[k] = patch[k];
            }
        });
    }
    function cloneBaseModel(baseModel, newTexture, texName) {
        var newBaseModelBuilder = ModAPI.reflect.getClassByName("SimpleBakedModel$Builder").constructors[0](0, 0, ModAPI.reflect.getClassByName("ItemCameraTransforms").constructors.find(x => x.length === 0)());
        newBaseModelBuilder.$builderTexture = eaglerTextureAtlasSprite(imageDataToLaxImgData(newTexture), ModAPI.util.str(texName));
        var newBaseModel = ModAPI.hooks.methods.nmcrm_SimpleBakedModel$Builder_makeBakedModel(newBaseModelBuilder);
        newBaseModel.$generalQuads = baseModel.$generalQuads.$clone();
        newBaseModel.$faceQuads = baseModel.$faceQuads.$clone();
        var cameraTransformsId = ModAPI.util.getNearestProperty(newBaseModel, "$cameraTransforms");
        recursiveAssign(newBaseModel[cameraTransformsId], baseModel[cameraTransformsId]);
        return newBaseModel;
    }

    ModAPI.events.newEvent("lib:libcustomrender:loaded");
    await waitUntilPropertyExists(ModAPI.minecraft, "renderItem");
    var ItemRenderer = ModAPI.minecraft.renderItem;
    var ItemModelMesher = ItemRenderer.itemModelMesher;
    var laxImgDataClass = ModAPI.reflect.getClassByName("ImageData").class;
    var makeLax1dudeImageData = ModAPI.reflect.getClassByName("ImageData").constructors.find(x => x.length === 4);
    var eaglerTextureAtlasSprite = (imageData, name) => {
        var atlas = ModAPI.reflect.getClassByName("EaglerTextureAtlasSprite").constructors[0](ModAPI.util.str(name));
        var alias = ModAPI.util.wrap(atlas);
        alias.loadSprite(ModAPI.util.makeArray(laxImgDataClass, [imageData]), null);
        return atlas;
    };

    /**
     * @type {ImageData}
     */
    function imageDataToLaxImgData(imageData) {
        const { data, width, height } = imageData;
        const intArray = [];

        for (let i = 0; i < data.length; i += 4) {
            const red = data[i];
            const green = data[i + 1];
            const blue = data[i + 2];
            const alpha = data[i + 3];
            intArray.push(rgbaToInt(red, green, blue, alpha));
        }

        return makeLax1dudeImageData(width, height, ModAPI.array.int(intArray), 1);
    }
    const LibCustomRender = {};
    LibCustomRender.map = {};
    LibCustomRender.addRetextureRule = (loreString, textureBuffer, baseItem) => {
        baseItem ||= "paper";
        var actualLoreStr = loreString;
        loreString = loreString.replaceAll(":", "_").toLowerCase().replace(/[^a-z_]/g, '');
        if (!(textureBuffer instanceof ImageData)) {
            return console.error("Texture for retexture rule is not an ImageData.");
        }
        if (!(typeof loreString === "string")) {
            return console.error("loreString for retexture rule is not a string.");
        }
        var baseModel = ItemModelMesher.simpleShapesCache.get(ModAPI.hooks.methods.jl_Integer_valueOf(ItemModelMesher.getIndex(ModAPI.items[baseItem].getRef(), 0)));
        LibCustomRender.map[loreString] = {
            lore: actualLoreStr,
            identifier: loreString,
            model: cloneBaseModel(baseModel.getRef(), textureBuffer, loreString)
        }
        return LibCustomRender.map[loreString].model;
    }

    // override
    // public IBakedModel getItemModel(ItemStack stack) {
    //     Item item = stack.getItem();
    // In ItemModelMesher.java

    var methods = Object.keys(ModAPI.hooks.methods);
    var prefix = ModAPI.util.getMethodFromPackage("net.minecraft.client.renderer.ItemModelMesher", "getItemModel");
    var methodName = methods.find(x => x.startsWith(prefix) && ModAPI.hooks.methods[x].length === 2);
    var original = ModAPI.hooks.methods[methodName];
    ModAPI.hooks.methods[methodName] = function (...args) {
        var item = args[1];
        var lore = item ? getLore(item) : "";
        if (!item) {
            return original.apply(this, args);
        }
        var overrides = Object.values(LibCustomRender.map);
        for (let i = 0; i < overrides.length; i++) {
            const override = overrides[i];
            if (lore === override.lore) {
                return override.model;
            }
        }
        return original.apply(this, args);
    }

    ModAPI.events.callEvent("lib:libcustomrender:loaded", {});
    globalThis.LibCustomRender = LibCustomRender;
})();
//LibCustomRender.addRetextureRule("mymod:test_item_1", new ImageData(1, 1));