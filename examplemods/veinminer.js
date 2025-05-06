(function TreeChopperMod() {
    ModAPI.meta.title("Vein Miner");
    ModAPI.meta.description("Vein-mines trees & ores while crouching. Press the 'config' button for settings.");
    ModAPI.meta.credits("By ZXMushroom63");
    ModAPI.meta.version("v1.0");
    globalThis.VEINMINERCONF = {
        doLogs: true,
        doOres: true,
        doGravel: false,
        doClay: false,
    };
    try {
        Object.assign(conf, JSON.parse(localStorage.getItem("trc_mod::conf") || "{}"));
    } catch (error) {
        //swallow
    }
    ModAPI.meta.config(() => {
        var conf = document.createElement("div");
        conf.innerHTML = `
        <h1>Vein Miner Settings&nbsp;<a href="javascript:void(0)" onclick="this.parentElement.parentElement.remove()" style="color:red">[X]</a></h1>
        <sub>Refresh page to apply settings</sub><br>
        <label>Veinmine Logs: </label><input type=checkbox ${VEINMINERCONF.doLogs ? "checked" : ""} oninput="VEINMINERCONF.doLogs = this.checked; this.parentElement.__save();"></input><br>
        <label>Veinmine Ores: </label><input type=checkbox ${VEINMINERCONF.doOres ? "checked" : ""} oninput="VEINMINERCONF.doOres = this.checked; this.parentElement.__save();"></input><br>
        <label>Veinmine Gravel: </label><input type=checkbox ${VEINMINERCONF.doGravel ? "checked" : ""} oninput="VEINMINERCONF.doGravel = this.checked; this.parentElement.__save();"></input><br>
        <label>Veinmine Clay: </label><input type=checkbox ${VEINMINERCONF.doClay ? "checked" : ""} oninput="VEINMINERCONF.doClay = this.checked; this.parentElement.__save();"></input><br>
        `;
        conf.style = "position: fixed; background-color: white; color: black; width: 100vw; height: 100vh; z-index: 256;top:0;left:0;";
        conf.__save = () => localStorage.setItem("trc_mod::conf", JSON.stringify(VEINMINERCONF));
        document.body.appendChild(conf);
    });

    ModAPI.dedicatedServer.appendCode(`globalThis.VEINMINERCONF = ${JSON.stringify(VEINMINERCONF)};`);

    ModAPI.dedicatedServer.appendCode(function () {
        ModAPI.addEventListener("bootstrap", () => {
            const axes = [ModAPI.items.iron_axe, ModAPI.items.stone_axe, ModAPI.items.golden_axe, ModAPI.items.wooden_axe, ModAPI.items.diamond_axe].map(x => x.getRef());
            const logs = ["log", "log2"].map(x => ModAPI.blocks[x].getRef());
            const targettedBlockIds = [];
            if (VEINMINERCONF.doLogs) {
                targettedBlockIds.push("log", "log2");
            }
            if (VEINMINERCONF.doOres) {
                targettedBlockIds.push("coal_ore", "gold_ore", "iron_ore", "lapis_ore", "quartz_ore", "diamond_ore", "emerald_ore", "redstone_ore", "lit_redstone_ore");
            }
            if (VEINMINERCONF.doGravel) {
                targettedBlockIds.push("gravel");
            }
            if (VEINMINERCONF.doClay) {
                targettedBlockIds.push("clay");
            }
            console.log(targettedBlockIds);
            const valid_log_blocks = targettedBlockIds.map(x => ModAPI.blocks[x].getRef());

            function stringifyBlockPos(blockPos) {
                return blockPos.x + "," + blockPos.y + "," + blockPos.z;
            }
            function getNeighbors(blockPos) {
                return [
                    //direct neighbors
                    blockPos.down(1),
                    blockPos.up(1),
                    blockPos.north(1),
                    blockPos.south(1),
                    blockPos.east(1),
                    blockPos.west(1),

                    //edges
                    blockPos.down(1).north(1),
                    blockPos.down(1).south(1),
                    blockPos.down(1).east(1),
                    blockPos.down(1).west(1),
                    blockPos.up(1).north(1),
                    blockPos.up(1).south(1),
                    blockPos.up(1).east(1),
                    blockPos.up(1).west(1),
                    blockPos.north(1).east(1),
                    blockPos.north(1).west(1),
                    blockPos.south(1).east(1),
                    blockPos.south(1).west(1),

                    //corners
                    blockPos.down(1).north(1).east(1),
                    blockPos.down(1).north(1).west(1),
                    blockPos.down(1).south(1).east(1),
                    blockPos.down(1).south(1).west(1),
                    blockPos.up(1).north(1).east(1),
                    blockPos.up(1).north(1).west(1),
                    blockPos.up(1).south(1).east(1),
                    blockPos.up(1).south(1).west(1),
                ];
            }
            async function getBlockGraph(blockPos, getBlockState, targetType) {
                const closed = [stringifyBlockPos(blockPos)];
                const logs = [];
                const open = [...getNeighbors(blockPos)];
                const maxIters = 120;
                var i = 0;
                while (open.length > 0 && i < maxIters) {
                    const target = open.pop();

                    closed.push(stringifyBlockPos(target));

                    i++;
                    const iBlockState = await getBlockState(target.getRef());
                    if (iBlockState.block.getRef() === targetType) {
                        logs.push(target);
                        open.push(...getNeighbors(target).filter(x => !closed.includes(stringifyBlockPos(x))));
                    }
                }
                return logs;
            }

            valid_log_blocks.forEach(b => {
                const originalHarvest = b.$harvestBlock;
                b.$harvestBlock = function ($theWorld, $player, $blockpos, $blockstate, $tileentity, ...args) {
                    const blockState = ModAPI.util.wrap($blockstate);
                    const player = ModAPI.util.wrap($player);
                    if (player.isSneaking() && !ModAPI.util.isCritical() && !(logs.includes(blockState.block.getRef()) && !axes.includes(player.inventory.mainInventory[player.inventory.currentItem]?.getCorrective()?.item?.getRef()))) {
                        ModAPI.promisify(async () => {
                            var world = ModAPI.util.wrap($theWorld);
                            var harvestCall = ModAPI.promisify(ModAPI.is_1_12 ? player.interactionManager.tryHarvestBlock : player.theItemInWorldManager.tryHarvestBlock);
                            const blocks = await getBlockGraph(ModAPI.util.wrap($blockpos), ModAPI.promisify(world.getBlockState), b);
                            for (let i = 0; i < blocks.length; i++) {
                                await harvestCall(blocks[i].getRef());
                            }
                        })();
                    }
                    originalHarvest.apply(this, [$theWorld, $player, $blockpos, $blockstate, $tileentity, ...args]);
                }
            });
        });
    });
})();