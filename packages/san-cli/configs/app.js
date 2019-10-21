const path = require('path');
const fs = require('fs');
module.exports = {
    id: 'built-in:app',
    apply(api, options, argv) {
        api.chainWebpack(webpackConfig => {
            const isProd = api.isProd();
            const outputDir = api.resolve(options.outputDir);
        });
    }
};
