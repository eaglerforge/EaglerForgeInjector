class PatchesRegistry {
    static patchedEventNames = []
    static patchedEventNames = []
    static getEventInjectorCode() {
        return globalThis.modapi_specialevents = "[" + PatchesRegistry.patchedEventNames.flatMap(x=>`\`${x}\``).join(",") + "]"
    }
}
function addPatch(params) {
    
}
function addSpecialEvent(eventName) {
    
}