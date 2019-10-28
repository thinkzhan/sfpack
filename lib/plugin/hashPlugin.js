import HashSum from 'hash-sum';
export default {
    ['AFTER_MERGE_SCRIPT'](complier) {
        const { compilation, config } = complier;
        if (!config.hash) {
            return
        }
        const hash = HashSum(compilation.script);
        compilation.jsName = compilation.page + '.' + hash;
    },
    ['AFTER_MERGE_STYLE'](complier) {
        const { compilation, config } = complier;
        if (!config.hash) {
            return
        }
        const hash = HashSum(compilation.style);
        compilation.cssName = compilation.page + '.' + hash;
    }
}