(()=>{
    const unluckyBlockTexture = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAOhJREFUOE9jnJn2/z8DGvj4koHh9UOIoKg8AwO/OLoKBJ8RZED6LEbcKvDIzEz7z8DY5f//f9lGTANCGTAcxrCaAVUd2IBSg///uy+gSqBr/sJwF+6O7QwqcHaXPxYXgDTDNCArtmXYBtZ4mMELbkCpwX8GjDDwZLjD8IXhFopCkA5s4mAXEBOIMC+BXIbsKnAYEDIAOTywBiI+A0DO5mFQBvsZXTNIjKALQAHHw6CG4mzkZIE3HYAUEjIAHIjY0gGxyRIcjfgMgIUBNv+DLAEbgCspgxTAYgCXAUSnA1xegscCPj8TytoAA5eEOx9BbCgAAAAASUVORK5CYII=";
    ModAPI.meta.title("Unlucky Blocks");
    ModAPI.meta.version("v1.0");
    ModAPI.meta.description("These purple cubes ruined my life. Requires AsyncSink.");
    ModAPI.meta.credits("By ZXMushroom63");
    ModAPI.meta.icon(unluckyBlockTexture);

    function UnluckyBlocks() {
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
        var itemClass = ModAPI.reflect.getClassById("net.minecraft.item.Item");
        var blockClass = ModAPI.reflect.getClassById("net.minecraft.block.Block");
        var blockSuper = ModAPI.reflect.getSuper(blockClass, (x) => x.length === 2); //Get super function from the block class with a target length of two. ($this (mandatory), material (optional))
        var creativeBlockTab = ModAPI.reflect.getClassById("net.minecraft.creativetab.CreativeTabs").staticVariables.tabBlock;
        var breakBlockMethod = blockClass.methods.breakBlock.method;
        function nmb_BlockUnlucky() {
            blockSuper(this, ModAPI.materials.rock.getRef()); //Use super function to get block properties on this class.
            this.$defaultBlockState = this.$blockState.$getBaseState();
            this.$setCreativeTab(creativeBlockTab);
        }
        ModAPI.reflect.prototypeStack(blockClass, nmb_BlockUnlucky);
        nmb_BlockUnlucky.prototype.$breakBlock = function ($world, $blockpos, $blockstate) {
            var world = ModAPI.util.wrap($world);
            var blockpos = ModAPI.util.wrap($blockpos);
            if (Math.random() < 1) { //was gonna add random events but couldn't be bothered. Enjoy exploding!
                world.newExplosion(null, blockpos.getX() + 0.5, blockpos.getY() + 0.5,
					blockpos.getZ() + 0.5, 9, 1, 1);
            }
            return breakBlockMethod(this, $world, $blockpos, $blockstate);
        }

        function internal_reg() {
            var block_of_unluckiness = (new nmb_BlockUnlucky()).$setHardness(0.0).$setStepSound(blockClass.staticVariables.soundTypePiston).$setUnlocalizedName(
                ModAPI.util.str("unluckiness")
            );
            blockClass.staticMethods.registerBlock0.method(
                ModAPI.keygen.block("unluckiness"),
                ModAPI.util.str("unluckiness"),
                block_of_unluckiness
            );
            itemClass.staticMethods.registerItemBlock0.method(block_of_unluckiness);
            fixupBlockIds();
            ModAPI.blocks["unluckiness"] = block_of_unluckiness;
            
            return block_of_unluckiness;
        }

        const WorldGenMineable = ModAPI.reflect.getClassById("net.minecraft.world.gen.feature.WorldGenMinable").constructors.find(x=>x.length===2);

        const BiomeDecorator_decorate = ModAPI.util.getMethodFromPackage("net.minecraft.world.biome.BiomeDecorator", "decorate");
        const oldDecorate = ModAPI.hooks.methods[BiomeDecorator_decorate];
        ModAPI.hooks.methods[BiomeDecorator_decorate] = function ($this, $world, $random, $biomeGenBase, $blockpos) {
            if (!$this.$currentWorld) {
                $this.$unluckyBlockGen = WorldGenMineable(ModAPI.blocks.unluckiness.getDefaultState().getRef(), 4);
            }
            return oldDecorate.apply(this, [$this, $world, $random, $biomeGenBase, $blockpos]);
        }

        const BiomeDecorator_generateOres = ModAPI.util.getMethodFromPackage("net.minecraft.world.biome.BiomeDecorator", "generateOres");
        const oldGenerateOres = ModAPI.hooks.methods[BiomeDecorator_generateOres];
        ModAPI.hooks.methods[BiomeDecorator_generateOres] = function ($this) {
            $this.$genStandardOre1(105, $this.$unluckyBlockGen || null, 0, 256);
            return oldGenerateOres.apply(this, [$this]);
        }

        if (ModAPI.materials) {
            return internal_reg();
        } else {
            ModAPI.addEventListener("bootstrap", internal_reg);
        }
    }
    ModAPI.dedicatedServer.appendCode(UnluckyBlocks);
    var block_of_unluckiness = UnluckyBlocks();
    ModAPI.addEventListener("lib:asyncsink", async () => {
        ModAPI.addEventListener("custom:asyncsink_reloaded", ()=>{
            ModAPI.mc.renderItem.registerBlock(block_of_unluckiness, ModAPI.util.str("unluckiness"));
        });
        AsyncSink.L10N.set("tile.unluckiness.name", "Unlucky Block");
        AsyncSink.setFile("resourcepacks/AsyncSinkLib/assets/minecraft/models/block/unluckiness.json", JSON.stringify(
            {
                "parent": "block/cube_all",
                "textures": {
                    "all": "blocks/unluckiness"
                }
            }
        ));
        AsyncSink.setFile("resourcepacks/AsyncSinkLib/assets/minecraft/models/item/unluckiness.json", JSON.stringify(
            {
                "parent": "block/unluckiness",
                "display": {
                    "thirdperson": {
                        "rotation": [10, -45, 170],
                        "translation": [0, 1.5, -2.75],
                        "scale": [0.375, 0.375, 0.375]
                    }
                }
            }
        ));
        AsyncSink.setFile("resourcepacks/AsyncSinkLib/assets/minecraft/blockstates/unluckiness.json", JSON.stringify(
            {
                "variants": {
                    "normal": [
                        { "model": "unluckiness" },
                    ]
                }
            }
        ));
        AsyncSink.setFile("resourcepacks/AsyncSinkLib/assets/minecraft/textures/blocks/unluckiness.png", await (await fetch(
            unluckyBlockTexture
        )).arrayBuffer());
    });
})();