class PatchesRegistry {
    static patchFns = []
    static patchedEventNames = []
    static getEventInjectorCode() {
        return "globalThis.modapi_specialevents = [" + PatchesRegistry.patchedEventNames.flatMap(x=>`\`${x}\``).join(",") + "]"
    }
    static addPatch(fn) {
        patchFns.push(fn);
    }
    static addSpecialEvent(x) {
        PatchesRegistry.patchedEventNames.push(x);
    }
}
function addPatch() {
    
}
function addSpecialEvent(eventName) {
    
}