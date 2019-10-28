import bs from 'browser-sync';
import extend from '../help/extend';

function DevServer(config) {
    this.server = bs.create('pack Server');

    // http://www.browsersync.cn/docs/options/
    const dftConfig = {
        server: {
            baseDir: './dist',
            directory: true
        },
        port: 8080
    };

    this.config = extend(dftConfig, config);
    this.watchDir = this.config.server.baseDir;

    this.server.init(this.config);
}

DevServer.prototype.watch = function() {
    this.server.watch(this.watchDir, (event, file) => {
        this.server.reload();
    });
};

export default DevServer;
