/**
 * @file 工具函数全部整理到 san-cli-utils，推荐直接使用对应的文件，而不是直接用 index.js
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

['ttyLogger', 'path', 'utils', 'randomColor', 'env', 'color'].forEach(m => {
    Object.assign(exports, require(`./${m}`));
});
