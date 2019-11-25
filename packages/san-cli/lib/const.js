/**
 * @file 常量
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
exports.browserslist = [
    '> 1.2% in cn',
    'last 2 versions',
    'iOS >=8', // 这里有待商榷
    'android>4.4',
    'not bb>0',
    'not ff>0',
    'not ie>0',
    'not ie_mob>0'
];

exports.cssnanoOptions = {
    mergeLonghand: false,
    cssDeclarationSorter: false,
    normalizeUrl: false,
    discardUnused: false,
    // 避免 cssnano 重新计算 z-index
    zindex: false,
    reduceIdents: false,
    safe: true,
    // cssnano 集成了autoprefixer的功能
    // 会使用到autoprefixer进行无关前缀的清理
    // 关闭autoprefixer功能
    // 使用postcss的autoprefixer功能
    autoprefixer: false,
    discardComments: {
        removeAll: true
    }
};

exports.terserOptions = {
    comments: false,
    compress: {
        unused: true,
        // 删掉 debugger
        drop_debugger: true, // eslint-disable-line
        // 移除 console
        drop_console: true, // eslint-disable-line
        // 移除无用的代码
        dead_code: true // eslint-disable-line
    },
    ie8: false,
    safari10: true,
    warnings: false,
    toplevel: true
};
exports.eslintOptions = {
    'no-console': 2,
    'no-debugger': 2,
    'no-alert': 2,
    'no-unused-vars': 2,
    'no-undef': 2
};
