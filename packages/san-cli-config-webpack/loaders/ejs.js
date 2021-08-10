const resolve = require('resolve');
const factory = require('./loaderFactory');

module.exports = factory({
    loader: resolve.sync('ejs-loader'),
    options: {
        esModule: false
    }
});
