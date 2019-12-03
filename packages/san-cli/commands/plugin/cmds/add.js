/**
 * @file add command
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const {addFactory: factory} = require('../../../lib/pluginCommandFactory');

module.exports = factory('servicePlugins', require('../validate'));
