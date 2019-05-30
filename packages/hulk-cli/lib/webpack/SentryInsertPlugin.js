/**
 * @file 作为html-webpack-plugin-addons的一个回调，将指定静态资源插入页面
 * @author yanwenkai
 */
const HtmlWebpackPlugin = require('html-webpack-plugin');

function main(pluginData, compilation, options) {
    if (options.scripts) {
        // 前插
        let tmpScript = options.scripts;
        tmpScript = [...tmpScript].reverse();
        tmpScript.forEach(ele => {
            pluginData.head.unshift(ele);
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
            if (HtmlWebpackPlugin.getHooks) {
                // v4

                HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tapAsync(name, alterAssetTags);
            } else {
                compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(name, alterAssetTags);
            }
        });
    }
    alterAssetTags(compilation, data, cb) {
        data = main(data, compilation, this.options);
        cb(null, data);
    }

};
