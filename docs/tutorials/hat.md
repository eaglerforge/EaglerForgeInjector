## /hat with ModAPI
/hat is a common server-side plugin that lets you put any block/item on your head. This tutorial will explain how to register a server-side command, construct a packet, and send it to a player.
[`S09PacketHeldItemChange` constructors]()


As always, start with the basic boilerplate IIFE with credits:
```javascript
(function HatMod() {
    ModAPI.meta.title("Hat Mod");
    ModAPI.meta.description("Use /hat to put anything on your head.");
    ModAPI.meta.credits("By <author_name>");
})();
```
In order to add a server side command, we need to:
- Write a function to run on the server.
- In this function, we'll add a listener to the [`processcommand` event](../apidoc/events.md#server-side-events)
- We'll check if the command is `/hat`
- If it is, we'll swap their head and current hand inventory slots, and send a network packet.
- Finally, the function from step 1 is thrown into [`ModAPI.dedicatedServer.appendCode`](../apidoc/dedicatedserver.md)

Here's the completed code:
```javascript
(function HatMod() {
    ModAPI.meta.title("Hat Mod");
    ModAPI.meta.description("Use /hat to put anything on your head.");
    ModAPI.meta.credits("By <author_name>");

    ModAPI.dedicatedServer.appendCode(function serverSideCode() {
        // Find the constructor for the held item change packet that has only one argument.
        // This will be used to notify the client that their hotbar has been updated.
        // Reference: https://nurmarvin.github.io/Minecraft-1.8-JavaDocs/net/minecraft/network/play/server/S09PacketHeldItemChange.html
        var S09PacketHeldItemChange_Constructor = ModAPI.reflect.getClassByName("S09PacketHeldItemChange").constructors.find(x => x.length === 1);

        //Add an event listener for when a command is processed on the server.
        ModAPI.addEventListener("processcommand", (event) => {
            // If the command starts with /hat
            if (event.command.toLowerCase().startsWith("/hat")) {
                // Exit if the sender isn't a player
                if (
                    !ModAPI.reflect.getClassById("net.minecraft.entity.player.EntityPlayerMP").instanceOf(
                        event.sender.getRef()
                    )
                ) {
                    return
                };

                // Get the current held item
                var heldItem = event.sender.inventory.getCurrentItem();

                // Get the contents of the helmet slot
                var armorItem = event.sender.inventory.armorInventory[3];

                // Get the inventory index of the current held item
                var hotbarIdx = event.sender.inventory.currentItem;

                // Set the helmet slot to heldItem.getRef() (raw java object) if heldItem exists, otherwise set it to null
                event.sender.inventory.armorInventory[3] = heldItem ? heldItem.getRef() : null;

                // Set the hotbar slot to the original value of the helmet slot if it has a value, otherwise set it to null
                event.sender.inventory.mainInventory[hotbarIdx] = armorItem ? armorItem.getRef() : null;

                // Make a packet to notify the client that the selected hotbar slot has been updated.
                event.sender.playerNetServerHandler.sendPacket(makePacketItemChange(hotbarIdx));

                // Prevent the 'unknown command' error
                event.preventDefault = true;
            }
        }
    });
})();
```