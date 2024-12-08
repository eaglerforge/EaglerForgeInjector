//THIS IS A DEMO MOD


//nice little utility function to fix the block identity map
function fixupBlockIds() {
    var blockRegistry = ModAPI.util.wrap(ModAPI.reflect.getClassById("net.minecraft.block.Block").staticVariables.blockRegistry).getCorrective();
    var BLOCK_STATE_IDS = ModAPI.util.wrap(ModAPI.reflect.getClassById("net.minecraft.block.Block").staticVariables.BLOCK_STATE_IDS).getCorrective();
    blockRegistry.registryObjects.hashTableKToV.forEach(entry => {
        if (entry) {
            var block = entry.value;
            var validStates = block.getBlockState().getValidStates();
            var stateArray = validStates.array || [validStates.element];
            stateArray.forEach(iblockstate => {
                var i = blockRegistry.getIDForObject(block.getRef()) << 4 | block.getMetaFromState(iblockstate.getRef());
                BLOCK_STATE_IDS.put(iblockstate.getRef(), i);
            });
        }
    });
}
function makeSteveBlock() {
    var blockClass = ModAPI.reflect.getClassById("net.minecraft.block.Block");
    var blockSuper = ModAPI.reflect.getSuper(blockClass, (x) => x.length === 2);
    var creativeBlockTab = ModAPI.reflect.getClassById("net.minecraft.creativetab.CreativeTabs").staticVariables.tabBlock;
    function nmb_BlockSteve() {
        blockSuper(this, ModAPI.materials.rock.getRef());
        this.$defaultBlockState = this.$blockState.$getBaseState();
		this.$setCreativeTab(creativeBlockTab);
    }
    ModAPI.reflect.prototypeStack(blockClass, nmb_BlockSteve);
    globalThis.nmb_BlockSteve = nmb_BlockSteve;
}
function registerSteveClientSide() {
    var itemClass = ModAPI.reflect.getClassById("net.minecraft.item.Item");
    var blockClass = ModAPI.reflect.getClassById("net.minecraft.block.Block");
    var block_of_steve = (new nmb_BlockSteve()).$setHardness(-1.0).$setStepSound(blockClass.staticVariables.soundTypeGravel).$setUnlocalizedName(
        ModAPI.util.str("steve")
    );
    blockClass.staticMethods.registerBlock0.method(
        ModAPI.keygen.block("steve"),
        ModAPI.util.str("steve"),
        block_of_steve
    );
    itemClass.staticMethods.registerItemBlock0.method(block_of_steve);
    ModAPI.addEventListener("lib:asyncsink", async () => {
        ModAPI.addEventListener("custom:asyncsink_reloaded", ()=>{
            ModAPI.mc.renderItem.registerBlock(block_of_steve, ModAPI.util.str("steve"));
        });
        AsyncSink.L10N.set("tile.steve.name", "Block Of Steve");
        AsyncSink.setFile("resourcepacks/AsyncSinkLib/assets/minecraft/models/block/steve.json", JSON.stringify(
            {
                "parent": "block/cube_all",
                "textures": {
                    "all": "blocks/steve"
                }
            }
        ));
        AsyncSink.setFile("resourcepacks/AsyncSinkLib/assets/minecraft/models/item/steve.json", JSON.stringify(
            {
                "parent": "block/steve",
                "display": {
                    "thirdperson": {
                        "rotation": [10, -45, 170],
                        "translation": [0, 1.5, -2.75],
                        "scale": [0.375, 0.375, 0.375]
                    }
                }
            }
        ));
        AsyncSink.setFile("resourcepacks/AsyncSinkLib/assets/minecraft/blockstates/steve.json", JSON.stringify(
            {
                "variants": {
                    "normal": [
                        { "model": "steve" },
                    ]
                }
            }
        ));
        AsyncSink.setFile("resourcepacks/AsyncSinkLib/assets/minecraft/textures/blocks/steve.png", await (await fetch(
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAE0SURBVDhPpdO9S8NAHMbxy3sVfJmMg6h7FRXXkkUUX0addSjo4OAfIDqLIoiLi3+BRRx0EIQOnV0EcVAIWkR0KIFgrcEktX6vcXD0nuE+5Afhnhw5bWy4qylaidOfVQhT0zFKYozjBHVdzi3TwCZvteaS/0fLD8oGf5OzTeyxNUyE3Ln2HmGctpuxKuS3wd76CgPHsrEj142NeojCkHsFry+4c3aJ6g1OtlZp0Ok4DD4i+Y2GIZ+DMMAhtw+fHu8xi3IDM9t5YfMQF71dLHo+ZjsfXbh4WtnH0vYaqp/BcXGGM3D7BxiYTi+el8uYZWm2gM/VB/Tfaqje4GB5iga2Jv+sUuUa5/ITmOXq7gbnC+MY1r9QvcHG9AgN0lRex1u/ilr7ehqWvBNZvMlRbESfqNhAiG/Pb1bHXpMbFgAAAABJRU5ErkJggg=="
        )).arrayBuffer());
    });
    ModAPI.blocks["steve"] = block_of_steve;
}
function registerSteveServerSide() {
    function fixupBlockIds() {
        var blockRegistry = ModAPI.util.wrap(ModAPI.reflect.getClassById("net.minecraft.block.Block").staticVariables.blockRegistry).getCorrective();
        var BLOCK_STATE_IDS = ModAPI.util.wrap(ModAPI.reflect.getClassById("net.minecraft.block.Block").staticVariables.BLOCK_STATE_IDS).getCorrective();
        blockRegistry.registryObjects.hashTableKToV.forEach(entry => {
            if (entry) {
                var block = entry.value;
                var validStates = block.getBlockState().getValidStates();
                var stateArray = validStates.array || [validStates.element];
                stateArray.forEach(iblockstate => {
                    var i = blockRegistry.getIDForObject(block.getRef()) << 4 | block.getMetaFromState(iblockstate.getRef());
                    BLOCK_STATE_IDS.put(iblockstate.getRef(), i);
                });
            }
        });
    }
    var blockClass = ModAPI.reflect.getClassById("net.minecraft.block.Block");
    var itemClass = ModAPI.reflect.getClassById("net.minecraft.item.Item");
    ModAPI.addEventListener("bootstrap", () => {
        var block_of_steve = (new nmb_BlockSteve()).$setHardness(-1.0).$setStepSound(blockClass.staticVariables.soundTypeGravel).$setUnlocalizedName(
            ModAPI.util.str("steve")
        );
        blockClass.staticMethods.registerBlock0.method(
            ModAPI.keygen.block("steve"), //use blockid 198. MAKE SURE TO CHANGE IF YOU ARE MAKING A MOD USING THIS, MAXIMUM BLOCK ID IS 4095.
            ModAPI.util.str("steve"),
            block_of_steve
        );
        itemClass.staticMethods.registerItemBlock0.method(block_of_steve);
        fixupBlockIds();
        ModAPI.blocks["steve"] = block_of_steve;
    });
}
ModAPI.dedicatedServer.appendCode(makeSteveBlock);
makeSteveBlock();
registerSteveClientSide();
fixupBlockIds();

ModAPI.dedicatedServer.appendCode(registerSteveServerSide);