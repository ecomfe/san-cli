/**
 * @file address单测mock
 * @author yanyiting <yanyiting@baidu.com>
 */

const address = {
    ip: jest.fn(() => '172.24.191.21')
};

module.exports = new Proxy(address, {
    get: (target, property) => {
        if (property in target) {
            return target[property];
        }
        else {
            return jest.fn();
        }
    }
});
