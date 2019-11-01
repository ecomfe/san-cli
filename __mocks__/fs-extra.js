/**
 * @file fs-extra单测mock
 */

exports.existsSync = jest.fn(() => true);
exports.removeSync = jest.fn();
