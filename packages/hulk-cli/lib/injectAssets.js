/**
 * @file 作为html-webpack-plugin-addons的一个回调，用于将 页面静态资源插入到smarty 中
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const {isCSS, isJS} = require('./utils');
const {createHtmlTagObject, htmlTagObjectToString} = require('./htmlTags');
const fnChunkGroup = (name, cg, excludeChunksName) => {
    if (cg && cg.getChildrenByOrders) {
        const children = cg.getChildrenByOrders();
        const chunks = cg.chunks.filter(({name}) => !~excludeChunksName.indexOf(name));
        const obj = {
            chunks: chunks.map(c => c.id),
            assets: chunks.reduce((array, c) => array.concat(c.files || []), []),
            children: Object.keys(children).reduce((obj, key) => {
                const groups = children[key];
                obj[key] = groups.map(group => ({
                    name: group.name,
                    chunks: group.chunks.map(c => c.id),
                    assets: group.chunks.reduce((array, c) => array.concat(c.files || []), [])
                }));
                return obj;
            }, Object.create(null)),
            childAssets: Object.keys(children).reduce((obj, key) => {
                const groups = children[key];
                obj[key] = Array.from(
                    groups.reduce((set, group) => {
                        for (const chunk of group.chunks) {
                            for (const asset of chunk.files) {
                                set.add(asset);
                            }
                        }
                        return set;
                    }, new Set())
                );
                return obj;
            }, Object.create(null))
        };

        return obj;
    } else {
        return false;
    }
};
module.exports = (pluginData, compilation) => {
    let publicPath = compilation.outputOptions.publicPath || '';
    if (publicPath.length && !publicPath.endsWith('/')) {
        // 保证最后有/
        publicPath += '/';
    }
    const hwpOptions = pluginData.plugin.options;
    const filename = hwpOptions.filename;
    // 排除需要排除的 chunks
    const excludeChunksName = hwpOptions.excludeChunks || [];

    // 这里拿到了全部的 chunks，需要分离 css 和 js 了
    const assets = {js: [], css: [], jsTags: [], cssTags: []};
    let isSmartyTpl = false;
    if (/\.tpl$/.test(filename)) {
        isSmartyTpl = true;
    }

    function assetsFns(filename) {
        const type = isCSS(filename) ? 'css' : isJS(filename) ? 'js' : '';
        if (type) {
            assets[type].push(filename);
            let tagObject;
            filename = `${publicPath}${filename}`;
            if (type === 'js') {
                tagObject = createHtmlTagObject('script', {
                    type: 'text/javascript',
                    src: filename
                });
            } else if (type === 'css') {
                tagObject = createHtmlTagObject('link', {
                    rel: 'stylesheet',
                    href: filename
                });
            }

            assets[`${type}Tags`].push(htmlTagObjectToString(tagObject));
        }
    }

    // 所有 chunks 的 Map，用于根据 ID 查找 chunk
    const chunks = new Map();
    // 预取的 id
    const prefetchIds = new Set();

    // 包含当前页面的 chunks
    let curPageChunks;
    // prefetch Assets Array
    const prefetchAssets = [];

    if (hwpOptions.entry) {
        curPageChunks = fnChunkGroup(
            hwpOptions.entry,
            compilation.entrypoints.get(hwpOptions.entry),
            excludeChunksName
        );
    }

    if (curPageChunks) {
        const {assets, childAssets} = curPageChunks;
        if (isSmartyTpl) {
            assets.forEach(assetsFns);
        }
        if (childAssets && childAssets.prefetch) {
            prefetchAssets.push(...childAssets.prefetch);
        }
    } else {
        // 获取 chunks，默认不指定就是 all
        let chunksName = hwpOptions.chunks || hwpOptions.entry || 'all';
        if (typeof chunksName === 'string' && chunksName !== 'all') {
            chunksName = [chunksName];
        }

        curPageChunks = compilation.chunks
            .filter(chunk => {
                const {name, id} = chunk;
                // 添加到 map
                chunks.set(id, chunk);
                if (chunksName === 'all') {
                    // 全部的 chunks 都要过滤
                    // 按照 exclude 过滤
                    return excludeChunksName.indexOf(name) === -1;
                }
                // 过滤想要的chunks
                return chunksName.indexOf(name) !== -1 && excludeChunksName.indexOf(name) === -1;
            })
            .map(chunk => {
                const children = new Set();
                // 预取的内容只存在 children 内，不能 entry 就预取吧
                const childIdByOrder = chunk.getChildIdsByOrders();
                for (const chunkGroup of chunk.groupsIterable) {
                    for (const childGroup of chunkGroup.childrenIterable) {
                        for (const chunk of childGroup.chunks) {
                            children.add(chunk.id);
                        }
                    }
                }
                if (Array.isArray(childIdByOrder.prefetch) && childIdByOrder.prefetch.length) {
                    prefetchIds.add(...childIdByOrder.prefetch);
                }
                return {
                    ...chunk,
                    children
                };
            });
        if (isSmartyTpl) {
            // smarty tpl 的js 和 css 不能直接插入头，而是通过 placeholder 来设置
            curPageChunks.forEach(({id, name, children, files}) => {
                files.forEach(assetsFns);
            });
        }
        if (prefetchIds.size) {
            for (let id of prefetchIds) {
                const chunk = chunks.get(id);
                const files = chunk.files;
                prefetchAssets.push(...files);
            }
        }
    }

    // 下面需要判断下是不是 tpl 模式
    if (isSmartyTpl) {
        // 手动添加资源到项目tpl特定的位置
        let {cssTags = [], jsTags = []} = assets;
        const cssBlockTag = '{%block name="__css_asset"%}';
        const jsBlockTag = '{%block name="__script_asset"%}';
        let html = pluginData.html;
        // 替换 head body部分
        [[cssTags, cssBlockTag], [jsTags, jsBlockTag]].forEach(([assets, tag]) => {
            if (~html.indexOf(tag)) {
                html = html.split(tag).join(`${tag}${assets.join('')}`);
            } else {
                // 最后添加上
                html += tag + assets.join('') + '{%/block%}';
            }
        });
        pluginData.html = html;
    }

    if (prefetchAssets.length) {
        const prefetchTags = [];
        prefetchAssets.forEach(filename => {
            prefetchTags.push(`<link rel="prefetch" href="${publicPath}${filename}">`);
        });
        // 开始生成 prefetch html片段
        const prefetchTagHtml = prefetchTags.join('\n');
        if (isSmartyTpl) {
            let html = pluginData.html;
            const prefetchBlockTag = '{%block name="__prefetch_asset"%}';
            if (~html.indexOf(prefetchBlockTag)) {
                html = html.split(prefetchBlockTag).join(`${prefetchBlockTag}${prefetchTagHtml}`);
            } else {
                // 最后添加上
                html += prefetchBlockTag + prefetchTagHtml + '{%/block%}';
            }
            pluginData.html = html;
        } else {
            if (pluginData.html.indexOf('</head>') !== -1) {
                // 有 head，就在 head 结束前添加 prefetch link
                pluginData.html = pluginData.html.replace('</head>', prefetchTagHtml + '</head>');
            } else {
                // 没有 head 就加上个 head
                pluginData.html = pluginData.html.replace('<body>', '<head>' + prefetchTagHtml + '</head><body>');
            }
        }
    }

    return pluginData;
};
