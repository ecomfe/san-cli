/**
 * @file 将内容移动到固定位置的 webpack plugin
 * from vue-cli
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const fs = require('fs-extra');

module.exports = class MovePlugin {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }

    apply(compiler) {
        compiler.hooks.done.tap('move-plugin', () => {
            if (fs.existsSync(this.from)) {
                fs.moveSync(this.from, this.to, {overwrite: true});
            }
        });
    }
};
