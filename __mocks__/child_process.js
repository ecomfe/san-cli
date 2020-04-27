/**
 * @file child_process单测mock
 * @author yanyiting
 */

const cp = {
    execSync: jest.fn(opt => {
        switch (opt) {
            case 'git config --get user.name':
                return 'yyt';
            case 'git config --get user.email':
                return 'yyt@123.com';
            default:
                return true;
        }
    })
};

module.exports = new Proxy(cp, {
    get: (target, property) => {
        if (property in target) {
            return target[property];
        }
        else {
            return jest.fn();
        }
    }
});
