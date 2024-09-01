# EaglerForge Injector Architecture
The Injector has several layers (or steps) in it's patching process. These layers can be put into two seperate categories: pre-processing and post-processing. The injector patches the EaglercraftX build with the pre-processor ahead of time, and then the post-processor is appended to the EaglercraftX build.

## Preprocessing
The preprocessor's job is to find and hook into as many internal TeaVM / Minecraft methods as possible.

The first thing it does is it adds a piece of pre-initialisation code at the start of the TeaVM module, to define global varaibles such as `ModAPI` and `ModAPI.hooks`.

Then it:

Hooks into the `$rt_metadata` function, intercepting its arguments and storing them in the array `ModAPI.hooks._rippedData`.

Hooks into the the teavm threading shim and adds controls to freeze the callstack.

Looks for the `#game_frame` element, and then adds the post-processing codes after it (`modapi_postinit`, `modapi_modloader` and `modapi_guikit`). It also stores a copy of the `modapi_postinit` script into a fourth post init script, for the post-processing scripts to inject into the dedicated server.

Searches for constructors and appends them to the `ModAPI.hooks._rippedConstructors` dictionary.

Extracts and hooks into all class methods, storing their type (`instance` or `static`) into `ModAPI.hooks._rippedMethodTypeMap`, and storing the method itself in `ModAPI.hooks.methods`

Finds static class variables, and build a proxy object for them, to allow for readwrite access even though there is no way to expose their context. The keys for the static properties of a specific class are stored under `ModAPI.hooks._rippedStaticIndexer` and the proxy objects are stored in `ModAPI.hooks._rippedStaticProperties`.

Finally, it adds references (not hooks, as they would tank performance) to all TeaVM internal methods, most importantly `$rt_str` and `$rt_ustr`, used for interaction with jcl strings.

## Postprocessing
The post processor is much simpler than the preprocessor, but it effectively uses the data in `ModAPI.hooks` to create a (mostly) backwards compatible `ModAPI` global.