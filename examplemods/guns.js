(()=>{
    const itemTexture = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADySURBVFhH7ZQxDoMwDEVNr4G6VmJC6mk4Itdh7VpxjsBPDaKVCLZxypInIccg5zs/CVQoKAj8uHLjeETouo6HvlQcU3yJ932PIKkTceRAFH8NA6dE3IzbVogdQBOPtuVXfk5IJ8jWhKY4SxPaQvcmLEWuTUj/A1sqiEEcTQBENDWjvh3mvZtxccLiwMqvE0DrhNUBCCy1KSdAUsPiwFYcpM5ENrYWh3tdI4cT4dk0MSKPXzMSRSC+PMi14mcO4e7esv2iJqyHEGDVPCR6jyMC5luERXOfuoY7QFi8MKsDe6tXk8OBv7Ge/E96DZeKFwoOEE1wUX7TFh5zsgAAAABJRU5ErkJggg==";
    ModAPI.meta.title("guns");
    ModAPI.meta.version("v1.0");
    ModAPI.meta.icon(itemTexture);
    ModAPI.meta.description("Requires AsyncSink.");

    function PistolItem() {
        var recoilSpeed = 0; //recoil controller
        var DamageSourceClass = ModAPI.reflect.getClassByName("DamageSource");
        var creativeMiscTab = ModAPI.reflect.getClassById("net.minecraft.creativetab.CreativeTabs").staticVariables.tabMisc;
        var itemClass = ModAPI.reflect.getClassById("net.minecraft.item.Item");
        var itemSuper = ModAPI.reflect.getSuper(itemClass, (x) => x.length === 1);
        var nmi_ItemPistol = function nmi_ItemPistol() {
            itemSuper(this); //Use super function to get block properties on this class.
            this.$setCreativeTab(creativeMiscTab);
        }

        ModAPI.addEventListener("update", ()=>{ //recoil update loop (client)
            ModAPI.player.rotationPitch -= recoilSpeed;
            recoilSpeed *= 0.7;
        });

        function entityRayCast(player, world, range) {
            const HEADSHOT_MAX_DISTANCE_FROM_HEAD = 0.72;
            var eyePosition = player.getPositionEyes(0.0);
            var targetPosition = player.rayTrace(range, 0).hitVec;
            var entities = world.getEntitiesWithinAABBExcludingEntity(
                player.getRef(),
                player.getEntityBoundingBox().expand(range, range, range).getRef()
            ).getCorrective().array;
            var closestEntity = null;
            var isHeadshot = false;
            var closestDistance = range;

            // Iterate through all entities to find the one the player is looking at
            for (var i = 0; i < entities.length; i++) {
                if (!entities[i]) {
                    continue;
                }
                var entity = entities[i];

                // Check if the entity's bounding box intersects with the player's ray
                var entityBB = entity.getEntityBoundingBox().expand(0.3, 0.3, 0.3);
                var intercept = entityBB.calculateIntercept(eyePosition.getRef(), targetPosition.getRef());

                if (intercept != null) {
                    var distance = eyePosition.distanceTo(intercept.hitVec.getRef());
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestEntity = entity;
                        isHeadshot = entity.getPositionEyes(0.0).distanceTo(intercept.hitVec.getRef()) < HEADSHOT_MAX_DISTANCE_FROM_HEAD;
                    }
                }
            }

            var rayTraceResult = closestEntity;
            if (rayTraceResult != null){
                return {entity: rayTraceResult, headshot: isHeadshot};
            } else{
                return null;
            }
        }
        ModAPI.reflect.prototypeStack(itemClass, nmi_ItemPistol);
        nmi_ItemPistol.prototype.$onItemRightClick = function ($itemstack, $world, $player) {
            var cactus = DamageSourceClass.staticVariables.cactus;
            var world = ModAPI.util.wrap($world);
            var entityplayer = ModAPI.util.wrap($player);
            var shotentitydata = entityRayCast(entityplayer, world, 16.0);
            if (shotentitydata != null){
                if (world.isRemote) {
                    recoilSpeed += 4;
                } else {
                    shotentitydata.entity.attackEntityFrom(cactus, 10 + (16 * shotentitydata.headshot));
                    if (shotentitydata.headshot) {
                        console.log("H E A D S H O T");
                    }
                    world.playSoundAtEntity(entityplayer.getRef(), ModAPI.util.str("tile.piston.out"), 1.0, 1.8);
                }
            } else if (!world.isRemote) {
                world.playSoundAtEntity(entityplayer.getRef(), ModAPI.util.str("random.click"), 1.0, 1.8);
            }
            return $itemstack;
        }

        function internal_reg() {
            var pistol_item = (new nmi_ItemPistol()).$setUnlocalizedName(
                ModAPI.util.str("pistol")
            ).$setMaxStackSize(1);
            itemClass.staticMethods.registerItem.method(ModAPI.keygen.item("pistol"), ModAPI.util.str("pistol"), pistol_item);
            ModAPI.items["pistol"] = pistol_item;
            
            return pistol_item;
        }

        if (ModAPI.items) {
            return internal_reg();
        } else {
            ModAPI.addEventListener("bootstrap", internal_reg);
        }
    }

    ModAPI.dedicatedServer.appendCode(PistolItem); 
    var pistol_item = PistolItem();

    ModAPI.addEventListener("lib:asyncsink", async () => {
        ModAPI.addEventListener("custom:asyncsink_reloaded", ()=>{
            ModAPI.mc.renderItem.registerItem(pistol_item, ModAPI.util.str("pistol"));
        });
        AsyncSink.L10N.set("item.pistol.name", "Pistol");
        AsyncSink.setFile("resourcepacks/AsyncSinkLib/assets/minecraft/models/item/pistol.json", JSON.stringify(
            {
                "parent": "builtin/generated",
                "textures": {
                    "layer0": "items/pistol"
                },
                "display": {
                    "thirdperson": {
                        "rotation": [ 5, 80, -45 ],
                        "translation": [ 0, 1, -3 ],
                        "scale": [ 1.0, 1.0, 1.0 ]
                    },
                    "firstperson": {
                        "rotation": [ 0, -135, 25 ],
                        "translation": [ 0, 4, 2 ],
                        "scale": [ 1.8, 1.8, 1.8 ]
                    }
                }
            }
        ));
        AsyncSink.setFile("resourcepacks/AsyncSinkLib/assets/minecraft/textures/items/pistol.png", await (await fetch(
            itemTexture
        )).arrayBuffer());
    });
})();