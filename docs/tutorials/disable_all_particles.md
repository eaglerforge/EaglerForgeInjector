## Disable All Particles
Particles in minecraft are really laggy, and there's a large chance you may want to disable them to boost your FPS when breaking blocks.

Let's look through the Eaglercraft 1.8 source code to find where particles are rendered. We can do this with a global search for `particle`. You'll find a lot of hits in the `EffectRenderer` class in the `net.minecraft.client.particle` package. We methods we'll want to patch are:
- `renderParticles`
- `addEffect`
- `addBlockDestroyEffects`
- `hasParticlesInAlphaLayer`

For the first 3 methods, you can see that they are defined something like:
```java
    public void renderParticles() {
        // render particles code.
    }
```
The `void` in `public void` means that it does not expect a return value.
Using [`ModAPI.util.getMethodFromPackage`](../apidoc/utils.md) we can find the compiled method name, and look for it in [`ModAPI.hooks.methods`](../apidoc/hooks.md#property-modapihooksmethods).

```javascript
(function NoParticles() {
    //Basic, boilerplate code
    ModAPI.meta.title("No Particles");
    ModAPI.meta.description("Disables all particles in game");
    ModAPI.meta.credits("By <developer name>");

    ModAPI.hooks.methods[
        ModAPI.util.getMethodFromPackage("net.minecraft.client.particle.EffectRenderer", "renderParticles")
    ] = function () {}; //Override renderParticles in EffectRenderer to an empty function that does nothing.
})();
```

We can also do this for `addEffect` and `addBlockDestroyEffects`.

```javascript
(function NoParticles() {
    //Basic, boilerplate code
    ModAPI.meta.title("No Particles");
    ModAPI.meta.description("Disables all particles in game");
    ModAPI.meta.credits("By <developer name>");

    ModAPI.hooks.methods[
        ModAPI.util.getMethodFromPackage("net.minecraft.client.particle.EffectRenderer", "renderParticles")
    ] = function () {}; //Override renderParticles in EffectRenderer with an empty function that does nothing.

    ModAPI.hooks.methods[
        ModAPI.util.getMethodFromPackage("net.minecraft.client.particle.EffectRenderer", "addEffect")
    ] = function () {}; //Override addEffect in EffectRenderer with an empty function that does nothing.

    ModAPI.hooks.methods[
        ModAPI.util.getMethodFromPackage("net.minecraft.client.particle.EffectRenderer", "addBlockDestroyEffects")
    ] = function () {}; //Override addBlockDestroyEffects in EffectRenderer with an empty function that does nothing.
})();
```

For `hasParticlesInAlphaLayer`, it doesn't use `void`, but instead a `boolean`.
```java
    public boolean hasParticlesInAlphaLayer() {
        // hasParticlesInAlphaLayer code.
    }
```
When TeaVM translates booleans, it converts booleans to integers:
- `false` turns into `0`
- `true` turns into `1`

So when we override `hasParticlesInAlphaLayer`, we'll need to return a `0` or a `1`. Since we want the game to thing that there aren't any particles in the alpha layer, we'll return `0` (false).

```javascript
(function NoParticles() {
    //Basic, boilerplate code
    ModAPI.meta.title("No Particles");
    ModAPI.meta.description("Disables all particles in game");
    ModAPI.meta.credits("By <developer name>");

    ModAPI.hooks.methods[
        ModAPI.util.getMethodFromPackage("net.minecraft.client.particle.EffectRenderer", "renderParticles")
    ] = function () {}; //Override renderParticles in EffectRenderer with an empty function that does nothing.

    ModAPI.hooks.methods[
        ModAPI.util.getMethodFromPackage("net.minecraft.client.particle.EffectRenderer", "addEffect")
    ] = function () {}; //Override addEffect in EffectRenderer with an empty function that does nothing.

    ModAPI.hooks.methods[
        ModAPI.util.getMethodFromPackage("net.minecraft.client.particle.EffectRenderer", "addBlockDestroyEffects")
    ] = function () {}; //Override addBlockDestroyEffects in EffectRenderer with an empty function that does nothing.

    ModAPI.hooks.methods[
        ModAPI.util.getMethodFromPackage("net.minecraft.client.particle.EffectRenderer", "hasParticlesInAlphaLayer")
    ] = function () {return 0}; //Override hasParticlesInAlphaLayer in EffectRenderer with a function that returns 0.
})();
```