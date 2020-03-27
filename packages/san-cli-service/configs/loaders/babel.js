/**
 * @file bable loader config
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
/* eslint-disable fecs-camelcase */
const factory = require('./loaderFactory');
module.exports = factory(() => ({
    name: 'babel-loader',
    loader: require.resolve('babel-loader'),
    options: {
        presets: require.resolve('@baidu/san-cli-plugin-babel/preset')
    }
}));
