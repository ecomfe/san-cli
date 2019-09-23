/**
 * @file 获取本地模板路径
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const home = require('user-home');
const path = require('path');

module.exports = template =>
    path.join(home, '.hulk-templates', template.replace(/[/:#]/g, '-').substring(template.lastIndexOf('/') + 1));
