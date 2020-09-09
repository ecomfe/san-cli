/**
 * @file 返回 .san-cli-ui 本地配置文件路径
*/

const path = require('path');
const os = require('os');

const LOCAL_DATA_FOLDER = '.san-cli-ui';
const rcPath = path.join(os.homedir(), LOCAL_DATA_FOLDER);

module.exports = rcPath;
