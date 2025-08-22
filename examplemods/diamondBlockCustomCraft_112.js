(function AddDiamondRecipe() {
    ModAPI.meta.title("DiamondCraftingRecipeMod 1.12");
    ModAPI.meta.description("Adds a crafting recipe to create diamond blocks from dirt.");

    async function registerRecipe(isServer) {
        if (isServer) {
            await new Promise((res, rej) => {
                ModAPI.addEventListener("bootstrap", res);
            });
        }
        const parseJson = ModAPI.reflect.getClassByName("JSONObject").constructors.findLast(x => x.length === 1);
        const CraftingManager = ModAPI.reflect.getClassByName("CraftingManager");
        const CraftingManagerMethods = CraftingManager.staticMethods;
        const jsonData = parseJson(ModAPI.util.str(`{
            "type": "crafting_shaped", ${/*/or crafting_shapeless/*/""}
            "pattern": [
    "I I",
    " i ",
    "iii"
  ],
  "key": {
    "I": {
      "item": "minecraft:dirt",
      data: 0 ${/*/data param optional!!!/*/""}
    },
    "i": {
      "item": "minecraft:grass",
      data: 0 ${/*/data param optional!!!/*/""}
    }
  },
  "result": {
    "item": "minecraft:diamond",
    "data": 0,
    "count": 4
  }
            }`.trim()));
        const recipeObj = CraftingManagerMethods.func_193376_a.method(jsonData); //convert json to an IRecipe
        CraftingManagerMethods.func_193379_a.method(ModAPI.util.str("coolrecipeid"), recipeObj); //register recipe under resource location
    }

    ModAPI.dedicatedServer.appendCode(registerRecipe);
    registerRecipe(false);
})();
