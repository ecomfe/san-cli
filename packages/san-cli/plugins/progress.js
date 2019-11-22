/**
 * @file progress pugin
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const COLORS = [
    'cyan',
    'yellow',
    'orange',
    'redBright',
    'blueBright',
    'cyanBright',
    'greenBright',
    'magentaBright',
    '#ED6A5E',
    '#FFAC00',
    '#8232F5',
    '#62C554'
];
const LEN = COLORS.length;
module.exports = {
    id: 'built-in:plugin-progress',
    apply(api, projectOptions, options = {}) {
        // 添加progress
        api.chainWebpack(webpackConfig => {
            // 这里留个小功能：bar 颜色随机
            let color = COLORS[Math.floor(Math.random() * LEN)];
            options.color = color;
            webpackConfig.plugin('progress').use(require('webpackbar'), [options]);
        });
    }
};
