const resolve = require('resolve');
const factory = require('./loaderFactory');

module.exports = factory({
    loader: resolve.sync('san-loader'),
    options: {
        esModule: false
    }
});
