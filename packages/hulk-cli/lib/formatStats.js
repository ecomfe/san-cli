/**
 * @file formatStats 美化下 stats log
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
// const MAX_GZIPPED_SIZE = 150 * 1024;
const MAX_SIZE = 500 * 1024;
// const RECOMMEND_SIZE = 244;
// eslint-disable-next-line fecs-valid-jsdoc
module.exports = function formatStats(stats, destDir, api) {
    const fs = require('fs');
    const path = require('path');
    const zlib = require('zlib');
    const chalk = require('chalk');
    const flatten = require('./utils').flatten;

    const ConsoleTable = require('tty-table');

    const isJS = val => /\.js$/.test(val);
    const isCSS = val => /\.css$/.test(val);
    const isMinJS = val => /\.min\.js$/.test(val);

    let {assets, entrypoints, chunks} = stats;
    const entries = Object.keys(entrypoints).map(name => {
        const entry = entrypoints[name];
        const {prefetch = [], preload = []} = entry.children;

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

        entry.chunks.forEach(chunkId => {
            const children = chunks[chunkId].children;
            if (children.length) {
                asyncChunks.push(
                    ...flatten(
                        children
                            .filter(chunkId => !~prefetchChunks.indexOf(chunkId) && !~preloadChunks.indexOf(chunkId))
                            .map(chunkId => getAssetsFiles(chunks[chunkId].files))
                    )
                );
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
                if (!/\/async\.\w+\.js$/.test(asset.name)) {
                    totalSize += asset.size;
                    totalGzippedSize += gzippedSize;
                }
                const size = formatSize(asset.size);
                let colorfulName = /js$/.test(asset.name) ? chalk.green(asset.name) : chalk.blue(asset.name);
                maxHeaderWidth = Math.max(colorfulName.length, maxHeaderWidth);
                return [
                    colorfulName,
                    asset.isOverSizeLimit ? chalk.underline.red.bold(size) : size,
                    formatSize(gzippedSize),
                    asset.type ? asset.type : 'link'
                ];
            });

        const table = new ConsoleTable(
            [
                {value: 'File', align: 'right', width: Math.min(maxHeaderWidth + 8, 50)},
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
            return chalk.cyan(formatSize(size));
        });
        /* eslint-disable fecs-max-calls-in-template */
        return `  Entrypoints ${chalk.cyan(name)}${showReport ? chalk.yellow(' [big]') : ''}, initial Size ${
            size[0]
        }, Gzipped ${chalk.cyan(formatSize(totalGzippedSize))}.${table.render()}`;
        /* eslint-enable fecs-max-calls-in-template */
    }

    function getGzippedSize(asset) {
        const filepath = api.resolve(path.join(destDir, asset.name));
        const buffer = fs.readFileSync(filepath);
        return zlib.gzipSync(buffer).length;
    }

    const strArray = entries.map(({name, assets, prefetchAssets, preloadAssets, asyncAssets}) => {
        const files = [];
        [[assets], [prefetchAssets, 'prefetch'], [preloadAssets, 'preload'], [asyncAssets, 'async']].forEach(
            ([assets, type]) => {
                files.push(
                    ...assets.map(asset => {
                        return {
                            ...assetsMap.get(asset),
                            type
                        };
                    })
                );
            }
        );
        return getTableString(name, files);
    });

    return `\n${strArray.join('\n\n')}\n\n  ${chalk.gray('Images and other types of assets omitted.')}\n`;
};
