/**
 * @file run
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = (entry, cmd) => {
    require('@baidu/hulk-serve').build(entry, cmd);
};
