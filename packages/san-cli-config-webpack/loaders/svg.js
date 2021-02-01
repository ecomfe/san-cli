const resolve = require('resolve');
const factory = require('./loaderFactory');

module.exports = factory({
    loader: resolve.sync('svg-url-loader'),
    options: {
        encoding: 'base64',
        iesafe: false,
        limit: 1024,
        noquotes: true,
        esModule: false
    }
});
