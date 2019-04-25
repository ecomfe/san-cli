/**
 * @file 作为html-webpack-plugin-addons的一个回调，用于将 页面静态资源插入到smarty 中
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const {isCSS, isJS, flatten} = require('./utils');
module.exports = (pluginData, compilation) => {
    if (!~pluginData.html.indexOf('{%/block%}')) {
        return pluginData;
    }
    const htmlWp = pluginData.plugin;

    // TODO 调研下 html-webpack-plugin 中能不能直接拿到 prefetch magic commit 的代码
    // TODO 如果能拿到，就可以省掉这部分代码
    const initEntry = Object.keys(pluginData.assets.chunks)[0];
    // publicPath
    const publicPath = compilation.outputOptions.publicPath || '';

    const stats = compilation.getStats().toJson({hash: false, modules: false, chunks: true});
    const chunks = stats.chunks;
    const prefetchFiles = flatten(
        chunks
            .filter(({entry, names}) => entry && names.length === 1 && names[0] === initEntry)
            .map(({files, siblings, children, names}) => {
                const results = [];
                children.forEach(id => {
                    if (chunks[id].files.length) {
                        results.push(...chunks[id].files);
                    }
                });
                return results;
            })
    )
        .filter(file => isCSS(file) || isJS(file))
        .map(file => `<link rel="prefetch" href="${publicPath}${file}" />`);

    // 手动添加资源到项目tpl特定的位置
    let assetTags = htmlWp.generateHtmlTags(pluginData.assets);
    let bodyAsset = assetTags.body.map(htmlWp.createHtmlTag.bind(htmlWp));
    let headAsset = assetTags.head.map(htmlWp.createHtmlTag.bind(htmlWp));
    const headTag = '{%block name="__css_asset"%}';
    const bodyTag = '{%block name="__script_asset"%}';
    const prefetchTag = '{%block name="__prefetch_asset"%}';
    let html = pluginData.html;
    // 替换 head body部分
    [[headAsset, headTag], [bodyAsset, bodyTag], [prefetchFiles, prefetchTag]].forEach(([assets, tag]) => {
        if (~html.indexOf(tag)) {
            html = html.split(tag).join(`${tag}${assets.join('')}`);
        } else {
            html += tag + assets.join('') + '{%/block%}';
        }
    });

    pluginData.html = html;
    return pluginData;
};
