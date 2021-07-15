const resolve = require('resolve');
const factory = require('./loaderFactory');
module.exports = factory(() => ({
    loader: require.resolve('babel-loader'),
    options: {
        presets: resolve.sync('san-cli-plugin-babel/preset')
    }
}));
