const fs = require('fs-extended')
const path = require('path')
const console = require('sfconsole')('Template');
require('shelljs/global')

module.exports = function (filename) {
  fs.copyDirSync(path.resolve(__dirname, '../example'), filename);

  exec(`cd ${filename} && npm install`);

  console.warn(
    `init template ok! cd ${filename} && npm run dev`
  );
}
