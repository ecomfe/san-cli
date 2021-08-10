const resolve = require('resolve');
const factory = require('./loaderFactory');

module.exports = factory({
    loader: resolve.sync('svg-sprite-loader'),
    options: {
        symbolId: '[name]'
    }
});
