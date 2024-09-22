// Babel plugin to transform functions and calls
const ASYNC_PLUGIN_1 = function ({ types: t }) {
    return {
        visitor: {
            FunctionDeclaration(path) {
                console.log(path);
                path.node.async = true;
            },
            ArrowFunctionExpression(path) {
                console.log(path);
                path.node.async = true;
            },
            CallExpression(path) {
                console.log(path);
                if (path.parent.type !== 'AwaitExpression') {
                    path.replaceWith(
                        t.awaitExpression(path.node)
                    );
                }
            }
        }
    };
};
async function asyncify(input) {
    let isHtml = true;
    let inputHtml = input;

    // Check if the input is raw JavaScript
    if (!input.trim().startsWith('<')) {
        isHtml = false;
        inputHtml = `<script>${input}</script>`;
    }

    _status("[ASYNC_PLUGIN_1] Parsing html...");
    await wait(50);
    const parser = new DOMParser();
    const doc = parser.parseFromString(inputHtml, 'text/html');
    const scriptTags = doc.querySelectorAll('script');

    for (let i = 0; i < scriptTags.length; i++) {
        const scriptTag = scriptTags[i];
        const code = scriptTag.textContent;
        _status("[ASYNC_PLUGIN_1] Transpiling script #" + (i + 1) + " of length " + Math.round(code.length / 1000) + "k...");
        await wait(50);


        const output = Babel.transform(code, {
            plugins: [ASYNC_PLUGIN_1]
        });
        scriptTag.textContent = output.code;
    }

    _status("[ASYNC_PLUGIN_1] Job complete!");
    await wait(50);

    if (isHtml) {
        return doc.documentElement.outerHTML;
    } else {
        return doc.querySelector('script').textContent;
    }
}