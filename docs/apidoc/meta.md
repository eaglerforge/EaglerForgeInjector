## ModAPI.meta
ModAPI.meta contains the API for registering metadata on mods easily.

Methods:
- `ModAPI.meta.title(title: String)`
    - Sets the title of the mod. This is mandatory if any metadata is to be displayed. Character limit of 16.
- `ModAPI.meta.credits(credits: String)`
    - Sets the credits of the mod. Character limit of 36.
- `ModAPI.meta.description(desc: String)`
    - Sets the description of the mod. Character limit of 160.
- `ModAPI.meta.icon(iconURL: String)`
    - Sets the icon of the mod.
    - It can be extremely low res, it will not appear blurry.