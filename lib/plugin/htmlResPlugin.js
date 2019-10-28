import HashSum from 'hash-sum';
import url from 'url';

export default {
    ['AFTER_MERGE_HTML'](complier) {
        const { compilation, config } = complier;

        if (config.inline === true || 
            (config.inline && config.inline.includes(compilation.entry))
        ) {
            compilation.html = compilation.html.replace(/\<\/\s*head\s*>/,
                `<style>${compilation.style}</style>
                </head>
                `
            ).replace(/\<\/\s*body\s*>/,
                `<script type="text/javascript">${compilation.script}</script>
                </body>
                `
            );
        } else {
            const outCss = url.resolve(config.publicPath, `./assets/${compilation.cssName}.css`);
            const outJs= url.resolve(config.publicPath, `./assets/${compilation.jsName}.js`);            

            compilation.html = compilation.html.replace(/\<\/\s*head\s*>/,
                `<link href="${outCss}" rel="stylesheet"/>
                </head>
                `
            ).replace(/\<\/\s*body\s*>/,
                `<script src="${outJs}" type="text/javascript"></script>
                </body>
                `
            );
        }
    }
}