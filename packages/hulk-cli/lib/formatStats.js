/**
 * @file formatStats 美化下 stats log
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
// const MAX_GZIPPED_SIZE = 150 * 1024;
const MAX_SIZE = 500 * 1024;
const RECOMMEND_SIZE = 244;
// eslint-disable-next-line fecs-valid-jsdoc
module.exports = function formatStats(stats, dir, api) {
    const fs = require('fs');
    const path = require('path');
    const zlib = require('zlib');
    const chalk = require('chalk');
    const ConsoleTable = require('tty-table');
    const isJS = val => /\.js$/.test(val);
    const isCSS = val => /\.css$/.test(val);
    const isMinJS = val => /\.min\.js$/.test(val);

    const json = stats.toJson({
        hash: false,
        modules: false,
        chunks: true
    });
    const chunks = json.chunks;
    let assets = json.assets ? json.assets : json.children.reduce((acc, child) => acc.concat(child.assets), []);

    const assetsMap = new Map(); // eslint-disable-line no-undef
    let maxHeaderWidth = 0;
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
            maxHeaderWidth = Math.max(maxHeaderWidth, name.length);
            // 处理 entry 合并计算资源大小
            return true;
        }
        return false;
    });
    // 查找出来 entry 的文件
    const entries = chunks
        .filter(chunk => chunk.entry)
        .map(({files, siblings, children, names}) => {
            files = getAssetsFiles(files);
            siblings.forEach(id => {
                if (chunks[id].files.length) {
                    files.push(...getAssetsFiles(chunks[id].files));
                }
            });
            children.forEach(id => {
                if (chunks[id].files.length) {
                    files.push(...getAssetsFiles(chunks[id].files));
                }
            });
            return {
                name: names.join('-'),
                files: files.map(file => assetsMap.get(file))
            };
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

                return [
                    /js$/.test(asset.name)
                        ? chalk.green(path.join(dir, asset.name))
                        : chalk.blue(path.join(dir, asset.name)),
                    formatSize(asset.size),
                    formatSize(gzippedSize)
                ];
            });

        const table = new ConsoleTable(
            [
                {value: 'File', align: 'right', width: Math.min(maxHeaderWidth + 8, 50)},
                {
                    value: 'Size',
                    align: 'center',
                    width: 16,
                    formatter(value) {
                        const size = parseInt(value, 10);
                        if (!isNaN(size) && size >= RECOMMEND_SIZE) {
                            return chalk.underline.red.bold(value);
                        }
                        return value;
                    }
                },
                {value: 'Gzipped', align: 'center', width: 16}
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
        const filepath = api.resolve(path.join(dir, asset.name));
        const buffer = fs.readFileSync(filepath);
        return zlib.gzipSync(buffer).length;
    }

    const strArray = entries.map(({name, files}) => getTableString(name, files));

    return `\n${strArray.join('\n\n')}\n\n  ${chalk.gray('Images and other types of assets omitted.')}\n`;
};
