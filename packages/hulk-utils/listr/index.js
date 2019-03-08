const Listr = require('listr');
const renderer = require('./renderer');
module.exports = (arr, opt) => {
    return new Listr(arr, Object.assign({renderer, opt}));
};
