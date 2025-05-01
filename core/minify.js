if (!globalThis.Babel) {
    globalThis.Babel = require("@babel/core");
}
function wait(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(() => { resolve(); }, ms);
    });
}
const MINIFY = function () {
    return {
        visitor: {
            Identifier(path) {
                if (path.node.name === "$ptr") {
                    path.node.name = "r";
                }
                if (path.node.name === "$tmp") {
                    path.node.name = "m";
                }
                if (path.node.name === "$thread") {
                    path.node.name = "t";
                }
            },
        }
    };
};
async function minify(input, parser, EFIConfig) {
    var _status = globalThis._status || console.log;

    let isHtml = true;
    let inputHtml = input;

    if (!input.trim().startsWith('<')) {
        isHtml = false;
        inputHtml = `<script>${input}</script>`;
    }

    _status("[MINIFY] Parsing html...");
    await wait(50);
    const doc = parser.parseFromString(inputHtml, 'text/html');
    const scriptTags = doc.getElementsByTagName('script');
    await wait(200); //trying to get chrome to gc
    for (let i = 0; i < scriptTags.length; i++) {
        const scriptTag = scriptTags[i];
        const code = scriptTag.textContent;
        _status("[MINIFY] Transpiling script #" + (i + 1) + " of length " + Math.round(code.length / 1000) + "k...");
        await wait(150);


        const output = Babel.transform(code, {
            plugins: EFIConfig.doMinifyPlus ? [
                MINIFY()
            ] : []
        });
        scriptTag.textContent = output.code;
        await wait(10);
    }

    _status("[MINIFY] Job complete!");
    await wait(50);

    if (isHtml) {
        return globalThis.process ? doc.toString() : doc.documentElement.outerHTML;
    } else {
        return doc.querySelector('script').textContent;
    }
}

if (globalThis.process) {
    module.exports = {
        minify: minify
    }
}