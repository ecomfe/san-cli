/**
 * @file 给 command 命令添加 remove 功能
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const {removeFactory: factory} = require('../../../lib/commandFactory');

module.exports = factory('servicePlugins', require('../validate'));
