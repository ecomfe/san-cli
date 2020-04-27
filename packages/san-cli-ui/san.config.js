const path = require('path');
const resolve = pathname => path.resolve(__dirname, pathname);

module.exports = {
    outputDir: 'dist',
    css: {
        cssPreprocessor: 'less'
    },
    pages: {
        index: {
            entry: './client/pages/index/index.js',
            filename: 'index.html'
        }
    },
    alias: {
        '@assets': resolve('client/assets'),
        '@components': resolve('client/components'),
        '@app': resolve('client/lib/App.js'),
        '@': resolve('client'),
        '@store': resolve('client/lib/Store.js')
    }
};
