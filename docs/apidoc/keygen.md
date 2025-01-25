## ModAPI.keygen
ModAPI.keygen contains the API for getting numerical item, block and entity IDs from a string. It looks at registries to derive the IDs, so IDs will not be automatically reserved until a block/item is actually registered into the game. Ideally, you'd want to call a keygen method just before registering your block.

Methods:
- `ModAPI.keygen.item(itemId: String) : number`
    - Example usage is: `var id = ModAPI.keygen.item("my_example_item");`
- `ModAPI.keygen.block(blockId: String) : number`
    - Example usage is: `var id = ModAPI.keygen.block("my_example_block");`
- `ModAPI.keygen.entity(entityId: String) : number`
    - Example usage is: `var id = ModAPI.keygen.entity("my_example_entity");`