// This is an example mod on how to register an item.
(()=>{
    const itemTexture = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAKZJREFUOE9j/P//PxMDBIBoEP6HREOl4PLIciA2AyPIgMcM//7KgvWSDJjBBpx9/+YvJzc3Sbq12DhB6sEGsJ19/+YnmQawYhigzc7FcPXnN4KugbqAHWQAy9n3b34T4wJkw6EGYLqAoNVQBWS5ANlwZBfAvUCs/0EGkW0AzBKqGoCSDgh5A80F2KMRpAgfAKUT6kcjsfEPUycmKMQgy8AETkgUZWcAS3CPIf4oSPsAAAAASUVORK5CYII=";
    //this texture is really baad, so the item appears 2d in game.
    ModAPI.meta.title("Adding items demo.");
    ModAPI.meta.version("v1.0");
    ModAPI.meta.icon(itemTexture);
    ModAPI.meta.description("Requires AsyncSink.");

    function ExampleItem() {
        var creativeMiscTab = ModAPI.reflect.getClassById("net.minecraft.creativetab.CreativeTabs").staticVariables.tabMisc;
        var itemClass = ModAPI.reflect.getClassById("net.minecraft.item.Item");
        var itemSuper = ModAPI.reflect.getSuper(itemClass, (x) => x.length === 1);
        var nmi_ItemExample = function nmi_ItemExample() {
            itemSuper(this); //Use super function to get block properties on this class.
            this.$setCreativeTab(creativeMiscTab);
        }
        ModAPI.reflect.prototypeStack(itemClass, nmi_ItemExample);
        nmi_ItemExample.prototype.$onItemRightClick = function ($itemstack, $world, $player) { //example of how to override a method
            return $itemstack;
        }

        function internal_reg() {
            var example_item = (new nmi_ItemExample()).$setUnlocalizedName(
                ModAPI.util.str("exampleitem")
            );
            itemClass.staticMethods.registerItem0.method(432, ModAPI.util.str("exampleitem"), example_item);
            ModAPI.items["exampleitem"] = example_item;
            
            return example_item;
        }

        if (ModAPI.items) {
            return internal_reg();
        } else {
            ModAPI.addEventListener("bootstrap", internal_reg);
        }
    }

    ModAPI.dedicatedServer.appendCode(ExampleItem); 
    var example_item = ExampleItem();

    ModAPI.addEventListener("lib:asyncsink", async () => {
        ModAPI.addEventListener("custom:asyncsink_reloaded", ()=>{
            ModAPI.mc.renderItem.registerItem(example_item, ModAPI.util.str("exampleitem"));
        });
        AsyncSink.L10N.set("item.exampleitem.name", "Example Item");
        AsyncSink.setFile("resourcepacks/AsyncSinkLib/assets/minecraft/models/item/exampleitem.json", JSON.stringify(
            {
                "parent": "builtin/generated",
                "textures": {
                    "layer0": "items/exampleitem"
                },
                "display": {
                    "thirdperson": {
                        "rotation": [ -90, 0, 0 ],
                        "translation": [ 0, 1, -3 ],
                        "scale": [ 0.55, 0.55, 0.55 ]
                    },
                    "firstperson": {
                        "rotation": [ 0, -135, 25 ],
                        "translation": [ 0, 4, 2 ],
                        "scale": [ 1.7, 1.7, 1.7 ]
                    }
                }
            }
        ));
        AsyncSink.setFile("resourcepacks/AsyncSinkLib/assets/minecraft/textures/items/exampleitem.png", await (await fetch(
            itemTexture
        )).arrayBuffer());
    });
})();