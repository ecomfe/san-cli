const resolve = require('resolve');
const factory = require('./loaderFactory');

module.exports = factory({
    loader: resolve.sync('file-loader'),
    options: {
        name: '[path][name].[ext]'
    }
});
