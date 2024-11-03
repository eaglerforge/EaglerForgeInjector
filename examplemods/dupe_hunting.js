//utility function to return an array of GuiButtons from an array of JS objects, while automatically binding them
function button_utility_script(inputArr, bindingClass, actionBindMode) {
    // By ZXMushroom63
    // action bind mode:
    // 0 - bind to the same as the binding class
    // 1 - do not bind
    // 2 - bind to GuiScreen
    actionBindMode ||= 0;
    var button = ModAPI.reflect.getClassById("net.minecraft.client.gui.GuiButton").constructors.find(x => x.length === 6);
    var originalActionPerformed = ModAPI.hooks.methods[ModAPI.util.getMethodFromPackage(actionBindMode === 2 ? "net.minecraft.client.gui.GuiScreen" : bindingClass, "actionPerformed")];
    var originalInit = ModAPI.hooks.methods[ModAPI.util.getMethodFromPackage(bindingClass, "initGui")];
    var out = inputArr.flatMap(x => {
        var btn = button(x.uid, x.x, x.y, x.w, x.h, ModAPI.util.str(x.text));
        return btn;
    });
    if (actionBindMode !== 1) {
        ModAPI.hooks.methods[ModAPI.util.getMethodFromPackage(actionBindMode === 2 ? "net.minecraft.client.gui.GuiScreen" : bindingClass, "actionPerformed")] = function (...args) {
            var id = ModAPI.util.wrap(args[1]).getCorrective().id;
            var jsAction = inputArr.find(x => x.uid === id);
            if (jsAction) {
                jsAction.click(ModAPI.util.wrap(args[0]));
            }
            return originalActionPerformed.apply(this, args);
        }
    }
    ModAPI.hooks.methods[ModAPI.util.getMethodFromPackage(bindingClass, "initGui")] = function (...args) {
        originalInit.apply(this, args);
        var gui = ModAPI.util.wrap(args[0]).getCorrective();
        out.forEach(guiButton => {
            gui.buttonList.add(guiButton);
        });
    }
}


(() => {
    ModAPI.require("player");
    var backlog = [];
    var delayState = false;

    const originalSend = WebSocket.prototype.send;

    //Override WebSocket.send, so when eagler tries to send messages, it runs our code instead
    Object.defineProperty(WebSocket.prototype, 'send', {
        configurable: true,
        enumerable: false,
        writable: false,
        value: function (data) {
            //If blinking, push data to backlog along with it's websocket instance.
            if (delayState) {
                backlog.push({ data: data, thisArg: this });
            } else { //Else send the data as normal
                originalSend.call(this, data);
            }
        }
    });

    ModAPI.meta.title("Dupe Hunting");
    ModAPI.meta.description("⚠️Only works over WS, not local. May induce bans.⚠️");
    ModAPI.meta.credits("by ZXMushroom63");

    var dupeHuntButtons = [{
        text: "Silently Close",
        click: () => {
            ModAPI.minecraft.displayGuiScreen(null);
        },
        x: 0,
        y: 0,
        w: 100,
        h: 20,
        uid: 142715254
    },
    {
        text: "Toggle Delay",
        click: () => {
            delayState = !delayState;
            alert(delayState ? "Delay On" : "Sending Packets...");
            if (delayState === false) {
                for (let i = 0; i < backlog.length; i++) {
                    const backlogItem = backlog[i];
                    originalSend.call(backlogItem.thisArg, backlogItem.data);
                }
                backlog = [];
            }
        },
        x: 0,
        y: 20,
        w: 100,
        h: 20,
        uid: 142715253
    },
    {
        text: "Server Close",
        click: () => {
            var CloseWindow = ModAPI.reflect.getClassByName("C0DPacketCloseWindow").constructors[0];
            ModAPI.player.sendQueue.addToSendQueue(CloseWindow(ModAPI.player.openContainer.getCorrective().windowId));
        },
        x: 0,
        y: 40,
        w: 100,
        h: 20,
        uid: 142715252
    },
    {
        text: "Send & Disconnect",
        click: () => {
            delayState = false;
            for (let i = 0; i < backlog.length; i++) {
                const backlogItem = backlog[i];
                originalSend.call(backlogItem.thisArg, backlogItem.data);
            }
            backlog = [];
            ModAPI.mc.getNetHandler().getNetworkManager().doClientDisconnect(ModAPI.hooks._classMap[ModAPI.util.getCompiledName("net.minecraft.util.ChatComponentText")].constructors[0](ModAPI.util.str("Dupe Hunting Utils Disconnect")));
        },
        x: 0,
        y: 60,
        w: 100,
        h: 20,
        uid: 142715251
    },
    {
        text: "Use Chat",
        click: () => {
            var p = window.prompt("Input chat/command:", "Hello World");
            if (p) {
                ModAPI.player.sendChatMessage(ModAPI.util.str(p));
            }
        },
        x: 0,
        y: 80,
        w: 100,
        h: 20,
        uid: 142715250
    }];

    [
        "net.minecraft.client.gui.inventory.GuiInventory",
        "net.minecraft.client.gui.inventory.GuiContainerCreative",
        "net.minecraft.client.gui.inventory.GuiBeacon"
    ].forEach(ui => {
        button_utility_script(dupeHuntButtons, ui, 0);
    });
})();