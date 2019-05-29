/**
 * @file 作为html-webpack-plugin-addons的一个回调，将指定静态资源插入页面
 * @author yanwenkai
 */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SMARTY_BLOCK = /{%block name=(["'])__(body|head)_asset[s]?\1%}(.+?){%\/block%}/g;

function main(pluginData, compilation, options) {
    if (options.scripts) {
        options.scripts.forEach(ele => {
            pluginData.head.push(ele);
        });
    }
    return pluginData;
}

const name = 'sentryInsertPlugin';
module.exports = class sentryInsertPlugin {
    constructor(options = {}) {
        this.options = options;
    }
    apply(compiler) {
        compiler.hooks.compilation.tap(name, compilation => {

            const alterAssetTags = this.alterAssetTags.bind(this, compilation);
            const afterHTMLProcessing = this.afterHTMLProcessing.bind(this, compilation);
            if (HtmlWebpackPlugin.getHooks) {
                // v4

                HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tapAsync(name, alterAssetTags);
                HtmlWebpackPlugin.getHooks(compilation).afterTemplateExecution.tap(name, alterAssetTags);
            } else {
                compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(name, alterAssetTags);
                compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tap(name, afterHTMLProcessing);
            }
        });
    }
    alterAssetTags(compilation, data, cb) {
        data = main(data, compilation, this.options);
        cb(null, data);
    }
    afterHTMLProcessing(compilation, data) {
        // 处理 html 中的{%block name="__head_asset"%}中的 head 和 body tag
        // data.html = data.html.replace('');
        if (data.html.indexOf(SMARTY_BLOCK) >= 0) {
            data.html = data.html.replace(SMARTY_BLOCK, m => m.replace(/<[/]?(head|body)>/g, ''));
        }
        return data;
    }
};
