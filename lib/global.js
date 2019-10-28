const global = {
    IDs: {},

    config: {
        compress: false,
        watch: false
    },

    compilation: {
        entry: '',
        page: '',
        dependencies: [],
        htmlName: '',
        cssName: '',
        jsName: '',
        ignoreScripts: []
    },

    getId() {
        const page = global.compilation.page;
        return global.IDs[page]++
    },

    resetId() {
        const page = global.compilation.page;
        global.IDs[page] = 0
    }
};

export default global
