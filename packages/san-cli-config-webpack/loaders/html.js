const resolve = require('resolve');
const factory = require('./loaderFactory');
const htmlMinifyOptions = require('../defaultOptions').htmlMinifyOptions;

module.exports = factory({
    loader: resolve.sync('html-loader'),
    options: {
        minimize: htmlMinifyOptions,
        attributes: {
            list: [
                {
                    tag: 'img',
                    attribute: 'data-src',
                    type: 'src'
                },
                {
                    tag: 'link',
                    attribute: 'href',
                    type: 'src',
                    // html中的favicon icon
                    filter: (tag, attribute, attributes, resourcePath) => {
                        return /^icon$/i.test(attributes.rel);
                    },
                }
            ]
        }
    }
});
