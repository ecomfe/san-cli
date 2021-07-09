const factory = require('./loaderFactory');

module.exports = factory({
    loader: 'stylus-loader',
    options: {
        preferPathResolver: 'webpack'
    }
});
