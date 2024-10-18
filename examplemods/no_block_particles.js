// Use ModAPI.util.getMethodFromPackage to find the internal name of the block destroy effect method
// and we replace it with our own function, that does nothing.
ModAPI.hooks.methods[
    ModAPI.util.getMethodFromPackage(
        "net.minecraft.client.particles.EffectRenderer",
        "addBlockDestroyEffects"
    )
] = () => {}