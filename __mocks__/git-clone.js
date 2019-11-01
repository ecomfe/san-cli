/**
 * @file git-clone单测mock
 */

module.exports = jest.fn((url, dest, checkout = {}, cb) => {
    if (url === 'yyt') {
        cb(false);
    } else {
        cb(true);
    }
});
