document.querySelector("title").innerText = `EaglerForge Injector ${EFIConfig.ModAPIVersion}`;
document.querySelector("h1").innerText = `EaglerForge Injector ${EFIConfig.ModAPIVersion}`;

document.querySelector("#giveme").addEventListener("click", () => {
    if (
        !document.querySelector("input").files ||
        !document.querySelector("input").files[0]
    ) {
        return;
    }
    // @type File
    var file = document.querySelector("input").files[0];
    var fileType = file.name.split(".");
    fileType = fileType[fileType.length - 1];

    file.text().then(async (string) => {
        var patchedFile = string;

        EFIConfig.doServerExtras = false;
        patchedFile = patchClient(string, new DOMParser());

        var blob = new Blob([patchedFile], { type: file.type });
        saveAs(blob, "processed." + fileType);
        backgroundLog("Saving file...", true);
    });
});

document.querySelector("#givemeserver").addEventListener("click", () => {
    if (
        !document.querySelector("input").files ||
        !document.querySelector("input").files[0]
    ) {
        return;
    }
    // @type File
    var file = document.querySelector("input").files[0];
    var fileType = file.name.split(".");
    fileType = fileType[fileType.length - 1];

    file.text().then(async (string) => {
        var patchedFile = string;

        EFIConfig.doServerExtras = true;
        patchedFile = patchClient(string, new DOMParser());

        var blob = new Blob([patchedFile], { type: file.type });
        saveAs(blob, "efserver." + fileType);
        backgroundLog("Saving file...", true);
    });
});
