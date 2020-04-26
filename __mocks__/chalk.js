/**
 * @file chalk单测mock
 * @author yanyiting
 */

const chalk = require('chalk');

const chalkmock = {
    gray: jest.fn(str => str),
    red: jest.fn(str => str),
    bold: jest.fn(str => str)
};

module.exports = new Proxy(chalkmock, {
    get: (target, property) => {
        if (property in target) {
            return target[property];
        }
        else {
            return chalk[property];
        }
    }
});
