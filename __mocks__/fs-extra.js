/**
 * @file fs-extra单测mock
 * @author yanyiting
 */

const fse = require('fs-extra');

const fsemock = {
    existsSync: jest.fn(dest => {
        // 如果传入目录为none，那么返回不存在此文件
        if (dest.indexOf('none') > -1) {
            return false;
        }
        // 如果传入目录为exist，那么返回存在此文件
        else if (dest.indexOf('exist') > -1) {
            return true;
        }
        else {
            return fse.existsSync(dest);
        }
    }),
    removeSync: jest.fn(),
    remove: jest.fn(() => true)
};

module.exports = new Proxy(fsemock, {
    get: (target, property) => {
        if (property in target) {
            return target[property];
        }
        else {
            return fse[property];
        }
    }
});
