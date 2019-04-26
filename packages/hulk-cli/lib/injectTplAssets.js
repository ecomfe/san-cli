/**
 * @file 作为html-webpack-plugin-addons的一个回调，用于将 页面静态资源插入到smarty 中
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const {isCSS, isJS, flatten} = require('./utils');
const {createHtmlTagObject, htmlTagObjectToString} = require('./htmlTags');
module.exports = (pluginData, compilation) => {
    if (!~pluginData.html.indexOf('{%/block%}')) {
        return pluginData;
    }
    const htmlWp = pluginData.plugin;
    const initEntry = htmlWp.options.entry;

    // 根据 entry 查找出来当前页面的chunks
    let tempChunks = compilation.entrypoints.get(initEntry).chunks.map(c => c.name);

    if (Array.isArray(htmlWp.options.excludeChunks) && htmlWp.options.excludeChunks.length) {
        // 排除需要排除的 chunks
        tempChunks = tempChunks.filter(chunk => htmlWp.options.excludeChunks.indexOf(chunk) === -1);
    }
    // 这里拿到了全部的 chunks，需要分离 css 和 js 了
    const assets = {js: [], css: [], jsTags: [], cssTags: []};
    const entryChunks = tempChunks.map(chunkName => pluginData.assets.chunks[chunkName]);
    entryChunks.reduce((prev, {entry, css}) => {
        prev.js.push(entry);
        if (css.length) {
            prev.css.push(...css);
        }
        return prev;
    }, assets);
    // 生成 tags
    assets.js.forEach(js => {
        const obj = createHtmlTagObject('script', {
            type: 'text/javascript',
            src: js
        });

        assets.jsTags.push(htmlTagObjectToString(obj));
    });
    assets.css.forEach(css => {
        const obj = createHtmlTagObject('link', {
            rel: 'stylesheet',
            href: css
        });
        assets.cssTags.push(htmlTagObjectToString(obj));
    });
    // publicPath
    let publicPath = compilation.outputOptions.publicPath || '';
    if (publicPath.length && !publicPath.endsWith('/')) {
        // 保证最后有/
        publicPath += '/';
    }
    const stats = compilation.getStats().toJson({
        assets: false,
        chunkGroups: false,
        hash: false,
        modules: false,
        chunks: true,
        entrypoints: false,
        performance: false
    });
    const chunks = stats.chunks;
    const prefetchTags = flatten(
        chunks
            .filter(({entry, names}) => entry && names.length === 1 && names[0] === initEntry)
            .map(({children, names}) => {
                const results = [];
                children.forEach(id => {
                    if (chunks[id].files.length) {
                        // console.log(chunks[id].files);
                        results.push(...chunks[id].files);
                    }
                });
                return results;
            })
    )
        .filter(file => isCSS(file) || isJS(file))
        .map(file => `<link rel="prefetch" href="${publicPath}${file}" />`);

    // 手动添加资源到项目tpl特定的位置
    let {cssTags = [], jsTags = []} = assets;
    const cssBlockTag = '{%block name="__css_asset"%}';
    const jsBlockTag = '{%block name="__script_asset"%}';
    const prefetchBlockTag = '{%block name="__prefetch_asset"%}';
    let html = pluginData.html;
    // 替换 head body部分
    [[cssTags, cssBlockTag], [jsTags, jsBlockTag], [prefetchTags, prefetchBlockTag]].forEach(([assets, tag]) => {
        if (~html.indexOf(tag)) {
            html = html.split(tag).join(`${tag}${assets.join('')}`);
        } else {
            // 最后添加上
            html += tag + assets.join('') + '{%/block%}';
        }
    });

    pluginData.html = html;
    return pluginData;
};
