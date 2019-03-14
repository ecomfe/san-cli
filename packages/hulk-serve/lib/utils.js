/**
 * @file lib/utils
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const globby = require('globby');

exports.toPlugin = id => ({id, apply: require(id)});

exports.getAssetPath = (options, filePath, placeAtRootIfRelative) =>
    options.assetsDir ? path.posix.join(options.assetsDir, filePath) : filePath;

exports.resolveLocal = function resolveLocal(...args) {
    return path.join(__dirname, '../../', ...args);
};

/**
 * 根据目录结构，将 src/pages 的页面单独生成 webpack 的entry，用于多页面代码拆分
 * 约定：
 *  * pages 的页面是每个页面单独打包的
 *  * pages/xxx/index.js
 *  * 本代码只会检测 pages/xxx/index.js 下面存在则会放进 webpack 的 entry 对象中
 */
let entries = new Map();
exports.getEntry = (patterns = 'pages/*/**.js', options = {useCache: true}) => {
    const cache = entries.get(patterns);
    if (options.useCache && cache && typeof cache === 'object' && Object.keys(cache).length) {
        return cache;
    }

    const paths = globby.sync(patterns, {
        cwd: path.join(__dirname, '../src')
    });
    const rs = {};
    paths.forEach(v => {
        const name = v.split('/')[1];
        let p = path.join('./src', v);
        if (!p.startsWith('.')) {
            p = './' + p;
        }

        rs[name] = p;
    });
    entries.set(patterns, rs);
    return rs;
};
