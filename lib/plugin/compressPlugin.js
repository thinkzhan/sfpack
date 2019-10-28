import { minify } from 'uglify-js';
import CleanCSS from 'clean-css';

export default {
    ['AFTER_MERGE_SCRIPT'](complier) {
        const { compilation, config } = complier;
        if (!config.compress) {
            return
        }
        const min = minify(compilation.script);
        compilation.script = min.code;
    },
    ['AFTER_MERGE_STYLE'](complier) {
        const { compilation, config } = complier;
        if (!config.compress) {
            return
        }
        const clean = new CleanCSS().minify(compilation.style);
        compilation.style = clean.styles
    }
}