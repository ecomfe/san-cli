const npmlog = require('npmlog');

module.exports = prefix => {
    const logFactory = fn => {
        if (typeof npmlog[fn] === 'function') {
            const log = npmlog[fn];
            return (pre, ...args) => {
                if (typeof pre !== 'string') {
                    return log(prefix, pre, ...args);
                } else {
                    return log(`${prefix}:${pre}`, ...args);
                }
            };
        }
        return console.log;
    };
    const rs = {};
    ['info', 'warn', 'error'].forEach(k => (rs[k] = logFactory(k)));
    return rs;
};
