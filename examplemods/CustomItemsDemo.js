//This mod also requires lib.customitems.js
ModAPI.addEventListener("lib:libcustomitems:loaded", () => {
    console.log("Registered my cool custom item.");
    LibCustomItems.registerItem({
        tag: "mymod:test_item_1",
        base: "magma_cream",
        name: "Custom Item",
        qty: 32,
        recipe: [
            "###",
            "# #",
            "###"
        ],
        recipeLegend: {
            "#": {
                "type": "block",
                "id": "dirt"
            }
        },
        onRightClickGround: `/*/user, world, itemstack, blockpos/*/
        itemstack.stackSize -= 1;
        if (itemstack.stackSize < 1) {
            user.inventory.mainInventory[user.inventory.currentItem] = null;
        }
        user.setHealth(2);
        `
    });
});