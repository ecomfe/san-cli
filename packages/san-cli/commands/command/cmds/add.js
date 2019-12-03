/**
 * @file add command
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const {addFactory: factory} = require('../../../lib/commandFactory');

module.exports = factory('commands', require('../validate'));
