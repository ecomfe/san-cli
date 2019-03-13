/**
 * @file html webpack plugin
 */

/* eslint-disable fecs-prefer-class */

function HtmlWebpackPluginAddons(options) {
    this.options = options || {};
}

// eslint-disable-next-line
HtmlWebpackPluginAddons.prototype.apply = function(compiler) {
    let options = this.options; // 注意 this 的指代
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
};

module.exports = HtmlWebpackPluginAddons;
