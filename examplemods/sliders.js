(function Sliders() {
    ModAPI.meta.title("Sliders");
    ModAPI.meta.description("Remove the clamping on sliders.");
    ModAPI.meta.credits("By ZXMushroom63");

    const MathHelper_clamp_float = ModAPI.util.getMethodFromPackage("net.minecraft.util.MathHelper", "clamp_float");
    const GuiOptionSlider_mouseDragged = ModAPI.util.getMethodFromPackage("net.minecraft.client.gui.GuiOptionSlider", "mouseDragged");
    const GuiOptionSlider_mousePressed = ModAPI.util.getMethodFromPackage("net.minecraft.client.gui.GuiOptionSlider", "mousePressed");
    const GameSetting$Options_normalizeValue = ModAPI.util.getMethodFromPackage("net.minecraft.client.settings.GameSettings$Options", "normalizeValue");
    const GameSetting$Options_snapToStepClamp = ModAPI.util.getMethodFromPackage("net.minecraft.client.settings.GameSettings$Options", "snapToStepClamp");

    const GuiOptionSlider_mouseDragged_fn = ModAPI.hooks.methods[GuiOptionSlider_mouseDragged];
    const GuiOptionSlider_mousePressed_fn = ModAPI.hooks.methods[GuiOptionSlider_mousePressed];
    const GameSetting$Options_normalizeValue_fn = ModAPI.hooks.methods[GameSetting$Options_normalizeValue];
    const GameSetting$Options_snapToStepClamp_fn = ModAPI.hooks.methods[GameSetting$Options_snapToStepClamp];
    const MathHelper_clamp_float_fn = ModAPI.hooks.methods[MathHelper_clamp_float];

    const fakeClampMethod = (x)=>x;
    
    ModAPI.hooks.methods[GuiOptionSlider_mouseDragged] = function (...args) {
        ModAPI.hooks.methods[MathHelper_clamp_float] = fakeClampMethod;
        var ret = GuiOptionSlider_mouseDragged_fn.apply(this, args);
        ModAPI.hooks.methods[MathHelper_clamp_float] = MathHelper_clamp_float_fn;
        return ret;
    }

    ModAPI.hooks.methods[GuiOptionSlider_mousePressed] = function (...args) {
        ModAPI.hooks.methods[MathHelper_clamp_float] = fakeClampMethod;
        var ret = GuiOptionSlider_mousePressed_fn.apply(this, args);
        ModAPI.hooks.methods[MathHelper_clamp_float] = MathHelper_clamp_float_fn;
        return ret;
    }

    ModAPI.hooks.methods[GameSetting$Options_normalizeValue] = function (...args) {
        ModAPI.hooks.methods[MathHelper_clamp_float] = fakeClampMethod;
        var ret = GameSetting$Options_normalizeValue_fn.apply(this, args);
        ModAPI.hooks.methods[MathHelper_clamp_float] = MathHelper_clamp_float_fn;
        return ret;
    }

    // ModAPI.hooks.methods[GameSetting$Options_snapToStepClamp] = function (...args) {
    //     ModAPI.hooks.methods[MathHelper_clamp_float] = fakeClampMethod;
    //     var ret = GameSetting$Options_snapToStepClamp_fn.apply(this, args);
    //     ModAPI.hooks.methods[MathHelper_clamp_float] = MathHelper_clamp_float_fn;
    //     return ret;
    // }
})();