const fs = require('fs-extended')
const path = require('path')

module.exports = function(p) {
    fs.copyDirSync(path.resolve(__dirname, '../example'), p);
}
