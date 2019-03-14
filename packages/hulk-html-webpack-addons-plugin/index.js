/**
 * @file html webpack plugin
 */

module.exports = class HtmlWebpackPluginAddons {
    constructor(options = {}) {
        this.options = options;
    }
    apply(compiler) {
        let options = this.options;
        compiler.hooks.compilation.tap('HtmlWebpackPluginAddons', compilation => {
            Object.keys(options).forEach(key => {
                let cb = options[key];
                let asyncEvent = {
                    beforeHTMLGeneration: 'htmlWebpackPluginBeforeHtmlGeneration',
                    beforeHTMLProcessing: 'htmlWebpackPluginBeforeHtmlProcessing',
                    alterAssetTags: 'htmlWebpackPluginAlterAssetTags',
                    afterHTMLProcessing: 'htmlWebpackPluginAfterHtmlProcessing',
                    afterEmit: 'htmlWebpackPluginAfterEmit'
                }[key];
                if (typeof cb !== 'function' || !asyncEvent) {
                    return;
                }

                compilation.hooks[asyncEvent].tap('HtmlWebpackPluginAddons', pluginData => {
                    pluginData = cb(pluginData);
                });
            });
        });
    }
};
