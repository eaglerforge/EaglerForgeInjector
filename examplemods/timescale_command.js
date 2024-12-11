(() => {
    ModAPI.meta.title("Timescale Command");
    ModAPI.meta.description("/timescale 0.5 to halve the speed of time");
    ModAPI.meta.credits("By ZXMushroom63");
    PluginAPI.addEventListener("sendchatmessage", (event) => {
        if (event.message.toLowerCase().startsWith("/timescale")) {
            var speed = parseFloat(event.message.split(" ")[1]);
            if (!speed) {
                speed = 1;
                PluginAPI.mc.timer.timerSpeed = 1;
            } else {
                if (speed < 1) {
                    speed = 1 / Math.round(1 / speed);
                } else {
                    speed = Math.round(speed);
                }
                PluginAPI.mc.timer.timerSpeed = speed;
            }
            PluginAPI.displayToChat("[Timescale] Set world timescale to " + speed.toFixed(2) + ".");
        }
    });
    PluginAPI.dedicatedServer.appendCode(function () {
        globalThis.timeScale = 1n;
        globalThis.timeScaleDividing = false;
        PluginAPI.addEventListener("processcommand", (event) => {
            if (event.command.toLowerCase().startsWith("/timescale")) {
                var speed = parseFloat(event.command.split(" ")[1]);
                if (!speed) {
                    globalThis.timeScale = 1n;
                    globalThis.timeScaleDividing = false;
                } else {
                    if (speed < 1) {
                        globalThis.timeScaleDividing = true;
                        globalThis.timeScale = BigInt(Math.round(1 / speed));
                    } else {
                        globalThis.timeScaleDividing = false;
                        globalThis.timeScale = BigInt(Math.round(speed));
                    }
                }
                if (ModAPI.server) {
                    ModAPI.server.currentTime = PluginAPI.hooks.methods[ModAPI.util.getMethodFromPackage("net.minecraft.server.MinecraftServer", "getCurrentTimeMillis")]();
                }
                event.preventDefault = true;
            }
        });
        const original_getCurrentTime = ModAPI.hooks.methods[ModAPI.util.getMethodFromPackage("net.minecraft.server.MinecraftServer", "getCurrentTimeMillis")];
        PluginAPI.hooks.methods[ModAPI.util.getMethodFromPackage("net.minecraft.server.MinecraftServer", "getCurrentTimeMillis")] = function () {
            if (globalThis.timeScaleDividing) {
                return original_getCurrentTime() / globalThis.timeScale;
            } else {
                return original_getCurrentTime() * globalThis.timeScale;
            }
        };
    });
})();