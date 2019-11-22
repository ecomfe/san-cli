/**
 * @file fs-extra单测mock
 */

exports.existsSync = jest.fn(dest => {
    // 如果传入目录为none，那么返回不存在此文件，其余情况均为存在
    if (dest === 'none') {
        return false;
    } else {
        return true;
    }
});
exports.removeSync = jest.fn();
exports.remove = jest.fn(() => true);
