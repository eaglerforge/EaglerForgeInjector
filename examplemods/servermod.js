(function servermod() {
    ModAPI.meta.title("Server Manager");
    ModAPI.meta.version("a0");
    ModAPI.meta.description("_");
    ModAPI.meta.credits("ZXMushroom63 & radmanplays");


    const gui = document.createElement("div");
    gui.innerText = "EFSERVER CONSOLE";
    gui.style.background = "black";
    gui.style.fontFamily = "sans-serif";
    gui.style.zIndex = 254;
    gui.style.position = "fixed";
    gui.style.display = "none";
    gui.style.height = "calc(100vh - 1rem - 4px)";
    gui.style.overflowY = "scroll";
    gui.style.color = "white";
    gui.style.top = gui.style.left = gui.style.bottom = gui.style.right = 0;
    document.documentElement.appendChild(gui);

    var cmdbox = document.createElement("input");
    cmdbox.style.position = "absolute";
    cmdbox.style.left = "0";
    cmdbox.style.bottom = "0";
    cmdbox.style.right = "0";
    cmdbox.style.position = "inline-block";
    cmdbox.style.border = "0";
    cmdbox.style.borderTop = "2px solid white";
    cmdbox.style.background = "black";
    cmdbox.style.zIndex = 255;
    cmdbox.style.color = "white";
    cmdbox.style.height = "1rem";
    cmdbox.type = "text";
    cmdbox.addEventListener("keydown", (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
    }, true);
    cmdbox.addEventListener("keyup", (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (e.key === "Enter") {
            e.preventDefault();
            toServer("chat", cmdbox.value);
            cmdbox.value = "";
        }
    }, true);
    document.documentElement.appendChild(cmdbox);

    function worldUpdate() {
        if (ModAPI.mc && ModAPI.mc.theWorld) {
            ModAPI.hooks.methods.nmcs_GameSettings_saveOptions = ()=>{};
            ModAPI.settings.limitFramerate = 1;
            ModAPI.settings.enableVsync = 0;
            showgui();
            openSharedWorld()
        } else {
            hidegui();
        }
    }

    setInterval(() => {
        worldUpdate();
    }, 100);

    function showgui() {
        gui.style.opacity = "1";
        gui.style.display = "block";
        cmdbox.style.opacity = "1";
        cmdbox.style.display = "block";
    }
    function hidegui() {
        gui.style.opacity = "0";
        gui.style.display = "none";
        cmdbox.style.opacity = "0";
        cmdbox.style.display = "none";
    }

    function EFB2__defineExecCmdAsGlobal() {
        var getServer = ModAPI.reflect.getClassById("net.minecraft.server.MinecraftServer").staticMethods.getServer.method;
        globalThis.efb2__executeCommandAs = function efb2__executeCommandAs($commandsender, command, feedback) {
            var server = getServer();
            if (!server) { return };
            var commandManager = server.$commandManager;

            //lie a bit
            var x = $commandsender.$canCommandSenderUseCommand;
            $commandsender.$canCommandSenderUseCommand = () => 1;

            var y = $commandsender.$sendCommandFeedback;
            $commandsender.$sendCommandFeedback = feedback ? () => 1 : () => 0;

            try {
                commandManager.$executeCommand($commandsender, ModAPI.util.str(command));
            } catch (error) {
                console.error(error);
            }

            $commandsender.$canCommandSenderUseCommand = x;
            $commandsender.$sendCommandFeedback = y;
        }
    }
    ModAPI.dedicatedServer.appendCode(EFB2__defineExecCmdAsGlobal);

    ModAPI.hooks.methods.nmc_LoadingScreenRenderer_eaglerShow = ()=>{};
    var opening = false;
    function openSharedWorld() {
        var platform = ModAPI.reflect.getClassById("net.lax1dude.eaglercraft.v1_8.internal.PlatformWebRTC");
        if (!opening && ModAPI.mc.theWorld && !ModAPI.hooks.methods.nlevsl_LANServerController_isLANOpen()) {
            platform.staticVariables.rtcLANServer = ModAPI.reflect.getClassById("net.lax1dude.eaglercraft.v1_8.internal.PlatformWebRTC$LANServer").constructors[0]();
            var worldName = ModAPI.util.unstr(ModAPI.mc.thePlayer.getName().getRef()) + "'s World";
            opening = true;
            ModAPI.promisify(ModAPI.hooks.methods.nlevsl_LANServerController_shareToLAN)({
                $accept: (status)=>{
                    gui.innerText += "\n" + ModAPI.util.ustr(status);
                }
            }, ModAPI.util.str(worldName), 0).then(code => {
                opening = false;
                if (code != null) {
                    ModAPI.hooks.methods.nlevs_SingleplayerServerController_configureLAN(ModAPI.mc.playerController.currentGameType.getRef(), 0);
                    var msg = "code: " + ModAPI.util.ustr(code) + " relay: " + ModAPI.util.ustr(ModAPI.hooks.methods.nlevsl_LANServerController_getCurrentURI());
                    alert(msg);
                    gui.innerText += "\n" + msg;
                }
            });
        } else {
            return;
        }
    }


    /*
          NETWORKING OPCODES
          chat - bidirectional, send chat to server/client
      */

    function toServer(opcode, data) {
        client_comms_channel.postMessage({
            opcode: opcode,
            audience: "server",
            data: data,
        });
    }

    var token = crypto.randomUUID();
    const clientMessageHandlers = {
        chat: function (data) {
            if (gui.scrollHeight > (innerHeight * 5)) {
                gui.innerText = "Console cleared. Logs were over 5 pages long.";
            }
            gui.innerText += "\n" + data.replaceAll("§r", "");
            gui.scrollTop = gui.scrollHeight;
        },
    };
    var client_comms_channel = new BroadcastChannel("efserv:" + token);
    client_comms_channel.addEventListener("message", (ev) => {
        if (ev.data.audience !== "client") {
            return;
        }
        if (clientMessageHandlers[ev.data.opcode]) {
            clientMessageHandlers[ev.data.opcode](ev.data.data);
        }
    });
    ModAPI.dedicatedServer.appendCode(
        `globalThis.efhost_security_token = "${token}";`
    );
    ModAPI.dedicatedServer.appendCode(function () {
        var comms = new BroadcastChannel(
            "efserv:" + globalThis.efhost_security_token
        );

        function toClient(opcode, data) {
            comms.postMessage({
                opcode: opcode,
                audience: "client",
                data: data,
            });
        }

        function getHostPlayer() {
            var host = null;
            ModAPI.server.getRef().$worldServers.data.forEach((world) => {
                host ||= world.$playerEntities.$array1.data.find((player) => {
                    if (!player) {
                        return;
                    }
                    var nameKey = ModAPI.util.getNearestProperty(
                        player.$gameProfile,
                        "$name"
                    );
                    return ModAPI.util.ustr(player.$gameProfile[nameKey]) === "HOST";
                });
            });
            return host;
        }

        const messageHandlers = {
            chat: function (data) {
                var host = getHostPlayer();
                if (!host) {
                    return;
                }
                host.$addChatMessage = (comp)=>{toClient("chat", ModAPI.util.ustr(comp.$getUnformattedText()))};
                efb2__executeCommandAs(getHostPlayer(), data, true);
            },
        };

        comms.addEventListener("message", (ev) => {
            if (ev.data.audience !== "server") {
                return;
            }
            if (messageHandlers[ev.data.opcode]) {
                messageHandlers[ev.data.opcode](ev.data.data);
            }
        });

        var oldLog = ModAPI.hooks.methods.nlevl_Logger_log;
        ModAPI.hooks.methods.nlevl_Logger_log = function (...args) {
            toClient("chat", ModAPI.util.ustr(args[2]));
            return oldLog.apply(this, args);
        };

        ModAPI.addEventListener("tick", ()=>{
            var host = ModAPI.util.wrap(getHostPlayer());
            if (!host) {
                return;
            }
            host.posY = -10;
            host.posX = 0;
            host.posZ = 0;
            host.capabilities.disableDamage = 1;
            host.capabilities.isCreativeMode = 1;
            host.capabilities.isFlying = 1;
            host.motionY = 0;
            host.motionX = 0;
            host.motionZ = 0;
            host.isDead = 0;
            host.setHealth(20);
        });
    });



    function renameButton(array, originalName, newName) {
        array.find(
            (x) => ModAPI.util.ustr(x.displayString.getRef()) === originalName
        ).displayString = ModAPI.util.str(newName);
    }

    const mainmenuinit = ModAPI.hooks.methods.nmcg_GuiMainMenu_initGui;
    ModAPI.hooks.methods.nmcg_GuiMainMenu_initGui = function (...args) {
        var result = mainmenuinit.apply(this, args);
        var wrappedGuiObject = ModAPI.util.wrap(args[0], args[0], false, false);
        wrappedGuiObject.splashText = ModAPI.util.str("Server Hosting Mode");
        var btnarray = wrappedGuiObject.buttonList.array1;
        renameButton(btnarray, "Singleplayer", "Host Server");

        return result;
    };

    const GuiSelectWorldinit = ModAPI.hooks.methods.nmcg_GuiSelectWorld_initGui;
    ModAPI.hooks.methods.nmcg_GuiSelectWorld_initGui = function (...args) {
        var result = GuiSelectWorldinit.apply(this, args);
        var wrappedGuiObject = ModAPI.util.wrap(args[0], args[0], false, false);
        var btnarray = wrappedGuiObject.buttonList.array1.data;
        //renameButton(btnarray, "Create", "Create Server");

        return result;
    };

    const mainmenuactions = ModAPI.hooks.methods.nmcg_GuiMainMenu_actionPerformed;
    ModAPI.hooks.methods.nmcg_GuiMainMenu_actionPerformed = function (...args) {
        ModAPI.hooks.methods.nlevp_EaglerProfile_setName(ModAPI.util.str("HOST"));
        var idKey = ModAPI.util.getNearestProperty(args[1], "$id");
        var guiButtonid = args[1][idKey];
        var blockedIds = [2]; // put the blocked/disabled button ids in there
        if (blockedIds.includes(guiButtonid)) {
            return 0;
        }
        return mainmenuactions.apply(this, args);
    };

    // disable rendering
    ModAPI.hooks.methods.nmcr_EntityRenderer_renderWorld = () => { };
})();
