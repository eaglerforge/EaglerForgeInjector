const { DOMParser } = require("@xmldom/xmldom");
const fs = require("fs/promises");
const EFI = require("./core/core");

async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes("/help") || args.length === 0) {
        console.log("***************************");
        console.log("* EaglerForgeInjector CLI *");
        console.log("***************************");
        console.log("");
        console.log("> npm run efi /help #shows this help text");
        console.log("> npm run efi my_unminified_file.html #does nothing");
        console.log("> npm run efi my_unminified_file.html /eaglerforge #injects eaglerforge");
        console.log("> npm run efi my_unminified_file.html /minify #minifies file");
        console.log("> npm run efi my_unminified_file.html /minify /minify_extras #minifies file with extra optimisations");
        console.log("> npm run efi my_unminified_file.html /eaglerforge /minify #minifies file and injects eaglerforge");
        console.log("> npm run efi my_unminified_file.html /server_extras #inject server hosting stuff");
        console.log("> npm run efi my_unminified_file.html output.html /eaglerforge /minify #minifies file and injects eaglerforge, write to file named output.html");
        console.log("> npm run efi my_unminified_file.html /verbose #much logging");
        console.log("By default, output is written to processed.html");
        return;
    }
    const inputFile = args[0];
    if (!inputFile) {
        return console.error("No file provided!");
    }
    EFI.conf.doMinify = args.includes("/minify");
    EFI.conf.doEaglerforge = args.includes("/eaglerforge");
    EFI.conf.doServerExtras = args.includes("/server_extras");
    EFI.conf.doMinifyPlus = args.includes("/minify_extras");
    EFI.conf.verbose = args.includes("/verbose");
    const string = await fs.readFile(inputFile, {encoding: 'utf-8'});
    const res = await EFI.patchClient(string, new DOMParser());
    if (res) {
        var output = args[1];
        if (!output || !output.endsWith(".html")) {
            output = "processed.html";
        }
        console.log("Writing to " + output);
        await fs.writeFile(output, res);
        console.log("Done!");
    }
}
main();