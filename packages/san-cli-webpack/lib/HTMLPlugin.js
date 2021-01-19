/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file 作为html-webpack-plugin的一个插件，用于将页面静态资源插入到smarty 中
 * @author ksky521
 */

const HtmlWebpackPlugin = require('html-webpack-plugin');
const {isCSS, isJS} = require('../utils');
const SMARTY_BLOCK = /{%block name=(["'])__(body|head)_asset[s]?\1%}(.+?){%\/block%}/g;

function main(pluginData, compilation) {
    // console.log(pluginData);
    let publicPath = compilation.outputOptions.publicPath || '';
    if (publicPath.length && !publicPath.endsWith('/')) {
        // 保证最后有/
        publicPath += '/';
    }

    function assetsFns(filename, rel = 'preload') {
        const href = `${publicPath}${filename}`;
        const tag = {
            tagName: 'link',
            attributes: {
                rel,
                href
            }
        };
        if (rel === 'preload') {
            tag.attributes.as = isCSS(filename) ? 'css' : isJS(filename) ? 'js' : '';
        }
        return tag;
    }

    // 所有 chunks 的 Map，用于根据 ID 查找 chunk
    const chunks = new Map();
    // 预取的 id
    const idsSet = {
        preload: new Set(),
        prefetch: new Set()
    };

    // prefetch Assets Array
    const assets = new Map();

    compilation.chunks.forEach(chunk => {
        // 添加到 map
        chunks.set(chunk.id, chunk);
    });

    // TODO: 支持 html-webpack-plugin v4, 目前 v4 还有好多插件不支持，只能调通 3.0
    pluginData.chunks && pluginData.chunks.forEach(({childrenByOrder}) => {
        Object.keys(childrenByOrder).forEach(key => {
            if (Array.isArray(childrenByOrder[key]) && childrenByOrder[key].length && idsSet[key]) {
                idsSet[key].add(...childrenByOrder[key]);
            }
        });
    });
    Object.keys(idsSet).forEach(type => {
        const set = idsSet[type];
        for (let id of set) {
            const chunk = chunks.get(id);
            const files = chunk.files;
            files.forEach(file => assets.set(file, type));
        }
    });

    for (let [filename, type] of assets) {
        pluginData.head.push(assetsFns(filename, type));
    }

    return pluginData;
}

const name = 'SanHtmlWebpackPlugin';
module.exports = class HulkHtmlWebpackPlugin {
    constructor(options = {}) {
        this.options = options;
    }
    apply(compiler) {
        compiler.hooks.compilation.tap(name, compilation => {
            const alterAssetTags = this.alterAssetTags.bind(this, compilation);
            const afterHTMLProcessing = this.afterHTMLProcessing.bind(this, compilation);
            if (HtmlWebpackPlugin.getHooks) {
                // 支持v4
                HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tapAsync(name, alterAssetTags);
                HtmlWebpackPlugin.getHooks(compilation).afterTemplateExecution.tapAsync(name, afterHTMLProcessing);
            }
            else {
                compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(name, alterAssetTags);
                compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tap(name, afterHTMLProcessing);
            }
        });
    }
    alterAssetTags(compilation, data, cb) {
        data = main(data, compilation, this.options);
        typeof cb === 'function' && cb(null, data);
        return data;
    }
    afterHTMLProcessing(compilation, data, cb) {
        // 处理 html 中的{%block name="__head_asset"%}中的 head 和 body tag
        // data.html = data.html.replace('');
        data.html = data.html.replace(SMARTY_BLOCK, m => m.replace(/<[/]?(head|body)>/g, ''));
        typeof cb === 'function' && cb(null, data);
        return data;
    }
};
