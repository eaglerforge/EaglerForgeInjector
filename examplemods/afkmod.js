(function AntiAFKMod() {
    ModAPI.meta.title("Anti AFK Mod");
    ModAPI.meta.credits("By ZXMushroom63");
    ModAPI.meta.description("Type .afk in game chat to toggle the mod");
    ModAPI.require("player");
    var active = null;
    function queueJump() {
        try {
            ModAPI.player.jump();
        } catch (error) {
            
        }
        active = setTimeout(queueJump, 15000 + (10000 * Math.random()));
    }
    ModAPI.addEventListener("sendchatmessage", (e)=>{
        if (e.message.toLowerCase() === ".afk") {
            if (active === null) {
                queueJump();
                ModAPI.displayToChat("Activated anti-afk mod!\nI recommend using the sliders mod to decrease your max fps to save battery.");
            } else {
                clearTimeout(active);
                active = null;
                ModAPI.displayToChat("Deactivated anti-afk mod.");
            }
            e.preventDefault = true;
        }
    });
})();