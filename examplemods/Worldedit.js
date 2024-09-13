//WIP worldedit by radmanplays

ModAPI.addEventListener("lib:libcustomitems:loaded", () => {
    console.log("Registered worldedit custom items.");
    LibCustomItems.registerItem({
        tag: "worldedit:wand",
        base: "wooden_axe",
        name: "Wand",
        qty: 1,
        recipe: [
            "   ",
            " # ",
            "   "
        ],
        recipeLegend: {
            "#": {
                "type": "item",
                "id": "wooden_axe"
            }
        },
        onRightClickGround: `/*/user, world, itemstack, blockpos/*/
        const prefix = "§7[§4worldedit§7] ";
        var username = ModAPI.util.str(user.getName());

        globalThis.pos2x = {}
        globalThis.pos2y = {}
        globalThis.pos2z = {}

        globalThis.pos2x[username] = blockpos.x;
        globalThis.pos2y[username] = blockpos.y;
        globalThis.pos2z[username] = blockpos.z;
        console.log("rightclick: " + blockpos.x + ", " + blockpos.y + ", " + blockpos.z);
        // Send chat message to player
        user.addChatMessage(ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](ModAPI.util.str(prefix + "Pos #2 set to: " + blockpos.x + ", " + blockpos.y + ", " + blockpos.z)));
        return true;
        `,
        onLeftClickGround: `/*/user, world, itemstack, blockpos/*/
        const prefix = "§7[§4worldedit§7] ";
        var username = ModAPI.util.str(user.getName());

        globalThis.posx = {}
        globalThis.posy = {}
        globalThis.posz = {}

        globalThis.posx[username] = blockpos.x;
        globalThis.posy[username] = blockpos.y;
        globalThis.posz[username] = blockpos.z;

        // Send chat message to player
        user.addChatMessage(ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](ModAPI.util.str(prefix + "Pos #1 set to: " + blockpos.x + ", " + blockpos.y + ", " + blockpos.z)));
        return true;
        `
    });
});

(() => {
    // Storing block changes for undo/redo
    const undoStack = {};
    const redoStack = {};

    PluginAPI.dedicatedServer.appendCode(function () {
        PluginAPI.addEventListener("processcommand", (event) => {
            if (!ModAPI.reflect.getClassById("net.minecraft.entity.player.EntityPlayerMP").instanceOf(event.sender.getRef())) { return }
            const prefix = "§7[§4worldedit§7] ";
            var blockPosConstructor = ModAPI.reflect.getClassById("net.minecraft.util.BlockPos").constructors.find((x) => { return x.length === 3 });
            var username = ModAPI.util.str(event.sender.getName());

            const storeUndo = (username, blocks) => {
                if (!undoStack[username]) undoStack[username] = [];
                undoStack[username].push(blocks);
                redoStack[username] = []; // Clear redo stack on new action
            };

            const performAction = (blocks, sender, reverse = false) => {
                blocks.forEach((blockInfo) => {
                    const blockPos = blockPosConstructor(blockInfo.x, blockInfo.y, blockInfo.z);
                    const block = reverse ? blockInfo.oldBlock : blockInfo.newBlock;
                    sender.getServerForPlayer().setBlockState(blockPos, block, 3);
                });
            };

            if (event.command.toLowerCase().startsWith("//wand")) {
                // Create a new ItemStack for the custom item
                const ItemStackClass = ModAPI.reflect.getClassById("net.minecraft.item.ItemStack");
                const itemStack = ItemStackClass.constructors[4](
                    ModAPI.items["wooden_axe"].getRef(), 1
                );
                
                // Create NBT data for the item
                const NBTTagCompoundClass = ModAPI.reflect.getClassById("net.minecraft.nbt.NBTTagCompound");
                itemStack.$stackTagCompound = NBTTagCompoundClass.constructors[0]();
                const displayTag = NBTTagCompoundClass.constructors[0]();
                itemStack.$stackTagCompound.$setTag(ModAPI.util.str("display"), displayTag);

                // Set item name
                displayTag.$setString(ModAPI.util.str("Name"), ModAPI.util.str("Wand"));

                // Set item lore
                var loreList = ModAPI.reflect.getClassById("net.minecraft.nbt.NBTTagList").constructors[0]();
                loreList.$appendTag(ModAPI.reflect.getClassById("net.minecraft.nbt.NBTTagString").constructors.filter(x => { return x.length === 1 })[0](ModAPI.util.str("worldedit:wand")));
                displayTag.$setTag(ModAPI.util.str("Lore"), loreList);

                // Add the item to the sender's inventory
                const player = event.sender;
                player.inventory.addItemStackToInventory(itemStack);

                // Notify the sender
                const ChatComponentTextClass = ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText");
                player.addChatMessage(ChatComponentTextClass.constructors[0](ModAPI.util.str(prefix + "A wand has been added to your inventory!")));
                player.addChatMessage(ChatComponentTextClass.constructors[0](ModAPI.util.str(prefix + "Left click: select pos #1; Right click: select pos #2")));
                
                event.preventDefault = true;
            }

            if (event.command.toLowerCase().startsWith("//set")) {
                const args = event.command.substring("//set ".length);

                if (args) {
                    const blockTypeName = args;
                    const x1 = globalThis.posx[username], y1 = globalThis.posy[username], z1 = globalThis.posz[username];
                    const x2 = globalThis.pos2x[username], y2 = globalThis.pos2y[username], z2 = globalThis.pos2z[username];

                    const blockType = ModAPI.blocks[blockTypeName];
                    if (!blockType) {
                        event.sender.addChatMessage(ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](ModAPI.util.str(prefix + `Invalid block: ${blockTypeName}`)));
                        event.preventPrevent = true;
                        return;
                    }

                    const block = blockType.getDefaultState().getRef();
                    const xMin = Math.min(x1, x2), xMax = Math.max(x1, x2);
                    const yMin = Math.min(y1, y2), yMax = Math.max(y1, y2);
                    const zMin = Math.min(z1, z2), zMax = Math.max(z1, z2);

                    let blockChanges = [];

                    for (let x = xMin; x <= xMax; x++) {
                        for (let y = yMin; y <= yMax; y++) {
                            for (let z = zMin; z <= zMax; z++) {
                                const blockPos = blockPosConstructor(x, y, z);
                                const oldBlock = event.sender.getServerForPlayer().getBlockState(blockPos);
                                blockChanges.push({ x, y, z, oldBlock, newBlock: block });
                                event.sender.getServerForPlayer().setBlockState(blockPos, block, 3);
                            }
                        }
                    }

                    storeUndo(username, blockChanges);
                    event.sender.addChatMessage(ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](ModAPI.util.str(prefix + `Set blocks to ${blockTypeName}`)));
                }
                event.preventDefault = true;
            }

            if (event.command.toLowerCase().startsWith("//walls")) {
                const args = event.command.substring("//walls ".length);

                if (args) {
                    const blockTypeName = args;
                    const x1 = globalThis.posx[username], y1 = globalThis.posy[username], z1 = globalThis.posz[username];
                    const x2 = globalThis.pos2x[username], y2 = globalThis.pos2y[username], z2 = globalThis.pos2z[username];

                    const blockType = ModAPI.blocks[blockTypeName];
                    if (!blockType) {
                        event.sender.addChatMessage(ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](ModAPI.util.str(prefix + `Invalid block: ${blockTypeName}`)));
                        event.preventDefault = true;
                        return;
                    }

                    const block = blockType.getDefaultState().getRef();
                    const xMin = Math.min(x1, x2), xMax = Math.max(x1, x2);
                    const yMin = Math.min(y1, y2), yMax = Math.max(y1, y2);
                    const zMin = Math.min(z1, z2), zMax = Math.max(z1, z2);

                    let blockChanges = [];

                    for (let x = xMin; x <= xMax; x++) {
                        for (let y = yMin; y <= yMax; y++) {
                            for (let z = zMin; z <= zMax; z++) {
                                if ((x === xMin || x === xMax || z === zMin || z === zMax) && y !== yMin && y !== yMax) {
                                    const blockPos = blockPosConstructor(x, y, z);
                                    const oldBlock = event.sender.getServerForPlayer().getBlockState(blockPos);
                                    blockChanges.push({ x, y, z, oldBlock, newBlock: block });
                                    event.sender.getServerForPlayer().setBlockState(blockPos, block, 3);
                                }
                            }
                        }
                    }

                    storeUndo(username, blockChanges);
                    event.sender.addChatMessage(ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](ModAPI.util.str(prefix + `Created walls with ${blockTypeName}`)));
                }
                event.preventDefault = true;
            }

            if (event.command.toLowerCase().startsWith("//undo")) {
                if (undoStack[username] && undoStack[username].length > 0) {
                    const lastAction = undoStack[username].pop();
                    redoStack[username].push(lastAction);
                    performAction(lastAction, event.sender, true); // Reverse the block changes
                    event.sender.addChatMessage(ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](ModAPI.util.str(prefix + `Undo successful`)));
                } else {
                    event.sender.addChatMessage(ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](ModAPI.util.str(prefix + `Nothing to undo`)));
                }
                event.preventDefault = true;
            }

            if (event.command.toLowerCase().startsWith("//redo")) {
                if (redoStack[username] && redoStack[username].length > 0) {
                    const lastUndoneAction = redoStack[username].pop();
                    undoStack[username].push(lastUndoneAction);
                    performAction(lastUndoneAction, event.sender); // Reapply the block changes
                    event.sender.addChatMessage(ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](ModAPI.util.str(prefix + `Redo successful`)));
                } else {
                    event.sender.addChatMessage(ModAPI.reflect.getClassById("net.minecraft.util.ChatComponentText").constructors[0](ModAPI.util.str(prefix + `Nothing to redo`)));
                }
                event.preventDefault = true;
            }
        });
    });
})();
