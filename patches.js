class PatchesRegistry {
    static patchFns = []
    static patchedEventNames = []
    static getEventInjectorCode() {
        return "globalThis.modapi_specialevents = [" + PatchesRegistry.patchedEventNames.flatMap(x=>`\`${x}\``).join(",") + "]"
    }
    static addPatch(fn) {
        PatchesRegistry.patchFns.push(fn);
    }
    static regSpecialEvent(x) {
        PatchesRegistry.patchedEventNames.push(x);
    }
}
// PatchesRegistry.regSpecialEvent("test");
// PatchesRegistry.addPatch(function (input) {
//     var output = input;
//     return output;
// })