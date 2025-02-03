(function DuckEntity() {
    ModAPI.meta.title("Duck Mod 🦆");
    ModAPI.meta.version("v1");
    ModAPI.meta.description("adds ducks to the game");
    ModAPI.meta.credits("By ZXMushroom63");
    function waitForRenderManager() {
        return new Promise((res, rej)=>{
            function check() {
                if (ModAPI.mc.renderManager) {
                    res();
                } else {
                    setTimeout(check, 1/20);
                }
            }
            check();
        });
    }
    function registerEntity() {
        ModAPI.hooks.methods.jl_String_format = ModAPI.hooks.methods.nlev_HString_format; //temporary thing to fix an issue in eaglercraft
        // Utils
        function AITask(name, length) {
            return ModAPI.reflect.getClassById("net.minecraft.entity.ai." + name).constructors.find(x => x.length === length);
        }
        const ResourceLocation = ModAPI.reflect.getClassByName("ResourceLocation").constructors.find(x => x.length === 1);
        const EntityPlayer = ModAPI.reflect.getClassByName("EntityPlayer");
        const GlStateManager = Object.fromEntries(Object.values(ModAPI.reflect.getClassByName("GlStateManager").staticMethods).map(x => [x.methodNameShort, x.method]));
        const SharedMonsterAttributes = ModAPI.reflect.getClassByName("SharedMonsterAttributes").staticVariables;

        // START CUSTOM ENTITY
        var entityClass = ModAPI.reflect.getClassById("net.minecraft.entity.passive.EntityAnimal");
        var entitySuper = ModAPI.reflect.getSuper(entityClass, (x) => x.length === 2);
        var nme_EntityDuck = function nme_EntityDuck($worldIn) {
            entitySuper(this, $worldIn);
            this.wrapped ||= ModAPI.util.wrap(this).getCorrective();
            this.wrapped.setSize(0.4, 0.7);
            this.wrapped.tasks.addTask(0, AITask("EntityAISwimming", 1)(this));
            this.wrapped.tasks.addTask(1, AITask("EntityAIPanic", 2)(this, 1.9));
            this.wrapped.tasks.addTask(2, AITask("EntityAIMate", 2)(this, 1.0));
            this.wrapped.tasks.addTask(3, AITask("EntityAITempt", 4)(this, 1.5, ModAPI.items.bread.getRef(), 0)); //won't cause a problem as the bread is obtained when the entity is constructed.
            this.wrapped.tasks.addTask(4, AITask("EntityAIFollowParent", 2)(this, 1.2));
            this.wrapped.tasks.addTask(5, AITask("EntityAIWander", 2)(this, 1.1));
            this.wrapped.tasks.addTask(6, AITask("EntityAIWatchClosest", 3)(this, ModAPI.util.asClass(EntityPlayer.class), 6));
            this.wrapped.tasks.addTask(7, AITask("EntityAILookIdle", 1)(this));
        }
        ModAPI.reflect.prototypeStack(entityClass, nme_EntityDuck);
        nme_EntityDuck.prototype.$getEyeHeight = function () {
            this.wrapped ||= ModAPI.util.wrap(this).getCorrective();
            return this.wrapped.height;
        }

        const originalApplyEntityAttributes = nme_EntityDuck.prototype.$applyEntityAttributes;
        nme_EntityDuck.prototype.$applyEntityAttributes = function () {
            this.wrapped ||= ModAPI.util.wrap(this).getCorrective();
            originalApplyEntityAttributes.apply(this, []);
            this.wrapped.getEntityAttribute(SharedMonsterAttributes.maxHealth).setBaseValue(5);
            this.wrapped.getEntityAttribute(SharedMonsterAttributes.movementSpeed).setBaseValue(0.25);
        }

        const originalLivingUpdate = nme_EntityDuck.prototype.$onLivingUpdate;
        nme_EntityDuck.prototype.$onLivingUpdate = function () {
            this.wrapped ||= ModAPI.util.wrap(this).getCorrective();
            originalLivingUpdate.apply(this, []);
            if (this.wrapped.isInWater()) {
                this.wrapped.motionY *= 0.5;
                this.wrapped.getEntityAttribute(SharedMonsterAttributes.movementSpeed).setBaseValue(1.4);
            } else {
                this.wrapped.getEntityAttribute(SharedMonsterAttributes.movementSpeed).setBaseValue(0.25);
            }
        }

        nme_EntityDuck.prototype.$getLivingSound = function () {
            return ModAPI.util.str("mob.duck.quack");
        }
        nme_EntityDuck.prototype.$getHurtSound = function () {
            return ModAPI.util.str("mob.duck.quack");
        }
        nme_EntityDuck.prototype.$getDeathSound = function () {
            return ModAPI.util.str("mob.duck.quack");
        }
        nme_EntityDuck.prototype.$playStepSound = function () {
            this.wrapped ||= ModAPI.util.wrap(this).getCorrective();
            this.wrapped.playSound(ModAPI.util.str("mob.duck.step"), 0.2, 1);
        }
        nme_EntityDuck.prototype.$getDropItem = function () {
            return ModAPI.items.feather.getRef();
        }
        nme_EntityDuck.prototype.$createChild = function (otherParent) {
            this.wrapped ||= ModAPI.util.wrap(this).getCorrective();
            return new nme_EntityDuck(this.wrapped.worldObj?.getRef() ?? null);
        }
        nme_EntityDuck.prototype.$isBreedingItem = function (itemstack) {
            return itemstack !== null && itemstack.$getItem() === ModAPI.items.bread.getRef();
        }
        // END CUSTOM ENTITY


        // START CUSTOM MODEL
        var modelChickenClass = ModAPI.reflect.getClassById("net.minecraft.client.model.ModelChicken");
        var modelChickenSuper = ModAPI.reflect.getSuper(modelChickenClass); //while super isn't used when extending this class, java implies the call.
        var nmcm_ModelDuck = function nmcm_ModelDuck() {
            modelChickenSuper(this);
        }
        ModAPI.reflect.prototypeStack(modelChickenClass, nmcm_ModelDuck);
        // END CUSTOM MODEL


        // START CUSTOM RENDERER
        var renderClass = ModAPI.reflect.getClassById("net.minecraft.client.renderer.entity.RenderLiving");
        var renderSuper = ModAPI.reflect.getSuper(renderClass, (x) => x.length === 4);
        const duckTextures = ResourceLocation(ModAPI.util.str("textures/entity/duck.png"));
        var nmcre_RenderDuck = function nmcre_RenderDuck(renderManager, modelBaseIn, shadowSizeIn) {
            renderSuper(this, renderManager, modelBaseIn, shadowSizeIn);
        }
        ModAPI.reflect.prototypeStack(renderClass, nmcre_RenderDuck);
        nmcre_RenderDuck.prototype.$getEntityTexture = function (entity) {
            return duckTextures;
        }
        nmcre_RenderDuck.prototype.$handleRotationFloat = function (entity, partialTicks) {
            entity = ModAPI.util.wrap(entity);
            if ((!entity.onGround) && (!entity.isInWater())) {
                return 2; //falling
            } else {
                return 0;
            }
        }

        const ID = ModAPI.keygen.entity("duck");
        ModAPI.reflect.getClassById("net.minecraft.entity.EntityList").staticMethods.addMapping0.method(
            ModAPI.util.asClass(nme_EntityDuck),
            {
                $createEntity: function ($worldIn) {
                    return new nme_EntityDuck($worldIn);
                }
            },
            ModAPI.util.str("Duck"),
            ID,
            0x5e3e2d, //egg base
            0x269166 //egg spots
        );

        const SpawnPlacementType = ModAPI.reflect.getClassById("net.minecraft.entity.EntityLiving$SpawnPlacementType").staticVariables;
        const ENTITY_PLACEMENTS = ModAPI.util.wrap(
            ModAPI.reflect.getClassById("net.minecraft.entity.EntitySpawnPlacementRegistry")
                .staticVariables.ENTITY_PLACEMENTS
        );
        ENTITY_PLACEMENTS.put(ModAPI.util.asClass(nme_EntityDuck), SpawnPlacementType.ON_GROUND);
        ModAPI.addEventListener('bootstrap', ()=>{
            const SpawnListEntry = ModAPI.reflect
                .getClassById("net.minecraft.world.biome.BiomeGenBase$SpawnListEntry")
                .constructors.find(x => x.length === 4);
            const BiomeGenSwamp = ModAPI.util.wrap(
                ModAPI.reflect.getClassById("net.minecraft.world.biome.BiomeGenBase")
                    .staticVariables.swampland
            );
            const BiomeGenRiver = ModAPI.util.wrap(
                ModAPI.reflect.getClassById("net.minecraft.world.biome.BiomeGenBase")
                    .staticVariables.river
            );
            const BiomeGenBeach = ModAPI.util.wrap(
                ModAPI.reflect.getClassById("net.minecraft.world.biome.BiomeGenBase")
                    .staticVariables.beach
            );
            const duckSpawnSwamp = SpawnListEntry(ModAPI.util.asClass(nme_EntityDuck), 22, 3, 5);
            const duckSpawnRiverBed = SpawnListEntry(ModAPI.util.asClass(nme_EntityDuck), 10, 5, 9);
            const duckSpawnBeach = SpawnListEntry(ModAPI.util.asClass(nme_EntityDuck), 24, 2, 3);
            BiomeGenSwamp.spawnableCreatureList.add(duckSpawnSwamp);
            BiomeGenRiver.spawnableCreatureList.add(duckSpawnRiverBed);
            BiomeGenBeach.spawnableCreatureList.add(duckSpawnBeach);
        });
        

        ModAPI.addEventListener("lib:asyncsink", async () => {
            AsyncSink.L10N.set("entity.Duck.name", "Duck");
        });


        return {
            EntityDuck: nme_EntityDuck,
            ModelDuck: nmcm_ModelDuck,
            RenderDuck: nmcre_RenderDuck,
            duckTextures: duckTextures
        }
    }

    ModAPI.dedicatedServer.appendCode(registerEntity);
    var data = registerEntity();

    ModAPI.addEventListener("lib:asyncsink", async () => {
        AsyncSink.setFile("resourcepacks/AsyncSinkLib/assets/minecraft/textures/entity/duck.png", await (await fetch(
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAgBAMAAABQs2O3AAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAACdQTFRFAAAALJBrKYdk1pcLp3UI4JEzL5pyaFY4AAAANa6BW0AjYUQlVTwhXohvWAAAAA10Uk5TAP///////////////y0EQa0AAADJSURBVHicY2RgVPj/gIGBwZhBkGEPkGb9zYACGBmYEv4tADKKj/CCFYT+3oCmgE3g1weQAQwQIzAUJLIyMACF9MA8kBEMASgqGIXYGl8ArbiPEEJToMbg8AdIz8OpIJGBFSTwCqcCIQYGfgb8VjDYoFqBChiBeDWYFYpbwSkwywy3ArDvGVyoZMVuVwJWrApDV7AaiQO05YwJuoJTSBwzbFbsQeK4UGzFIwaGf0wMDCE4rQDGGuN/BgZTnFZAFbiRZgUDATCqAAIA8Z45IRCQkrIAAAAASUVORK5CYII="
        )).arrayBuffer());
        AsyncSink.hideFile("resourcepacks/AsyncSinkLib/assets/minecraft/textures/entity/duck.png.mcmeta");

        await waitForRenderManager();

        AsyncSink.setFile("resourcepacks/AsyncSinkLib/assets/minecraft/sounds/mob/duck/quack.ogg", await (await fetch(
            "data:audio/ogg;base64,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Mdaaa869p9ZijLHWmnPuvQAAkwcHAKgEG2dYSTorHA0uNGQlAJAbAIAgxJhzzkEIIYQQQgghUoox5yCEEEIIIZRSSqQUY85BCCGEEEIIIYSMMeeggxBCCKWUUkopGWPOQQghhBBKKKWEEjrnoIMQQgmllFJKKaV0zjkIIYQQSimllFJK6SCEEEIIpZRSSimllNJBCCGEUEoppZRSSiklhBBCCKWUUkoppZRSSgghhBBKKaWUUkoppZQQQgillFJKKaWUUkopIYQQSimllFJKKaWUUkIIpZRSSimllFJKKaWEEEoppZRSSimllFJKCaGUUkoppZRSSimllBJKKaWUUkoppZRSSikllFJKKaWUUkoppZRSSiillFJKKaWUUkoppZRQSimllFJKKaWUUkopoZRSSimllFJKKaWUUgoAADpwAAAIMKLSQuw048ojcEQhwwRUaMhKACAcAABABDoIIYQQQggRcxBCCCGEEEKImIMQQgghhBBCCCGEEEIIpZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppRQAdZnhABg9YeMMK0lnhaPBhYasBADSAgAAYxhjjCnIpLMWY60NYxBCB52EFGqoJaaGMQghdFBKSi22WHMGoaRSSkktxliDzT2DUEoppaQWY605F+NBSCWl1GKrteccjO4glJJSSjHWmnPuvWjQSUmptVpz7j0HXzwIpaTWWow9Bx+MMKKUlmKssdYcfBFGGFFKSy3GmnvNvRhjhEopxlp7zrnnXIwRPqUWY6659x58LsL44mLMOffigw8+CGGMkDHm2HPwvRdjjA/CyFxzLsIY44swwvggbK25B1+MEUYYY3zvNfigezHCCCOMMcII3XPRRfhijDFGGF+EAQC5EQ4AiAtGElJnGVYaceMJGCKQQkNWAQAxAAAEMcYgpJBSSinFGGOMMcYYY4wxxhhjjDHGnGPOOeecAADABAcAgAAr2JVZWrVR3NRJXvRB4BM6YjMy5FIqZnIi6JEaarES7NAKbvACsNCQlQAAGQAA5KSUlFotGkLKQWk1iMgg5STFJCJjkILSgqeQMYhJyh1jCiEFqXbQMYUUoxpSCplS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"
        )).arrayBuffer());
        AsyncSink.Audio.register("mob.duck.quack", AsyncSink.Audio.Category.ANIMALS, [
            {
                path: "sounds/mob/duck/quack.ogg",
                pitch: 1,
                volume: 1,
                streaming: false //use for large audio files
            }
        ]);
        AsyncSink.setFile("resourcepacks/AsyncSinkLib/assets/minecraft/sounds/mob/duck/step.ogg", await (await fetch(
            "data:audio/ogg;base64,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LbZYa60159RajDHWmmvOvafWYoyx1ppz7r0AAJMHBwCoBBtnWEk6KxwNLjRkJQCQGwCAIMSYc85BCCGEEEIIIVKKMecghBBCCCGUUkqkFGPOQQghhBBCCCGEjDHnoIMQQgillFJKKRljzkEIIYQQSiilhBI656CDEEIJpZRSSimldM45CCGEEEoppZRSSukghBBCCKWUUkoppZTSQQghhFBKKaWUUkopJYQQQgillFJKKaWUUkoIIYQQSimllFJKKaWUEEIIpZRSSimllFJKKSGEEEoppZRSSimllFJCCKWUUkoppZRSSimlhBBKKaWUUkoppZRSSgmhlFJKKaWUUkoppZQSSimllFJKKaWUUkopJZRSSimllFJKKaWUUkoopZRSSimllFJKKaWUUEoppZRSSimllFJKKaGUUkoppZRSSimllFIKAAA6cAAACDCi0kLsNOPKI3BEIcMEVGjISgAgHAAAQAQ6CCGEEEIIEXMQQgghhBBCiJiDEEIIIYQQQgghhBBCCKWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaUUAHWZ4QAYPWHjDCtJZ4WjwYWGrAQA0gIAAGMYY4wpyKSzFmOtDWMQQgedhBRqqCWmhjEIIXRQSkottlhzBqGkUkpJLcZYg809g1BKKaWkFmOtORfjQUglpdRiq7XnHIzuIJSSUkox1ppz7r1o0ElJqbVac+49B188CKWk1lqMPQcfjDCilJZirLHWHHwRRhhRSkstxpp7zb0YY4RKKcZae86551yMET6lFmOuufcefC7C+OJizDn34oMPPghhjJAx5thz8L0XY4wPwshccy7CGOOLMML4IGytuQdfjBFGGGN87zX4oHsxwggjjDHCCN1z0UX4YowxRhhfhAEAuREOAIgLRhJSZxlWGnHjCRgikEJDVgEAMQAABDHGIKSQUkopxRhjjDHGGGOMMcYYY4wxxpxjzjnnnAAAwAQHAIAAK9iVWVq1UdzUSV70QeATOmIzMuRSKmZyIuiRGmqxEuzQCm7wArDQkJUAABkAAOSklJRaLRpCykFpNYjIIOUkxSQiY5CC0oKnkDGIScodYwohBal2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"
        )).arrayBuffer());
        AsyncSink.Audio.register("mob.duck.step", AsyncSink.Audio.Category.ANIMALS, [
            {
                path: "sounds/mob/duck/step.ogg",
                pitch: 1,
                volume: 1,
                streaming: false //use for large audio files
            }
        ]);

        ModAPI.mc.renderManager.entityRenderMap.put(ModAPI.util.asClass(data.EntityDuck), new data.RenderDuck(ModAPI.mc.renderManager.getRef(), new data.ModelDuck(), 0.3));
        ModAPI.promisify(ModAPI.mc.renderEngine.bindTexture)(data.duckTextures).then(() => {
            console.log("Loaded duck texture into cache.");
        });
    });
})();