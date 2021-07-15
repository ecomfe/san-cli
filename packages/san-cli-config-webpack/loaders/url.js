const resolve = require('resolve');
const factory = require('./loaderFactory');

module.exports = factory({
    loader: resolve.sync('url-loader'),
    options: {
        limit: 1024,
        noquotes: true,
        esModule: false
    }
});
