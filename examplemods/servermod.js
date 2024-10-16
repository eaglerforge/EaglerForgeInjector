(function servermod() {
    ModAPI.meta.title("Server Manager Mod Thingy");
    ModAPI.meta.version("a0");
    ModAPI.meta.description("_");
    ModAPI.meta.credits("ZXMushroom63 & radmanplays");


    const gui = document.createElement("div");
    gui.style.background = "black";
    gui.style.fontFamily = "sans-serif";
    gui.style.zIndex = 254;
    gui.style.position = "fixed";
    gui.style.display = "none";
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
        }
    }, true);
    document.documentElement.appendChild(cmdbox);

    function worldUpdate() {
        if (ModAPI.mc && ModAPI.mc.theWorld) {
            showgui();
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
            gui.innerText += data + "\n";
        },
    };
    var client_comms_channel = new BroadcastChannel("efserv:" + token);
    client_comms_channel.addEventListener("message", (ev)=>{
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
                ModAPI.hooks.methods.nmc_CommandHandler_executeCommand(
                    ModAPI.server.commandManager.getRef(),
                    getHostPlayer(),
                    ModAPI.util.str(data)
                ); //host has to use /say
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
