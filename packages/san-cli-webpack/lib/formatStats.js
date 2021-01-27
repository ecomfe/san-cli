/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file formatStats 美化下 stats log
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const ConsoleTable = require('tty-table');
const {textCommonColor} = require('san-cli-utils/color');
const {chalk} = require('san-cli-utils/ttyLogger');

const flatten = require('san-cli-utils/utils').flatten;

// const MAX_GZIPPED_SIZE = 150 * 1024;
const MAX_SIZE = 500 * 1024;
// const RECOMMEND_SIZE = 244;
module.exports = function formatStats(stats, destDir, {resolve}) {
    const isJS = val => /\.js$/.test(val);
    const isCSS = val => /\.css$/.test(val);
    const isMinJS = val => /\.min\.js$/.test(val);

    /* eslint-disable no-unused-vars */
    let {assets, entrypoints, assetsByChunkName, chunks} = stats;
    /* eslint-enable no-unused-vars */

    function getChunksById(id) {
        if (typeof id === 'number' && chunks[id]) {
            return chunks[id];
        }
        return chunks.find(chunk => chunk.id === id);
    }

    // 记录唯一 chunkid
    const uniChunksMap = new Set();

    // 1. 找出 entry 中的自身包含的 chunkid，排除公共chunk 的 id
    const commonChunksIds = new Set();
    Object.keys(entrypoints).map(name => {
        const entry = entrypoints[name];
        const entryData = entry.chunks || entry.assets || [];
        entryData.forEach(chunkId => {
            // 存在，那么就是公共模块 id，添加进公共模块 ids
            if (uniChunksMap.has(chunkId)) {
                commonChunksIds.add(chunkId);
            }
            else {
                uniChunksMap.add(chunkId);
            }
        });
    });

    const entries = Object.keys(entrypoints).map(name => {
        const entry = entrypoints[name] || {};
        const {prefetch = [], preload = []} = entry.children || {};

        let prefetchChunks = [];
        let preloadChunks = [];
        const prefetchAssets = flatten(
            prefetch.map(({chunks, assets}) => {
                prefetchChunks.push(...chunks);
                return getAssetsFiles(assets);
            })
        );
        const preloadAssets = flatten(
            preload.map(({chunks, assets}) => {
                preloadChunks.push(...chunks);
                return getAssetsFiles(assets);
            })
        );

        const asyncChunks = [];

        const entryData = entry.chunks || entry.assets || [];

        entryData.forEach(chunkId => {
            if (!commonChunksIds.has(chunkId)) {
                const chunk = getChunksById(chunkId);
                // 2. 非公共模块则查找他的 children
                // 这是因为公共模块查找出出来的 children 是依赖公共模块的全部依赖，所以不能说明是当前 entry 依赖到的模块，会导致计算不准确
                const children = chunk.children || [];
                if (children.length) {
                    asyncChunks.push(
                        ...flatten(
                            children
                                .filter(
                                    chunkId => !~prefetchChunks.indexOf(chunkId) && !~preloadChunks.indexOf(chunkId)
                                )
                                .map(() => getAssetsFiles(chunk.files))
                        )
                    );
                }
                else {
                    asyncChunks.push(...getAssetsFiles(chunk.files));
                }
            }
        });
        return {
            name,
            assets: entry.assets,
            prefetchAssets,
            preloadAssets,
            asyncAssets: [...new Set(asyncChunks)]
        };
    });

    const assetsMap = new Map(); // eslint-disable-line no-undef
    // 只提取 js 和 css
    assets = assets.filter(a => {
        if (isJS(a.name) || isCSS(a.name)) {
            const name = a.name;
            if (assetsMap.has(name)) {
                return false;
            }
            // 标识下 common 的模块类型
            if (a.chunks && a.chunks.length === 1 && commonChunksIds.has(a.chunks[0])) {
                a.type = ['common'];
            }
            else {
                a.type = [];
            }
            assetsMap.set(name, {
                ...a,
                gzippedSize: getGzippedSize(a)
            });
            // 处理 entry 合并计算资源大小
            return true;
        }
        return false;
    });

    function getAssetsFiles(files = []) {
        return files.filter(file => isJS(file) || isCSS(file));
    }
    function formatSize(size) {
        return (size / 1024).toFixed(2) + ' KiB';
    }

    function getTableString(name, files) {
        let totalSize = 0;
        let totalGzippedSize = 0;
        let maxHeaderWidth = 0;

        // 排序
        const assets = files
            .sort((a, b) => {
                /* eslint-disable curly */
                if (isJS(a.name) && isCSS(b.name)) return -1;
                if (isCSS(a.name) && isJS(b.name)) return 1;
                if (isMinJS(a.name) && !isMinJS(b.name)) return -1;
                if (!isMinJS(a.name) && isMinJS(b.name)) return 1;
                /* eslint-enable curly */
                return b.size - a.size;
            })
            .map(asset => {
                const gzippedSize = getGzippedSize(asset);
                // 不计算 prefetch 和 async 的大小
                if (!/\/async\.\w+\.js$/.test(asset.name) && !['prefetch', 'async'].includes(asset.type)) {
                    totalSize += asset.size;
                    totalGzippedSize += gzippedSize;
                }
                const size = formatSize(asset.size);
                let colorfulName = /js$/.test(asset.name) ? chalk.green(asset.name) : chalk.blue(asset.name);
                // 计算宽度
                maxHeaderWidth = Math.max(colorfulName.length, maxHeaderWidth);
                return [
                    colorfulName,
                    asset.isOverSizeLimit ? chalk.underline.red.bold(size) : size,
                    formatSize(gzippedSize),
                    asset.type.length ? asset.type.join('/') : 'link'
                ];
            });

        const table = new ConsoleTable(
            [
                {value: 'File', align: 'right', width: Math.min(maxHeaderWidth, 50)},
                {
                    value: 'Size',
                    align: 'center',
                    width: 16
                },
                {value: 'Gzipped', align: 'center', width: 16},
                {value: 'Type', align: 'center', width: 16}
            ],
            assets,
            {
                borderColor: 'blue'
            }
        );

        let showReport = false;
        const size = [[totalSize, MAX_SIZE]].map(([size, max]) => {
            if (size >= max) {
                showReport = true;
                return chalk.bgRed(formatSize(size));
            }
            return textCommonColor(formatSize(size));
        });
        return `  Entry Points ${
            textCommonColor(name)}${showReport ? chalk.yellowBright(' [big]') : ''
        }, Initial Size ${size[0]}, Gzipped ${textCommonColor(formatSize(totalGzippedSize))}.${table.render()}`;
    }

    function getGzippedSize(asset) {
        const filepath = resolve(path.join(destDir, asset.name));
        const buffer = fs.readFileSync(filepath);
        return zlib.gzipSync(buffer).length;
    }

    const strArray = entries.map(({name, assets, prefetchAssets, preloadAssets, asyncAssets}) => {
        const files = [];
        const uniqueSet = new Set();
        [[assets], [prefetchAssets, 'prefetch'], [preloadAssets, 'preload'], [asyncAssets, 'async']].forEach(
            ([assets, type]) => {
                files.push(
                    ...assets.map(asset => {
                        if (!uniqueSet.has(asset)) {
                            uniqueSet.add(asset);
                            asset = assetsMap.get(asset);
                            if (asset && Array.isArray(asset.type) && type) {
                                asset.type.push(type);
                            }
                            return asset;
                        }

                        return false;
                    })
                );
            }
        );
        return getTableString(
            name,
            files.filter(f => f)
        );
    });

    return `\n${strArray.join('\n\n')}\n\n  ${chalk.gray('Images and other types of assets omitted.')}\n`;
};
