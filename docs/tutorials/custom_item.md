## Custom Item Tutorial with ModAPI
This tutorial will cover making custom items with ModAPI. It is recommended that you follow the [custom block tutorial](custom_block.md) first, as this tutorial is more fast-paced. The custom item we'll be adding will set the player's velocity to a random value when used, to demonstrate how methods can be overridden.

We'll begin with a constant item texture encoded into a data URI, as well as some metadata.
```javascript
(function CustomItemMod() {
    const itemTexture = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAKZJREFUOE9j/P//PxMDBIBoEP6HREOl4PLIciA2AyPIgMcM//7KgvWSDJjBBpx9/+YvJzc3Sbq12DhB6sEGsJ19/+YnmQawYhigzc7FcPXnN4KugbqAHWQAy9n3b34T4wJkw6EGYLqAoNVQBWS5ANlwZBfAvUCs/0EGkW0AzBKqGoCSDgh5A80F2KMRpAgfAKUT6kcjsfEPUycmKMQgy8AETkgUZWcAS3CPIf4oSPsAAAAASUVORK5CYII=";

    ModAPI.meta.title("Custom Item Mod");
    ModAPI.meta.icon(itemTexture);
    ModAPI.meta.description("it's a custom item. what more do you want");
    ModAPI.meta.credits("By <author_name>");
})();
```

Add a function that will contain the code to register the item called `CustomItem`. Inside it we'll do something really similar to the custom blocks tutorial, where we'll define a custom item class, and then register it (or, if on the server, wait until the `bootstrap` event fires). The reason it's contained in a function is to make the job of running the same code on the server and client easier.

```javascript
(function CustomItemMod() {
    //...

    function CustomItem() {
        var creativeMiscTab = ModAPI.reflect.getClassById("net.minecraft.creativetab.CreativeTabs").staticVariables.tabMisc; //chuck it in the miscellaneous category ig
        var itemClass = ModAPI.reflect.getClassById("net.minecraft.item.Item"); //Get the item class
        var itemSuper = ModAPI.reflect.getSuper(itemClass, (x) => x.length === 1); //Get the super() function of the item class that has a length of 1
        function CustomItem() {
            itemSuper(this); //Use super function to get block properties on this class.
            this.$setCreativeTab(creativeMiscTab); //Set the creative tab of the item to be the misc tab
        }
        ModAPI.reflect.prototypeStack(itemClass, CustomItem); // ModAPI equivalent of `extends` in java
        CustomItem.prototype.$onItemRightClick = function ($itemstack, $world, $player) { //example of how to override a method
            //use ModAPI.util.wrap to create a proxy of the player and the world without $ prefixes on the properties and methods
            var player = ModAPI.util.wrap($player);
            var world = ModAPI.util.wrap($world);

            if (!world.isRemote) { //If we are on the server
                // Math.random() returns a number from 0.0 to 1.0, so we subtract 0.5 and then multiply by 2 to make it become -1.0 to 1.0 instead
                player.motionX += (Math.random() - 0.5) * 3;
                player.motionZ += (Math.random() - 0.5) * 3;

                player.motionY += Math.random() * 1.5; // gravity is a thing, so no negative numbers here otherwise it'll be boring
            }
            
            return $itemstack;
        }

        // Internal registration function. This will be used to actually register the item on both the client and the server.
        function internal_reg() {
            // Construct an instance of the CustomItem, and set it's unlocalized name (translation id)
            var custom_item = (new CustomItem()).$setUnlocalizedName(
                ModAPI.util.str("custom_item")
            );
            //Register it using ModAPI.keygen() to get the item id.
            itemClass.staticMethods.registerItem.method(ModAPI.keygen.item("custom_item"), ModAPI.util.str("custom_item"), custom_item);

            //Expose it to ModAPI
            ModAPI.items["custom_item"] = custom_item;
            
            //return the instance.
            return custom_item;
        }

        //if the item global exists (and it will on the client), register the item and return the registered instance.
        if (ModAPI.items) {
            return internal_reg();
        } else {
            //Otherwise attatch the registration method to the bootstrap method.
            ModAPI.addEventListener("bootstrap", internal_reg);
        }
    }
})();
```

Now let's run the `CustomItem` function on the server and the client, and then use [AsyncSink](../../examplemods/AsyncSink.js) to create an in-memory resource pack to load item textures and models!
```javascript
(function CustomItemMod() {
    const itemTexture = "...";

    ModAPI.meta.title("Custom Item Mod");
    ModAPI.meta.icon(itemTexture);
    ModAPI.meta.description("it's a custom item. what more do you want");
    ModAPI.meta.credits("By <author_name>");

    function CustomItem() {
        // ...
    }

    // Run the function when the dedicated server loads.
    ModAPI.dedicatedServer.appendCode(CustomItem); 

    // Run the function on the client
    var custom_item = CustomItem();

    ModAPI.addEventListener("lib:asyncsink", async () => {
        ModAPI.addEventListener("lib:asyncsink:registeritems", (renderItem)=>{
            renderItem.registerItem(custom_item, ModAPI.util.str("custom_item"));
        });
        AsyncSink.L10N.set("item.custom_item.name", "Cool Custom Item");
        AsyncSink.setFile("resourcepacks/AsyncSinkLib/assets/minecraft/models/item/custom_item.json", JSON.stringify(
            {
                "parent": "builtin/generated",
                "textures": {
                    "layer0": "items/custom_item"
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
        AsyncSink.setFile("resourcepacks/AsyncSinkLib/assets/minecraft/textures/items/custom_item.png", await (await fetch(
            itemTexture
        )).arrayBuffer());
    });
})();
```

That's it! Upload your completed mod, run `.reload_tex` in chat in a singleplayer world and use your new item!\
[completed mod]()