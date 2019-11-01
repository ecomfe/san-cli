/**
 * @file cosmiconfig单测mock
 */

const searchSync = jest.fn();

searchSync
.mockReturnValueOnce({
    config: {
        a: 1,
        b: 2
    }
})
.mockReturnValueOnce(false)
.mockReturnValue({});

module.exports = jest.fn(() => ({
    searchSync
}));
