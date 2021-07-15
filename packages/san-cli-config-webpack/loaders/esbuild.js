const resolve = require('resolve');
const factory = require('./loaderFactory');

module.exports = factory({
    loader: resolve.sync('esbuild-loader'),
    options: {
        loader: 'css',
        minify: true
    }
});
