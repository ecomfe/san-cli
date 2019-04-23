/**
 * @file html webpack plugin
 */
const HtmlWebpackPlugin = require('html-webpack-plugin');

const name = 'HtmlWebpackPluginAddons';
module.exports = class HtmlWebpackPluginAddons {
    constructor(options = {}) {
        this.options = options;
    }
    apply(compiler) {
        let options = this.options;
        compiler.hooks.compilation.tap(name, compilation => {
            Object.keys(options).forEach(key => {
                let cb = options[key];

                if (HtmlWebpackPlugin.getHooks) {
                    // v4
                    let asyncEvent = {
                        alterAssetTags: 'alterAssetTags',
                        afterHTMLProcessing: 'afterTemplateExecution',
                        afterEmit: 'afterEmit'
                    }[key];
                    if (typeof cb !== 'function' || !asyncEvent) {
                        return;
                    }
                    HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(name, (pluginData, callback) => {
                        pluginData = cb(pluginData, compilation);
                        callback(null, pluginData);
                    });
                } else {
                    let asyncEvent = {
                        alterAssetTags: 'htmlWebpackPluginAlterAssetTags',
                        afterHTMLProcessing: 'htmlWebpackPluginAfterHtmlProcessing',
                        afterEmit: 'htmlWebpackPluginAfterEmit'
                    }[key];
                    if (typeof cb !== 'function' || !asyncEvent) {
                        return;
                    }
                    compilation.hooks[asyncEvent].tap(name, pluginData => {
                        pluginData = cb(pluginData, compilation);
                    });
                }
            });
        });
    }
};
