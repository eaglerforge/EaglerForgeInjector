//NOT FUNCTIONAL
ModAPI.meta.title("Advanced VClip Exploit");
ModAPI.meta.description("Use .vclip <offset> to vertically phase through blocks with custom packet handling.");
ModAPI.meta.credits("By radmanplays");

// Custom syntax error function
function syntaxError() {
    ModAPI.displayToChat("[AdvancedVClip] Syntax error: Usage is .vclip <offset>");
}

ModAPI.require("player");
ModAPI.addEventListener("sendchatmessage", (ev) => {
    var msg = ev.message.toLowerCase();
    if (msg.startsWith(".vclip")) {
        ev.preventDefault == true;

        var args = msg.split(" ");
        if (args.length != 2) {
            syntaxError();
            return;
        }

        var offset = parseFloat(args[1]);
        if (isNaN(offset)) {
            syntaxError();
            return;
        }

        var packetsRequired = Math.ceil(Math.abs(offset / 10));
        if (packetsRequired > 20) {
            packetsRequired = 1; // Limit to avoid server kicking for too many packets
        }

        var player = ModAPI.player;
        var ridingEntity = player.ridingEntity;

        if (ridingEntity != null) {
            // Player is riding an entity
            for (var packetNumber = 0; packetNumber < (packetsRequired - 1); packetNumber++) {
                // Simulate entity movement
                ridingEntity.posY += offset / packetsRequired; // Move a fraction of the total offset
                ModAPI.network.addToSendQueue({
                    "action": "RIDING_JUMP", // Simulate a riding jump action
                    "entityId": ridingEntity.getEntityId(),
                });
            }

            // Final move
            ridingEntity.posY += offset / packetsRequired;
            ModAPI.network.addToSendQueue({
                "action": "RIDING_JUMP",
                "entityId": ridingEntity.getEntityId(),
            });

        } else {
            // Player is not riding any entity
            for (var packetNumber = 0; packetNumber < (packetsRequired - 1); packetNumber++) {
                ModAPI.network.addToSendQueue({
                    "x": player.posX,
                    "y": player.posY,
                    "z": player.posZ,
                    "onGround": true
                });
            }

            // Final move
            ModAPI.network.addToSendQueue({
                "x": player.posX,
                "y": player.posY + offset,
                "z": player.posZ,
                "onGround": true
            });

            // Set the player’s final position
            player.setPosition(player.posX, player.posY + offset, player.posZ);
        }

        ModAPI.displayToChat("[AdvancedVClip] VClipped " + offset + " blocks.");
    }
});
