PluginAPI.require("player"); //Require the player
var GrappleHookPlugin = {
    oldXYZ: [0, 0, 0], //The previous hook position.
    prev: "NONE", //The previous state
    scaleH: 0.25, //Used for X and Z velocity
    scaleV: 0.15, //((Grapple Y) minus (Player Y)) times scaleV
    lift: 0.4, //Base vertical motion
    crouchToCancel: true //Whether or not crouching should disable the grappling hook.
};
PluginAPI.addEventListener("update", () => { //Every client tick
    if (!PluginAPI.player.fishEntity) { //If the fish hook does not exist.
        if (GrappleHookPlugin.prev === "GROUND" && (!GrappleHookPlugin.crouchToCancel || !PluginAPI.player.isSneaking())) { //If the old state was ground
            GrappleHookPlugin.prev = "NONE"; //Update the state
            var mx = GrappleHookPlugin.oldXYZ[0] - PluginAPI.player.posX; //Get delta X
            var my = GrappleHookPlugin.oldXYZ[1] - PluginAPI.player.posY; //Get delta Y
            var mz = GrappleHookPlugin.oldXYZ[2] - PluginAPI.player.posZ; //Get delta Z
            mx *= GrappleHookPlugin.scaleH; //Multiply by horizontal scale
            my *= GrappleHookPlugin.scaleV; //Multiply by vertical scale
            mz *= GrappleHookPlugin.scaleH; //Multiply by horizontal scale
            PluginAPI.player.motionX += mx; //Add x motion
            PluginAPI.player.motionY += my + GrappleHookPlugin.lift;  //Add y motion, plus base lift.
            PluginAPI.player.motionZ += mz; //Add z motion
        } else {
            GrappleHookPlugin.prev = "NONE";
        }
    } else if (GrappleHookPlugin.prev === "NONE") { //If the hook exists, but the previous state was NONE, update the state.
        GrappleHookPlugin.prev = "AIR";
    }
    if (
        PluginAPI.player.fishEntity !== undefined && //If the fish hook exists
        GrappleHookPlugin.prev === "AIR" && //And the hook was previously in the air
        PluginAPI.player.fishEntity[PluginAPI.util.getNearestProperty(ModAPI.player.fishEntity, "inGround")] //And the hook is in the ground (the inGround property is botched with random suffixes sometimes)
    ) {
        GrappleHookPlugin.oldXYZ = [ //Set old grapple hook position
            PluginAPI.player.fishEntity.posX,
            PluginAPI.player.fishEntity.posY,
            PluginAPI.player.fishEntity.posZ,
        ];
        GrappleHookPlugin.prev = "GROUND";//Update state
    }
});