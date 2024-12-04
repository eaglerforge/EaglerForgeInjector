## Slippery Mod with ModAPI
In this tutorial you will learn how to modify properties of blocks, and run the code that does this on both the dedicated server and the client.

We'll begin with the basic boilerplate mod code:
```javascript
(function SlipperyMod() {
    ModAPI.meta.title("Slippery Mod");
    ModAPI.meta.description("Makes everything turn into ice.");
    ModAPI.meta.credits("By <author_name>");

    //New code will go here!
})();
```

Let's write the client side part of the code first.
- We'll get the keys for the ModAPI.blocks object (ids of each block) using [`Object.keys()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys)
- Then, we'll loop over those keys, and modify their respective block to be as slippery as ice.
```javascript
var blockKeys = Object.keys(ModAPI.blocks);

blockKeys.forEach(key => { //for each key (block id)
    //make sure the block has a slipperiness property
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
    if(ModAPI.blocks[key]?.slipperiness) {
        ModAPI.blocks[key].slipperiness = 0.98; //Set the slipperiness value of the block at that key to 0.98
    }
});
```

Your code should now look like this:
```javascript
(function SlipperyMod() {
    ModAPI.meta.title("Slippery Mod");
    ModAPI.meta.description("Makes everything turn into ice.");
    ModAPI.meta.credits("By <author_name>");

    var blockKeys = Object.keys(ModAPI.blocks);
    blockKeys.forEach(key => {
        if(ModAPI.blocks[key]?.slipperiness) {
            ModAPI.blocks[key].slipperiness = 0.98;
        }
    });
})();
```

Your code should now look like this:
```javascript
(function SlipperyMod() {
    ModAPI.meta.title("Slippery Mod");
    ModAPI.meta.description("Makes everything turn into ice.");
    ModAPI.meta.credits("By <author_name>");

    var blockKeys = Object.keys(ModAPI.blocks);
    blockKeys.forEach(key => {
        if(ModAPI.blocks[key]?.slipperiness) {
            ModAPI.blocks[key].slipperiness = 0.98;
        }
    });

    //dedicated server code will be added here
})();
```

Currently this only runs on the client meaning in singleplayer, when you throw an item or punch a sheep, it still won't slide. Only you will.

We'll have to duplicate the code to run on the server using [`ModAPI.dedicatedServer`](../apidoc/dedicatedserver.md).
We also have to run the code after the `serverstart` event, as on the server, `ModAPI.blocks` is only created when it is needed.
```javascript
ModAPI.dedicatedServer.appendCode(function () {
    //Code in here cannot reference outside variables.
    ModAPI.addEventListener("serverstart", function () {
        var blockKeys = Object.keys(ModAPI.blocks);
        blockKeys.forEach(key => {
            if(ModAPI.blocks[key]?.slipperiness) {
                ModAPI.blocks[key].slipperiness = 0.98;
            }
        });
    });
});
```

let's add this to the final mod, and we'll be finished!
```javascript
(function SlipperyMod() {
    ModAPI.meta.title("Slippery Mod");
    ModAPI.meta.description("Makes everything turn into ice.");
    ModAPI.meta.credits("By <author_name>");

    var blockKeys = Object.keys(ModAPI.blocks);
    blockKeys.forEach(key => {
        if(ModAPI.blocks[key]?.slipperiness) {
            ModAPI.blocks[key].slipperiness = 0.98;
        }
    });

    ModAPI.dedicatedServer.appendCode(function () {
        //Code in here cannot reference outside variables.
        ModAPI.addEventListener("serverstart", function () {
            var blockKeys = Object.keys(ModAPI.blocks);
            blockKeys.forEach(key => {
                if(ModAPI.blocks[key]?.slipperiness) {
                    ModAPI.blocks[key].slipperiness = 0.98;
                }
            });
        });
    });
})();
```