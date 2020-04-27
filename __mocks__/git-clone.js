/**
 * @file git-clone单测mock
 * @author yanyiting
 */

module.exports = jest.fn((url, dest, checkout = {}, cb) => {
    if (url) {
        cb(false);
    }
    else {
        cb(true);
    }
});
