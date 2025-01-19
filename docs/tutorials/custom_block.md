## Custom Block Tutorial With ModAPI
This tutorial will show you how to make custom blocks with ModAPI. It will use my AsyncSink library to load the resources for the block.
We'll be making a block with the durability of dirt that explodes when broken.

As always, we'll start with the default boilerplate starter code:
```javascript
(function CustomBlock() {
    ModAPI.meta.title("Custom Block Demo");
    ModAPI.meta.version("v1.0");
    ModAPI.meta.description("Adds a block that blows up when used.");
    ModAPI.meta.credits("By <author_name>");
})();
```
Let's get our blocks texture done ahead of time.
In general, you use data URLs to store assets for mods. These are really inefficient, but this doesn't matter when the texture is 16x16 pixels. Make a texture (keep it nice and small) and convert it to a base64 data uri. I use [https://www.site24x7.com/tools/image-to-datauri.html](https://www.site24x7.com/tools/image-to-datauri.html) to convert my images.
Store this at the beginning of the function using a constant. Also use that constant to set the mod's icon.
```javascript
(function CustomBlock() {
    const texture = "data:image/png;base64,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";
    ModAPI.meta.title("Custom Block Demo");
    ModAPI.meta.version("v1.0");
    ModAPI.meta.description("Adds a block that blows up when used.");
    ModAPI.meta.credits("By <author_name>");

    ModAPI.meta.icon(texture);
})();
```
Let's start work on the part of registering the custom block that occurs on both the server and the client: making a class and registering it as both a `Block` and a `BlockItem`, and adding it to the creative inventory.
```javascript
function BlockRegistrationFunction() {
    //future code here
}
```

In the `BlockRegistrationFunction()` function, add this nested function, which we'll use later to fixup the blockmap after we register new blocks.
```javascript
function BlockRegistrationFunction() {
    function fixupBlockIds() { //function to correct ids for block states after registering a new item
        var blockRegistry = ModAPI.util.wrap(ModAPI.reflect.getClassById("net.minecraft.block.Block").staticVariables.blockRegistry).getCorrective(); //get the blockregistry, corrected for weird property suffixes
        var BLOCK_STATE_IDS = ModAPI.util.wrap(ModAPI.reflect.getClassById("net.minecraft.block.Block").staticVariables.BLOCK_STATE_IDS).getCorrective(); //get the BLOCK_STATE_IDS variable, also corrected for weird teavm suffixes
        blockRegistry.registryObjects.hashTableKToV.forEach(entry => { //Go through the key-to-value map entries of ID to Block
            if (entry) { //if the entry exists
                var block = entry.value; //get the block
                var validStates = block.getBlockState().getValidStates(); //get the blocks valid states
                var stateArray = validStates.array || [validStates.element]; //get the array of valid states. TeaVM will use .array when there are multiple values, and .element when there is only one. This just accounts for edge cases.
                stateArray.forEach(iblockstate => { //For each valid block state
                    var i = blockRegistry.getIDForObject(block.getRef()) << 4 | block.getMetaFromState(iblockstate.getRef()); //Do some bitwise math to get the id for that blockstate
                    BLOCK_STATE_IDS.put(iblockstate.getRef(), i); //Store it in the BLOCK_STATE_IDS map.
                });
            }
        });
    }
}
```
To make our own block, we'll need the following data:
- The `Item` class
- The `Block` class
- The `super()` function for the `Block` class;
- A `CreativeBlock` tab. I'll use `tabBlock`
Since I'll be doing the equivalent of `@Override`ing the `blockBreak` method in java (to make the block explode when broken), i'll need to get the `blockBreak` method. (java equivalent of `super.blockBreak()` in the overrided method.)

```javascript
function BlockRegistrationFunction() {
    function fixupBlockIds() {
        //...
    }

    var ItemClass = ModAPI.reflect.getClassById("net.minecraft.item.Item");
    var BlockClass = ModAPI.reflect.getClassById("net.minecraft.block.Block");
    
    var blockSuper = ModAPI.reflect.getSuper(blockClass, (x) => x.length === 2); //Get the super function for the block

    var creativeBlockTab = ModAPI.reflect.getClassById("net.minecraft.creativetab.CreativeTabs")
        .staticVariables
        .tabBlock; //The block tab in the creative inventory
        
    var breakBlockMethod = blockClass.methods.breakBlock.method; //Get the break block method

    //new code will go here
}
```
Next, we're going to define a regular javascript class using the [constructor function](https://www.w3schools.com/js/js_object_constructors.asp) syntax. Inside the function, we'll call the `blockSuper` function retrieved from `ModAPI.reflect.getSuper()`. We'll also need to manually set the default block state, and put our block into the correct creative tab. We also need to call a ModAPI function called `ModAPI.reflect.prototypeStack`, which emulates extending classes in Java/TeaVM.\
\
For this custom block, we're also going to override the `breakBlock` method for our custom block's class, and make it spawn an explosion when broken.
```javascript
function BlockRegistrationFunction() {
    // ...

    function MyCustomBlock() { //Define constructor function for our custom block
        blockSuper(this, ModAPI.materials.rock.getRef()); //Call block super function with the current MyCustomBlock instance, and the material we want to use.
        this.$defaultBlockState = this.$blockState.$getBaseState(); //Set the default block state
        this.$setCreativeTab(creativeBlockTab); //Set the creative tab to the creativeBlockTab variable from earlier.
    }
    ModAPI.reflect.prototypeStack(BlockClass, MyCustomBlock); //The equivalent of `MyCustomBlock extends Block` in Java.

    //Override the breakBlock function in the custom block's prototype
    //We are using a $ prefix because the method needs to be useable by TeaVM without ModAPI's intervention. The process is fairly standard, just put a $ before the actual method's name.
    //As for the $ in the arguments, I use that to represent a raw TeaVM object.
    MyCustomBlock.prototype.$breakBlock = function ($world, $blockpos, $blockstate) {
        var world = ModAPI.util.wrap($world); //Wrap the $world argument to make it easy to use without stupid $ prefixes
        var blockpos = ModAPI.util.wrap($blockpos); //Wrap the $blockpos argument to make it easy to use without stupid $ prefixes

        world.newExplosion(
            null, //Exploding entity. This would usually be a primed TNT or a creeper, but null is used when those aren't applicable.
            blockpos.getX() + 0.5, //The X position of the explosion.
            blockpos.getY() + 0.5, //The Y position of the explosion.
            blockpos.getZ() + 0.5, //The Z position of the explosion.
            9, //The explosion strength. For reference, 3=creeper, 6=charged creeper, 5=bed in nether/end
            1, //Should the ground be set on fire after the explosion. 1=yes, 0=no
            0 //Should the explosion have smoke particles. 1=yes, 0=no
        ); //Call the newExplosion method on the world.

        return breakBlockMethod(this, $world, $blockpos, $blockstate); //Call the original breakBlock method. ( Equivalent of `super.breakBlock(world, blockpos, blockstate);` )
    }

    // We'll add an internal registration function here
}
```

That's the block class done! Let's start writing the internal registration function, which will contain the code that actually registers our block with IDs and other important things. This is going to be a nested function, so we'll be defining it inside of `BlockRegistrationFunction`.
This function will do the following steps:
- Make an instance of our block.
- Register it as a Block using `ModAPI.keygen.block()` to get the block ID.
- Register it as a BlockItem.
- Use the `fixupBlockIds` function from earlier to clean up the block registry.
- Define it on the `ModAPI.blocks` global, so other mods can interact with the custom block.
- Return the block's instance, for future use.
After the function, we'll check if `ModAPI.materials` has been initialised. If it hasn't, we are on the server and we have to wait for the bootstrap event. Otherwise, we'll go ahead and register our block.

```javascript
function BlockRegistrationFunction() {
    // ...

    function MyCustomBlock() {
        //...
    }
    ModAPI.reflect.prototypeStack(BlockClass, MyCustomBlock);
    MyCustomBlock.prototype.$breakBlock = function ($world, $blockpos, $blockstate) {
        //...
    }

    function internalRegistration() {
        //Make an instance of the custom block
        var custom_block = (new MyCustomBlock())
            .$setHardness(3.0) //Set the block hardness. -1 is unbreakable, 0 is instant, 0.5 is dirt, 1.5 is stone.
            .$setStepSound(BlockClass.staticVariables.soundTypePiston) //Set the step sound. For some reason, the stone sounds are named `soundTypePiston`
            .$setUnlocalizedName(
                ModAPI.util.str("custom_block") //Set the translation ID. ModAPI.util.str() is used to convert it into a Java string
            );
        BlockClass.staticMethods.registerBlock0.method( //Use the registerBlock0 method to register the block.
            ModAPI.keygen.block("custom_block"), //Get a working numeric ID from a text block ID
            ModAPI.util.str("custom_block"), //The text block id
            custom_block //The custom block instance
        );
        ItemClass.staticMethods.registerItemBlock0.method(custom_block); //Register the block as a valid item in the inventory.
        fixupBlockIds(); //Call the fix up block IDs function to clean up the block state registry.
        ModAPI.blocks["custom_block"] = custom_block; //Define it onto the ModAPI.blocks global.
        
        return custom_block; //Return the function
    }

    if (ModAPI.materials) { // Check if ModAPI.materials has been initialised. If it isn't, we are on the server which loads after mods.
        return internalRegistration(); //We are on the client. Register our block and return the block's instance for texturing and model registration.
    } else {
        ModAPI.addEventListener("bootstrap", internalRegistration); //We are on the server. Attatch the internalRegistration function to the bootstrap event
    }
}
```
Let's finish off. We'll append the `BlockRegistrationFunction` to the server, and call it on the client. Then, we'll add a [library listener](../apidoc/events.md#using-library-load-events) to wait until the [AsyncSink](../../examplemods/AsyncSink.js) library loads.
When it's loaded, we'll:
- Add a AsyncSink reload listener that registers our block to `RenderItem`.
- Set the translated name
- Make an in-memory resource pack for the block model and textures
```javascript
(function CustomBlock() {
    const texture = "...";
    //...
    function BlockRegistrationFunction() {
        //...
    }

    ModAPI.dedicatedServer.appendCode(BlockRegistrationFunction); //Run the code on the server
    var custom_block = BlockRegistrationFunction(); //Get the registered block instance

    ModAPI.addEventListener("lib:asyncsink", async () => { //Add an asyncronous listener to AsyncSink loading.
        ModAPI.addEventListener("lib:asyncsink:registeritems", (renderItem)=>{
            //when asyncsink yells at us to register the custom block, register it
            renderItem.registerBlock(custom_block, ModAPI.util.str("custom_block"));
        });
        AsyncSink.L10N.set("tile.custom_block.name", "My Custom Block"); //Set the name of the block

        //Make an in-memory resource pack for the block. This is standard between, EaglerForge, Forge, Fabric, and NeoForge (pretty much any modding API)
        AsyncSink.setFile("resourcepacks/AsyncSinkLib/assets/minecraft/models/block/custom_block.json", JSON.stringify(
            {
                "parent": "block/cube_all",
                "textures": {
                    "all": "blocks/custom_block"
                }
            }
        ));
        AsyncSink.setFile("resourcepacks/AsyncSinkLib/assets/minecraft/models/item/custom_block.json", JSON.stringify(
            {
                "parent": "block/custom_block",
                "display": {
                    "thirdperson": {
                        "rotation": [10, -45, 170],
                        "translation": [0, 1.5, -2.75],
                        "scale": [0.375, 0.375, 0.375]
                    }
                }
            }
        ));
        AsyncSink.setFile("resourcepacks/AsyncSinkLib/assets/minecraft/blockstates/custom_block.json", JSON.stringify(
            {
                "variants": {
                    "normal": [
                        { "model": "custom_block" },
                    ]
                }
            }
        ));

        //Finally, fetch the texture and store it.
        AsyncSink.setFile("resourcepacks/AsyncSinkLib/assets/minecraft/textures/blocks/custom_block.png", await (await fetch(
            texture
        )).arrayBuffer());
    });
})();
```
And with that, we've finished the arduos process of registering a block with ModAPI! Load the complete mod into an EaglerForgeInjector build, along with [AsyncSink](../../examplemods/AsyncSink.js).

[Find the completed code here](../../examplemods/Tutorial_Custom_Block.js)